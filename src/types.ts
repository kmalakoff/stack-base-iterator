export type { EachDoneCallback, EachFunction, ForEachOptions, NextCallback, ProcessCallback, Processor, ProcessorOptions } from 'maximize-iterator';
export interface StackOptions {
  error?: (err: NodeJS.ErrnoException) => boolean | void;
}

export type ValueCallback<T, TReturn = unknown> = (error?: Error, value?: IteratorResult<T, TReturn> | undefined) => void;
