import FIFO from 'fifo';

export default class LinkedList<T>  {
  private fifo = new FIFO<T>();

  get length() { 
    return this.fifo.length;
  }
  last(): T {
    return this.fifo.last();
  }
  pop(): T {
    return this.fifo.pop() as T;
  }
  push(value: T): LinkedList<T> {
    this.fifo.push(value);
    return this;
  }
  remove(value: T): boolean {
    for (let node = this.fifo.node; node; node = this.fifo.next(node)) {
      if (node.value === value) {
        this.fifo.remove(node);
        return true;
      }
    }
    return false;
  }
}
