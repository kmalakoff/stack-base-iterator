import type LinkedList from './LinkedList.js';

export { default as LinkedList } from './LinkedList.js';

export type ProcessCallback = (error?: Error, done?: boolean) => void;
export type Processor = (doneOrError?: Error | boolean) => void;

export type EachCallback = (error?: Error, value?: unknown) => void;
export type EachFunctionCallback<T> = (value: T, callback: EachCallback) => undefined;
export type EachFunctionPromise<T> = (value: T) => Promise<unknown>;
export type EachFunction<T> = EachFunctionCallback<T> | EachFunctionPromise<T>;

export type Next = (value: EachCallback) => void;

export interface StackOptions {
  error?: (err: NodeJS.ErrnoException) => boolean;
}

export interface ForEachOptions {
  error?: (err: NodeJS.ErrnoException) => boolean;
  callbacks?: boolean;
  concurrency?: number;
  limit?: number;
}

export interface ProcessorOptions<T> extends ForEachOptions {
  each: EachFunction<T>;
  counter: number;
  total: number;
  stop: (count?: number) => boolean;
  done?: boolean;
  err?: Error;
}

export type StackFunction<T> = (iterator: AbstractIterator<T>, callback: EachCallback) => void;

export interface AbstractIterator<T> {
  done: boolean;
  stack: LinkedList<StackFunction<T>>;
  processors: LinkedList<Processor>;
  queued: LinkedList<ProcessCallback>;
  processing: LinkedList<ProcessCallback>;
  options: StackOptions;
  end: () => undefined;
}
