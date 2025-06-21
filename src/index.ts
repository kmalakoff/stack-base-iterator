import compat from 'async-compat';
import nextCallback from 'iterator-next-callback';
import { createProcessor } from 'maximize-iterator';
import Pinkie from 'pinkie-promise';
import LinkedList from './LinkedList.ts';

import type { EachDoneCallback, EachFunction, ForEachOptions, ProcessCallback, Processor, ProcessorOptions, StackOptions, ValueCallback } from './types.ts';

export type StackFunction<T, TReturn = unknown, TNext = unknown> = (iterator: StackBaseIterator<T, TReturn, TNext>, callback: ValueCallback<T>) => void;

// biome-ignore lint/suspicious/noShadowRestrictedNames: Legacy
const Symbol: SymbolConstructor = typeof global.Symbol === 'undefined' ? ({ asyncIterator: '@@' } as unknown as SymbolConstructor) : global.Symbol;

export { default as LinkedList } from './LinkedList.ts';
export type * from './types.ts';
export default class StackBaseIterator<T, TReturn = unknown, TNext = unknown> implements AsyncIterableIterator<T, TReturn, TNext> {
  protected done: boolean;
  protected stack: StackFunction<T, TReturn, TNext>[];
  protected queued: ProcessCallback<T>[];
  protected processors: LinkedList<Processor>;
  protected processing: LinkedList<ProcessCallback<T>>;

  protected options: StackOptions;
  protected destroyed: boolean;

  constructor(options: StackOptions = {}) {
    this.options = { ...options };
    this.options.error =
      options.error ||
      function defaultError(err) {
        return !!err; // fail on errors
      };

    this.done = false;
    this.stack = [] as StackFunction<T, TReturn, TNext>[];
    this.queued = [] as ProcessCallback<T>[];
    this.processors = new LinkedList<Processor>();
    this.processing = new LinkedList<ProcessCallback<T>>();
  }

  isDone() {
    return this.done;
  }

  push(fn: StackFunction<T, TReturn, TNext>, ...rest: StackFunction<T, TReturn, TNext>[]) {
    if (this.done) return console.log('Attempting to push on a done iterator');
    this.stack.push(fn);
    !rest.length || rest.forEach((x) => this.stack.push(x));
    this._pump();
  }

  next(): Promise<IteratorResult<T, TReturn>> {
    return new Pinkie((resolve, reject) => {
      this._processOrQueue((err, result: IteratorResult<T, TReturn>) => {
        err ? reject(err) : resolve(result);
      });
    });
  }

  [Symbol.asyncIterator](): AsyncIterableIterator<T, TReturn, TNext> {
    return this;
  }

  forEach(fn: EachFunction<T>, options?: ForEachOptions | EachDoneCallback, callback?: EachDoneCallback): undefined | Promise<boolean> {
    if (typeof fn !== 'function') throw new Error('Missing each function');
    if (typeof options === 'function') {
      callback = options as EachDoneCallback;
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
        canProcess: () => {
          return !this.done && this.stack.length > 0 && this.queued.length < this.stack.length;
        },
      };

      let processor = createProcessor<T>(nextCallback<T, TReturn, TNext>(this), processorOptions, (err) => {
        if (!this.destroyed) this.processors.remove(processor);
        processor = null;
        options = null;
        const done = !this.stack.length;
        if ((err || done) && !this.done) this.end(err);
        return callback(err, this.done || done);
      });
      this.processors.push(processor);
      this._pump();
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
    while (this.processing.length > 0) err ? this.processing.pop()(err) : this.processing.pop()(null, { done: true, value: null });
    while (this.queued.length > 0) err ? this.queued.pop()(err) : this.queued.pop()(null, { done: true, value: null });
    while (this.stack.length > 0) this.stack.pop();
  }
  destroy(err?: Error) {
    if (this.destroyed) throw new Error('Already destroyed');
    this.destroyed = true;
    this.end(err);
  }

  private _pump() {
    if (!this.done && this.processors.length > 0 && this.stack.length > 0 && this.stack.length > this.queued.length) this.processors.last()(false); // try to queue more
    while (this.stack.length > 0 && this.queued.length > 0) {
      this._processOrQueue(this.queued.pop());
      if (!this.done && this.processors.length > 0 && this.stack.length > 0 && this.stack.length > this.queued.length) this.processors.last()(false); // try to queue more
    }
  }

  private _processOrQueue(callback: ProcessCallback<T>): undefined {
    if (this.done) {
      callback(null, { done: true, value: null });
      return;
    }

    // nothing to process so queue
    if (this.stack.length === 0) {
      this.queued.push(callback);
      return;
    }

    // process next
    const next = this.stack.pop();
    this.processing.push(callback);
    next(this, (err?: Error, result?: IteratorResult<T, TReturn> | undefined): undefined => {
      this.processing.remove(callback);

      // done
      if (this.done)
        return callback(null, {
          done: true,
          value: null,
        });

      // skip error
      if (err && compat.defaultValue(this.options.error(err), true)) err = null;

      // handle callback
      if (err) callback(err);
      else if (!result) this._processOrQueue(callback);
      else callback(null, result);

      // done
      if (this.stack.length === 0 && this.processing.length === 0 && !this.done) this.end(); // end
    });
  }
}
