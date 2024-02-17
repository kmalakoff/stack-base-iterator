import compat from 'async-compat';

const isError = (e) => e && e.stack && e.message;

function processDone(err, options, callback) {
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

export default function createProcessor(next, options, callback) {
  let isProcessing = false;
  return function processor(doneOrErr) {
    if (doneOrErr && processDone(isError(doneOrErr) ? doneOrErr : null, options, callback)) return;
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
