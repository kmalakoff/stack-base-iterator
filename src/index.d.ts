import LinkedList from './LinkedList.ts';
import type { EachDoneCallback, EachFunction, ForEachOptions, ProcessCallback, Processor, StackOptions, ValueCallback } from './types.ts';
export type StackFunction<T, TReturn = unknown, TNext = unknown> = (iterator: StackBaseIterator<T, TReturn, TNext>, callback: ValueCallback<T>) => void;
// biome-ignore lint/suspicious/noShadowRestrictedNames: Legacy compatibility
declare const Symbol: SymbolConstructor;
export { default as LinkedList } from './LinkedList.ts';
export type * from './types.ts';
export default class StackBaseIterator<T, TReturn = unknown, TNext = unknown> implements AsyncIterableIterator<T, TReturn, TNext> {
  protected done: boolean;
  protected stack: StackFunction<T, TReturn, TNext>[];
  protected queued: ProcessCallback<T>[];
  protected processors: LinkedList<Processor>;
  protected processing: LinkedList<ProcessCallback<T>>;
  protected options: StackOptions;
  protected destroyed: boolean;
  private flushing;
  private pending;
  private endScheduled;
  constructor(options?: StackOptions);
  isDone(): boolean;
  push(fn: StackFunction<T, TReturn, TNext>, ...rest: StackFunction<T, TReturn, TNext>[]): void;
  next(): Promise<IteratorResult<T, TReturn>>;
  [Symbol.asyncIterator](): AsyncIterableIterator<T, TReturn, TNext>;
  forEach(fn: EachFunction<T>, callback: EachDoneCallback): void;
  forEach(fn: EachFunction<T>, options: ForEachOptions, callback: EachDoneCallback): void;
  forEach(fn: EachFunction<T>, options?: ForEachOptions): Promise<boolean>;
  end(err?: Error): void;
  destroy(err?: Error): void;
  private _pump;
  private _scheduleEndCheck;
  private _processOrQueue;
}
