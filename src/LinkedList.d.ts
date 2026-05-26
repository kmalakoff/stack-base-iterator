export default class LinkedList<T> {
  private head;
  private tail;
  length: number;
  constructor();
  last(): T;
  push(value: T): LinkedList<T>;
  pop(): T;
  remove(value: T): T;
}
