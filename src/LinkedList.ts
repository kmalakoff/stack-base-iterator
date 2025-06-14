import FIFO from 'fifo';

export default class LinkedList<T> extends FIFO<T> {
  // @ts-ignore
  pop(): T {
    return super.pop() as T;
  }
  removeValue(value: T): boolean {
    for (let node = this.node; node; node = this.next(node)) {
      if (node.value === value) {
        this.remove(node);
        return true;
      }
    }
    return false;
  }
}
