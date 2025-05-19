export type DefaultFunction = (arg1?: unknown, arg2?: unknown) => void;
export type Callback = (error?: Error, value?: unknown) => void;
export type EachFunction<T> = (value: T, callback?: Callback) => undefined | Promise<unknown>;

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
