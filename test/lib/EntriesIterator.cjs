const inherits = require('inherits');
const BaseIterator = require('stack-base-iterator');

function EntriesIterator(entries, options) {
  BaseIterator.call(this, options);
  const self = this;
  self.entries = entries.slice();

  function next(iterator, callback) {
    if (iterator.done || !self.entries.length) return callback(null, null);

    // keep going
    iterator.push(next);
    callback(null, self.entries.shift());
  }
  self.push(next);
}
inherits(EntriesIterator, BaseIterator);

module.exports = EntriesIterator;
