import type FIFO from 'fifo';
import processOrQueue from './processOrQueue.js';

import type { DefaultFunction, Iterator } from './types.js';

function canProcess<T>(iterator: Iterator<T>): boolean {
  if (iterator.done || !iterator.stack.length) return false;
  if (iterator.queued.length) return true;
  if (!iterator.processors.length) return false;
  (iterator.processors as unknown as FIFO<DefaultFunction>).first()(false);
  if (iterator.done) return false;
  return iterator.queued.length > 0;
}

export default function drainStack<T>(iterator: Iterator<T>): undefined {
  while (canProcess<T>(iterator)) {
    processOrQueue(iterator, iterator.queued.pop());
  }
}
