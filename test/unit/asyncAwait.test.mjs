import assert from 'assert';
import EntriesIterator from '../lib/EntriesIterator.cjs';

const HAS_ASYNC_AWAIT = typeof Symbol !== 'undefined' && Symbol.asyncIterator;

describe('asyncAwait', () => {
  if (!HAS_ASYNC_AWAIT) return;

  describe('happy path', () => {
    it('concurrency 1', async () => {
      try {
        const iterator = new EntriesIterator([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        const results = [];
        let value = await iterator.next();
        while (value) {
          results.push(value);
          value = await iterator.next();
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
