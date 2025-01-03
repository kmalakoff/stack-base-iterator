import once from 'call-once-fn';
import FIFO from 'fifo';

import createProcesor from './createProcessor';
import drainStack from './drainStack';
import fifoRemove from './fifoRemove';
import processOrQueue from './processOrQueue';

import type { DefaultFunction, StackOptions } from './types';

export type * from './types';
export default class StackBaseIterator implements AsyncIterator<unknown> {
  options: StackOptions;
  queued: DefaultFunction[];
  processors: DefaultFunction[];
  stack: unknown[];
  entries: unknown[];
  links: unknown[];
  processing: DefaultFunction[];
  destroyed: unknown;
  done: unknown;

  constructor(options: StackOptions = {}) {
    this.options = { ...options };
    this.options.error =
      options.error ||
      function defaultError(err) {
        return !!err; // fail on errors
      };

    this.queued = FIFO() as unknown as DefaultFunction[];
    this.processors = FIFO() as unknown as DefaultFunction[];
    this.stack = FIFO() as unknown as unknown[];
    this.entries = FIFO() as unknown as unknown[];
    this.links = FIFO() as unknown as unknown[];
    this.processing = FIFO() as unknown as DefaultFunction[];
  }

  destroy(err) {
    if (this.destroyed) throw new Error('Already destroyed');
    this.destroyed = true;
    this.end(err);
  }

  push(item) {
    if (this.done) return console.log('Attempting to push on a done iterator');
    this.stack.push(item);
    drainStack(this);
  }

  end(err) {
    if (this.done) return;
    this.done = true;
    while (this.processors.length) this.processors.pop()(err || true);
    while (this.processing.length) err ? this.processing.pop()(err) : this.processing.pop()(null, null);
    while (this.queued.length) err ? this.queued.pop()(err) : this.queued.pop()(null, null);
    while (this.stack.length) this.stack.pop();
  }

  next(callback) {
    if (typeof callback === 'function') return processOrQueue(this, once(callback));

    const self = this;
    return new Promise(function nextPromise(resolve, reject) {
      self.next((err, result) => (err ? reject(err) : resolve(result)));
    });
  }

  forEach(fn, options, callback) {
    const self = this;
    if (typeof fn !== 'function') throw new Error('Missing each function');
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    if (typeof callback === 'function') {
      if (this.done) return callback(null, true);
      options = options || {};
      options = {
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
        stop: function stop() {
          return self.done || self.queued.length >= self.stack.length;
        },
      };

      let processor = createProcesor(this.next.bind(this), options, function processorCallback(err) {
        if (!self.destroyed) fifoRemove(self.processors, processor);
        processor = null;
        options = null;
        const done = !self.stack.length;
        if ((err || done) && !self.done) self.end(err);
        return callback(err, self.done || done);
      });
      this.processors.push(processor);
      processor();
      return;
    }

    return new Promise((resolve, reject) => self.forEach(fn, options, (err, done) => (err ? reject(err) : resolve(done))));
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
