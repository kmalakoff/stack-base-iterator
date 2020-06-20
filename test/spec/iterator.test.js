var assert = require('assert');

var EntriesIterator = require('../lib/EntriesIterator');

var entries = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

describe('iterator', function () {
  describe('happy path', function () {
    it('destroy iterator', function () {
      var iterator = new EntriesIterator(entries);
      iterator.destroy();
      assert.ok(true);
    });

    it('concurrency 1', function (done) {
      var results = [];
      var iterator = new EntriesIterator(entries);
      iterator.forEach(
        function (value, callback) {
          results.push(value);
          callback();
        },
        { callbacks: true, concurrency: 1 },
        function (err) {
          assert.ok(!err);
          assert.deepEqual(results, entries);
          done();
        }
      );
    });

    it('concurrency Infinity', function (done) {
      var results = [];
      var iterator = new EntriesIterator(entries);
      iterator.forEach(
        function (value, callback) {
          results.push(value);
          callback();
        },
        { callbacks: true, concurrency: Infinity },
        function (err) {
          assert.ok(!err);
          assert.deepEqual(
            results.sort(function (a, b) {
              return a - b;
            }),
            entries
          );
          done();
        }
      );
    });

    it('concurrency 1 - promise', function (done) {
      if (typeof Promise === 'undefined') return done();

      var results = [];
      var iterator = new EntriesIterator(entries);
      iterator
        .forEach(
          function (value) {
            results.push(value);
          },
          { concurrency: 1 }
        )
        .then(function () {
          assert.deepEqual(results, entries);
          done();
        })
        .catch(function (err) {
          assert.ok(!err);
        });
    });
  });

  describe('unhappy path', function () {});
});
