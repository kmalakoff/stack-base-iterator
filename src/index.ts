import once from 'call-once-fn';
import LinkedList from './LinkedList.js';

import createProcesor from './createProcessor.js';
import drainStack from './drainStack.js';
import processOrQueue from './processOrQueue.js';

import type { AbstractIterator, EachFunction, ForEachOptions, ProcessCallback, Processor, ProcessorOptions, StackFunction, StackOptions } from './types.js';

export type * from './types.js';
export default class StackBaseIterator<T> implements AsyncIterator<T> {
  protected done: boolean;
  protected stack: LinkedList<StackFunction<T>>;
  protected processors: LinkedList<Processor>;
  protected queued: LinkedList<ProcessCallback>;
  protected processing: LinkedList<ProcessCallback>;

  protected options: StackOptions;
  protected entries: LinkedList<T>;
  protected destroyed: boolean;

  constructor(options: StackOptions = {}) {
    this.options = { ...options };
    this.options.error =
      options.error ||
      function defaultError(err) {
        return !!err; // fail on errors
      };

    this.done = false;
    this.stack = new LinkedList<StackFunction<T>>();
    this.processors = new LinkedList<Processor>();
    this.queued = new LinkedList<ProcessCallback>();
    this.processing = new LinkedList<ProcessCallback>();
    this.entries = new LinkedList<T>();
  }

  isDone() {
    return this.done;
  }

  push(fn: StackFunction<T>) {
    if (this.done) return console.log('Attempting to push on a done iterator');
    this.stack.push(fn);
    drainStack<T>(this as unknown as AbstractIterator<T>);
  }

  next(...[value]: [] | [unknown]): Promise<IteratorResult<T, unknown>> {
    const callback = value as ProcessCallback;
    if (typeof callback === 'function') return processOrQueue(this as unknown as AbstractIterator<T>, once(callback));

    return new Promise((resolve, reject) => {
      this.next((err, result) => (err ? reject(err) : resolve(result)));
    });
  }

  forEach(fn: EachFunction<T>, options?: ForEachOptions | ProcessCallback, callback?: ProcessCallback): undefined | Promise<boolean> {
    if (typeof fn !== 'function') throw new Error('Missing each function');
    if (typeof options === 'function') {
      callback = options as ProcessCallback;
      options = {};
    }

    if (typeof callback === 'function') {
      if (this.done) {
        callback(null, true);
        return;
      }
      options = options || {};
      const processorOptions: ProcessorOptions<T> = {
        each: fn,
        callbacks: options.callbacks || false,
        concurrency: options.concurrency || 1,
        limit: options.limit || Infinity,
        error:
          options.error ||
          function defaultError() {
            return true; // default is exit on error
          },
        total: 0,
        counter: 0,
        stop: () => {
          return this.done || this.queued.length >= this.stack.length;
        },
      };

      let processor = createProcesor<T>(this.next.bind(this), processorOptions, (err) => {
        if (!this.destroyed) this.processors.removeValue(processor);
        processor = null;
        options = null;
        const done = !this.stack.length;
        if ((err || done) && !this.done) this.end(err);
        return callback(err, this.done || done);
      });
      this.processors.push(processor);
      processor();
      return;
    }

    return new Promise((resolve, reject) =>
      this.forEach(fn, options, (err?: Error, done?: boolean) => {
        err ? reject(err) : resolve(done);
      })
    );
  }

  end(err?: Error) {
    if (this.done) return;
    this.done = true;
    while (this.processors.length > 0) this.processors.pop()(err || true);
    while (this.processing.length > 0) err ? this.processing.pop()(err) : this.processing.pop()(null, null);
    while (this.queued.length > 0) err ? this.queued.pop()(err) : this.queued.pop()(null, null);
    while (this.stack.length > 0) this.stack.pop();
  }

  destroy(err?: Error) {
    if (this.destroyed) throw new Error('Already destroyed');
    this.destroyed = true;
    this.end(err);
  }
}

if (typeof Symbol !== 'undefined' && Symbol.asyncIterator) {
  StackBaseIterator.prototype[Symbol.asyncIterator] = function asyncIterator() {
    const self = this;
    return {
      next: function next() {
        return self.next().then(function nextCallback(value) {
          return Promise.resolve({ value: value, done: value === null });
        });
      },
      destroy: function destroy() {
        self.destroy();
        return Promise.resolve();
      },
    };
  };
}
