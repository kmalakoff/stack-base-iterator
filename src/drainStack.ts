import processOrQueue from './processOrQueue.js';

import type { AbstractIterator } from './types.js';

function canProcess<T>(iterator: AbstractIterator<T>): boolean {
  if (iterator.done || !iterator.stack.length) return false;
  if (iterator.queued.length) return true;
  if (!iterator.processors.length) return false;
  iterator.processors.head()(false);
  if (iterator.done) return false;
  return iterator.queued.length > 0;
}

export default function drainStack<T>(iterator: AbstractIterator<T>): undefined {
  while (canProcess<T>(iterator)) {
    processOrQueue(iterator, iterator.queued.pop());
  }
}
