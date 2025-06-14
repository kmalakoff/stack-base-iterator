import compat from 'async-compat';
import type FIFO from 'fifo';

import asap from 'asap';
import fifoRemove from './fifoRemove.js';

import type { DefaultFunction, EachCallback, Iterator } from './types.js';

export default function processOrQueue<T>(iterator: Iterator<T>, callback: EachCallback): undefined {
  if (iterator.done) {
    callback(null, null);
    return;
  }

  // nothing to process so queue
  if (!iterator.stack.length) {
    iterator.queued.unshift(callback);
    return;
  }

  // process next
  const next = iterator.stack.pop();
  iterator.processing.push(callback);
  next(iterator, function nextCallback(err: Error, result: T) {
    // break call stack
    asap(() => {
      // done is based on stack being empty and not error state as the user may choose to skip the error
      fifoRemove<DefaultFunction>(iterator.processing as unknown as FIFO<DefaultFunction>, callback);
      if (iterator.done) return callback(null, null); // early exit
      if (err && compat.defaultValue(iterator.options.error(err), true)) err = null; // skip error

      const done = !iterator.stack.length && iterator.processing.length <= 0;
      !done && !err && !result ? processOrQueue(iterator, callback) : callback(err, result || null);
      if (done && !iterator.done) iterator.end(); // end
    });
  });
}
