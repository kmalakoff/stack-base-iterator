const BaseIterator = require('stack-base-iterator');

module.exports = function create(entries) {
  const iterator = new BaseIterator();
  iterator.entries = entries.slice();

  const next = (iterator, callback) => {
    if (iterator.done || !iterator.entries.length) return callback(null, { done: true, value: null });

    // keep going
    iterator.push(next);
    callback(null, { done: false, value: iterator.entries.shift() });
  };
  iterator.push(next);
  return iterator;
};
