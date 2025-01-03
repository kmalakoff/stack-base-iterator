export default function fifoRemove(fifo, value) {
  for (let node = fifo.node; node; node = fifo.next(node)) {
    if (node.value === value) {
      fifo.remove(node);
      return true;
    }
  }
  return false;
}
