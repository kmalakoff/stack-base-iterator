import compat from 'async-compat';

import type { Next, ProcessCallback, Processor, ProcessorOptions } from './types.js';

const isError = (err?: Error): boolean => err && err.stack !== undefined && err.message !== undefined;

function processDone<T>(err: Error, options: ProcessorOptions<T>, callback: ProcessCallback) {
  // mark this iteration done
  options.err = options.err || err;
  options.done = true;

  // process done
  if (!options.done || options.counter > 0) return false;
  callback(options.err, options.done);
  return true;
}

function processResult(err, keep, options, callback) {
  options.counter--;

  // mark this iteration done
  if ((err && compat.defaultValue(options.error(err), false)) || (!err && !compat.defaultValue(keep, true))) {
    options.err = options.err || err;
    options.done = true;
  }

  // process done
  if (!options.done || options.counter > 0) return false;
  callback(options.err, options.done);
  return true;
}

export default function createProcessor<T>(next: Next, options: ProcessorOptions<T>, callback: ProcessCallback): Processor {
  let isProcessing = false;
  return function processor(doneOrError?: Error | boolean) {
    const error = doneOrError as Error;
    if (doneOrError && processDone(isError(error) ? error : null, options, callback)) return;
    if (isProcessing) return;
    isProcessing = true;

    let counter = 0;
    while (options.counter < options.concurrency) {
      if (options.done || options.stop(counter++)) break;
      if (options.total >= options.limit) return processDone(null, options, callback);
      options.total++;
      options.counter++;

      next((err, value) => {
        if (err || value === null) {
          return !processResult(err, false, options, callback) && !isProcessing ? processor() : undefined;
        }
        compat.asyncFunction(options.each, options.callbacks, value, (err, keep) => (!processResult(err, keep, options, callback) && !isProcessing ? processor() : undefined));
      });
    }

    isProcessing = false;
  };
}
