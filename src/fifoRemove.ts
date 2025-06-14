import type FIFO from 'fifo';

export default function fifoRemove<T>(fifo: FIFO<T>, value: T): boolean {
  for (let node = fifo.node; node; node = fifo.next(node)) {
    if (node.value === value) {
      fifo.remove(node);
      return true;
    }
  }
  return false;
}
