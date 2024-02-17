import assert from 'assert';
import EntriesIterator from '../lib/EntriesIterator.cjs';

const HAS_ASYNC_ITERATOR = typeof Symbol !== 'undefined' && Symbol.asyncIterator;

describe('asyncIterator', () => {
  if (!HAS_ASYNC_ITERATOR) return;

  describe('happy path', () => {
    it('concurrency 1', async () => {
      try {
        const iterator = new EntriesIterator([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        const results = [];
        for await (const value of iterator) {
          results.push(value);
        }

        assert.deepEqual(results, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      } catch (err) {
        assert.ok(!err);
      }
    });

    it('concurrency Infinity', async () => {
      try {
        const iterator = new EntriesIterator([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        const results = [];

        await iterator.forEach(
          async (value) => {
            results.push(value);
          },
          { concurrency: Infinity }
        );

        assert.deepEqual(results, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      } catch (err) {
        assert.ok(!err);
      }
    });
  });

  describe('unhappy path', () => {});
});
