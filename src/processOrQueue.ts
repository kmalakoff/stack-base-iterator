import compat from 'async-compat';

import asap from 'asap';

import type { AbstractIterator, ProcessCallback } from './types.js';

export default function processOrQueue<T>(iterator: AbstractIterator<T>, callback: ProcessCallback<T>): undefined {
  if (iterator.done) {
    callback(null, null);
    return;
  }

  // nothing to process so queue
  if (!iterator.stack.length) {
    iterator.queued.push(callback);
    return;
  }

  // process next
  const next = iterator.stack.pop();
  iterator.processing.push(callback);
  next(iterator, (err?: Error, result?: T): undefined => {
    // break call stack
    asap(() => {
      iterator.processing.remove(callback);
      if (iterator.done) return callback(null, null); // early exit
      if (err && compat.defaultValue(iterator.options.error(err), true)) err = null; // skip error

      const done = iterator.stack.length <= 0 && iterator.processing.length <= 0;
      !done && !err && !result ? processOrQueue<T>(iterator, callback) : callback(err, result || null);
      if (done && !iterator.done) iterator.end(); // end
    });
  });
}
