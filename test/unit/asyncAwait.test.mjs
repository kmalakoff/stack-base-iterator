import assert from 'assert';
// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
import Promise from 'pinkie-promise';
import EntriesIterator from '../lib/EntriesIterator.cjs';

describe('asyncAwait', () => {
  if (typeof Symbol === 'undefined' || !Symbol.asyncIterator) return;
  let globalPromise;
  before(() => {
    globalPromise = global.Promise;
    global.Promise = Promise;
  });
  after(() => {
    global.Promise = globalPromise;
  });

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
        assert.ok(!err, err ? err.message : '');
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
        assert.ok(!err, err ? err.message : '');
      }
    });
  });

  describe('unhappy path', () => {});
});
