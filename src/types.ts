import type { ProcessCallback, Processor } from 'maximize-iterator';
import type LinkedList from './LinkedList.js';

export type { ForEachOptions, EachDoneCallback, EachFunction, NextCallback, Processor, ProcessorOptions, ProcessCallback } from 'maximize-iterator';
export interface StackOptions {
  error?: (err: NodeJS.ErrnoException) => boolean;
}

export type ValueCallback<T, TReturn = unknown> = (error?: Error, value?: IteratorResult<T, TReturn> | undefined) => undefined;
export type StackFunction<T> = (iterator: AbstractIterator<T>, callback: ValueCallback<T>) => void;

export interface AbstractIterator<T> {
  done: boolean;
  stack: StackFunction<T>[];
  queued: ProcessCallback<T>[];
  processors: LinkedList<Processor>;
  processing: LinkedList<ProcessCallback<T>>;
  options: StackOptions;
  end: () => undefined;
}
