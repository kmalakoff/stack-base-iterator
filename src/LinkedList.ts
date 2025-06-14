import fifo from 'fifo';

export default class LinkedList<T> {
  private list: fifo<T>;
  length: number;

  constructor() {
    this.list = new fifo<T>();
  }

  pop(): T {
    const value = this.list.pop();
    this.length = this.list.length;
    return value as T;
  }

  push(value: T): LinkedList<T> {
    this.list.push(value);
    this.length = this.list.length;
    return this;
  }

  head(): T {
    return this.list.last();
  }

  remove(value: T): boolean {
    for (let node = this.list.node; node; node = this.list.next(node)) {
      if (node.value === value) {
        this.list.remove(node);
        this.length = this.list.length;
        return true;
      }
    }
    return false;
  }
}
