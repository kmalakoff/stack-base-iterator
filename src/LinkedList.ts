class Node<T> {
  value: T;
  prev: Node<T>;
  next: Node<T>;

  constructor(value: T) {
    this.value = value;
    this.prev = null;
    this.next = null;
  }
}

export default class LinkedList<T> {
  private head: Node<T>;
  private tail: Node<T>;
  length: number;

  constructor() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  last(): T {
    return this.tail ? this.tail.value : undefined;
  }

  push(value: T): LinkedList<T> {
    const newNode = new Node<T>(value);
    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      newNode.prev = this.tail;
      this.tail.next = newNode;
      this.tail = newNode;
    }
    this.length++;
    return this;
  }

  pop(): T {
    if (!this.head) return undefined;
    const poppedNode = this.tail;
    if (this.length === 1) {
      this.head = null;
      this.tail = null;
    } else {
      this.tail = poppedNode.prev;
      this.tail.next = null;
      poppedNode.prev = null;
    }
    this.length--;
    return poppedNode.value;
  }

  remove(value: T): T {
    if (!this.head) return undefined;

    let currentNode = this.head;
    while (currentNode) {
      if (currentNode.value === value) {
        if (currentNode === this.head) {
          this.head = currentNode.next;
          if (this.head) this.head.prev = null;
          else this.tail = null;
        } else if (currentNode === this.tail) {
          this.tail = currentNode.prev;
          this.tail.next = null;
        } else {
          currentNode.prev.next = currentNode.next;
          currentNode.next.prev = currentNode.prev;
        }
        this.length--;
        return currentNode.value;
      }
      currentNode = currentNode.next;
    }
    return undefined;
  }
}
