export type DefaultFunction = (arg1?: unknown, arg2?: unknown) => void;

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

export interface Iterator<_T> {
  done: boolean;
  stack: DefaultFunction[];
  queued: DefaultFunction[];
  processors: DefaultFunction[];
  processing: DefaultFunction[];
  options: StackOptions;
  end: () => undefined;
}
