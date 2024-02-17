export default class StackBaseIterator {
    constructor(options: any);
    options: object;
    queued: FIFO<any>;
    processors: FIFO<any>;
    stack: FIFO<any>;
    entries: FIFO<any>;
    links: FIFO<any>;
    processing: FIFO<any>;
    destroy(err: any): void;
    destroyed: boolean;
    push(item: any): void;
    end(err: any): void;
    done: boolean;
    next(callback: any): any;
    forEach(fn: any, options: any, callback: any): any;
}
import FIFO from 'fifo';
