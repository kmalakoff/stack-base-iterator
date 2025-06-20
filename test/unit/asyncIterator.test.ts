import assert from 'assert';
import Pinkie from 'pinkie-promise';
import createIterator from '../lib/createIterator.cjs';

describe('asyncIterator', () => {
  if (typeof Symbol === 'undefined' || !Symbol.asyncIterator) return;
  (() => {
    // patch and restore promise
    if (typeof global === 'undefined') return;
    const globalPromise = global.Promise;
    before(() => {
      global.Promise = Pinkie;
    });
    after(() => {
      global.Promise = globalPromise;
    });
  })();

  describe('happy path', () => {
    it('concurrency 1', async () => {
      const iterator = createIterator([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      const results: number[] = [];
      for await (const value of iterator) {
        results.push(value);
      }

      assert.deepEqual(results, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it('concurrency Infinity', async () => {
      const iterator = createIterator([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      const results: number[] = [];

      await iterator.forEach(
        async (value) => {
          results.push(value);
        },
        { concurrency: Infinity }
      );

      assert.deepEqual(results, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });
  });

  describe('unhappy path', () => {});
});
