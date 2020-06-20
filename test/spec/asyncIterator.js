var assert = require('assert');

var EntriesIterator = require('../lib/EntriesIterator');

var entries = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

describe('asyncIterator', function () {
  describe('happy path', function () {
    it('concurrency 1', async function () {
      try {
        const iterator = new EntriesIterator(entries);
        const results = [];
        for await (const value of iterator) {
          results.push(value);
        }

        assert.deepEqual(results, entries);
      } catch (err) {
        assert.ok(!err);
      }
    });

    it('concurrency Infinity', async function () {
      try {
        const iterator = new EntriesIterator(entries);
        const results = [];

        await iterator.forEach(
          async function (value) {
            results.push(value);
          },
          { concurrency: Infinity }
        );

        assert.deepEqual(results, entries);
      } catch (err) {
        assert.ok(!err);
      }
    });
  });

  describe('unhappy path', function () {});
});
