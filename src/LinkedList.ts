import FIFO from 'fifo';

export default class LinkedList<T> extends FIFO<T> {
  // @ts-ignore
  pop(): T {
    return super.pop() as T;
  }
  // @ts-ignore
  remove(value: T): boolean {
    // @ts-ignore - a node called from the base class
    if (value.list && value.prev && value.next) return super.remove(value);

    for (let node = this.node; node; node = this.next(node)) {
      if (node.value === value) {
        super.remove(node);
        return true;
      }
    }
    return false;
  }
}
