import type LinkedList from './LinkedList.js';

export type ProcessCallback<T> = (error?: Error, value?: T | null) => undefined;
export type Processor = (doneOrError?: Error | boolean) => undefined;

export type EachDoneCallback = (error?: Error, value?: boolean) => undefined;
export type EachCallback<T> = (value: T, callback: EachDoneCallback) => undefined;
export type EachPromise<T> = (value: T) => Promise<boolean>;
export type EachFunction<T> = EachCallback<T> | EachPromise<T>;

export type ValueCallback<T> = (error?: Error, value?: T) => boolean;
export type Next<T> = (callback: ProcessCallback<T>) => undefined;

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

export type StackFunction<T> = (iterator: AbstractIterator<T>, callback: ValueCallback<T>) => void;

export interface AbstractIterator<T> {
  done: boolean;
  stack: LinkedList<StackFunction<T>>;
  processors: LinkedList<Processor>;
  queued: LinkedList<ProcessCallback<T>>;
  processing: LinkedList<ProcessCallback<T>>;
  options: StackOptions;
  end: () => undefined;
}
