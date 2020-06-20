var compat = require('async-compat');
var nextTick = require('next-tick');

module.exports = function processOrQueue(iterator, callback) {
  if (iterator.done) return callback(null, null);

  // nothing to process so queue
  if (!iterator.stack.length) return iterator.queued.unshift(callback);

  // process next
  iterator.processing++;
  iterator.stack.pop()(iterator, function depthFirstCallback(err, result) {
    iterator.processing--;
    if (iterator.done) return callback(null, null);

    // skip error
    if (err && compat.defaultValue(iterator.options.error(err), true)) err = null;

    // done so clear processors and queued
    if (!iterator.stack.length && iterator.processing <= 0) iterator.end();

    // skip error or no result so try again
    if (!err && !result) nextTick(processOrQueue.bind(null, iterator, callback));
    else nextTick(callback.bind(null, err, result || null));
  });
};
