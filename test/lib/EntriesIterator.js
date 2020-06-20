var inherits = require('inherits');
var BaseIterator = require('../..');

function EntryIterator(entries, options) {
  BaseIterator.call(this, options);
  var self = this;
  self.entries = entries.slice();

  function next(iterator, callback) {
    if (iterator.done || !self.entries.length) return callback(null, null);

    // keep going
    iterator.push(next);
    callback(null, self.entries.shift());
  }
  self.push(next);
}
inherits(EntryIterator, BaseIterator);

module.exports = EntryIterator;
