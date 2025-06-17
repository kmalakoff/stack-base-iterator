import compat from 'async-compat';

import type { AbstractIterator, ProcessCallback } from './types.js';

export default function processOrQueue<T, TReturn>(iterator: AbstractIterator<T>, callback: ProcessCallback<T>): undefined {
  if (iterator.done) {
    callback(null, { done: true, value: null });
    return;
  }

  // nothing to process so queue
  if (iterator.stack.length === 0) {
    iterator.queued.push(callback);
    return;
  }

  // process next
  const next = iterator.stack.pop();
  iterator.processing.push(callback);
  next(iterator, (err?: Error, result?: IteratorResult<T, TReturn> | undefined): undefined => {
    iterator.processing.remove(callback);

    // done
    if (iterator.done)
      return callback(null, {
        done: true,
        value: null,
      });

    // skip error
    if (err && compat.defaultValue(iterator.options.error(err), true)) err = null;

    // handle callback
    if (err) callback(err);
    else if (!result) processOrQueue(iterator, callback);
    else callback(null, result);

    // done
    if (iterator.stack.length === 0 && iterator.processing.length === 0 && !iterator.done) iterator.end(); // end
  });
}
