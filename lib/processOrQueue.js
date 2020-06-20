var compat = require('async-compat');

var fifoRemove = require('./fifoRemove');

module.exports = function processOrQueue(iterator, callback) {
  if (iterator.done) return callback(null, null);

  // nothing to process so queue
  if (!iterator.stack.length) return iterator.queued.unshift(callback);

  // process next
  var next = iterator.stack.pop();
  iterator.processing.push(callback);
  next(iterator, function nextCallback(err, result) {
    if (iterator.done) return callback(null, null);
    fifoRemove(iterator.processing, callback);
    if (err && compat.defaultValue(iterator.options.error(err), true)) err = null; // skip error

    // skip error or no result so try again
    var done = !!err || (!iterator.stack.length && iterator.processing.length <= 0);
    !done && !err && !result ? processOrQueue(iterator, callback) : callback(err, result || null);
    !done || iterator.end(err); // end
  });
};
