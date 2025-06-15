import assert from 'assert';
import Pinkie from 'pinkie-promise';
import createIterator from '../lib/createIterator.cjs';

describe('asyncAwait', () => {
  if (typeof Symbol === 'undefined' || !Symbol.asyncIterator) return;
  (() => {
    // patch and restore promise
    // @ts-ignore
    let rootPromise: Promise;
    before(() => {
      rootPromise = global.Promise;
      // @ts-ignore
      global.Promise = Pinkie;
    });
    after(() => {
      global.Promise = rootPromise;
    });
  })();

  describe('happy path', () => {
    it('concurrency 1', async () => {
      const iterator = createIterator([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      const results: number[] = [];
      let value = await iterator.next();
      while (!value.done) {
        results.push(value.value);
        value = await iterator.next();
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
