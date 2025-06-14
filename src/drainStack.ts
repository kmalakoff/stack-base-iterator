import processOrQueue from './processOrQueue.js';

import type { AbstractIterator } from './types.js';

function canProcess<T>(iterator: AbstractIterator<T>): boolean {
  if (iterator.done || !iterator.stack.length) return false;
  if (iterator.queued.length) return true;
  if (iterator.processors.length <= 0) return false;
  iterator.processors.first()(false);
  if (iterator.done) return false;
  return iterator.queued.length > 0;
}

export default function drainStack<T>(iterator: AbstractIterator<T>): undefined {
  while (canProcess<T>(iterator)) {
    processOrQueue(iterator, iterator.queued.pop());
  }
}
