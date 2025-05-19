export interface StackOptions {
  error?: (err: NodeJS.ErrnoException) => boolean;
}

export type DefaultFunction = (arg1?: unknown, arg2?: unknown) => void;
