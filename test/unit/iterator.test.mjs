// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
import Promise from 'pinkie-promise';

import assert from 'assert';
import EntriesIterator from '../lib/EntriesIterator.cjs';

describe('iterator', () => {
  (() => {
    // patch and restore promise
    const root = typeof global !== 'undefined' ? global : window;
    let rootPromise;
    before(() => {
      rootPromise = root.Promise;
      root.Promise = Promise;
    });
    after(() => {
      root.Promise = rootPromise;
    });
  })();

  describe('happy path', () => {
    it('destroy iterator', () => {
      const iterator = new EntriesIterator([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      iterator.destroy();
      assert.ok(true);
    });

    it('concurrency 1', (done) => {
      const results = [];
      const iterator = new EntriesIterator([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      iterator.forEach(
        (value, callback) => {
          results.push(value);
          callback();
        },
        { callbacks: true, concurrency: 1 },
        (err) => {
          assert.ok(!err, err ? err.message : '');
          assert.deepEqual(results, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
          done();
        }
      );
    });

    it('concurrency Infinity', (done) => {
      const results = [];
      const iterator = new EntriesIterator([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      iterator.forEach(
        (value, callback) => {
          results.push(value);
          callback();
        },
        { callbacks: true, concurrency: Infinity },
        (err) => {
          assert.ok(!err, err ? err.message : '');
          assert.deepEqual(
            results.sort((a, b) => a - b),
            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
          );
          done();
        }
      );
    });

    it('concurrency 1 - promise', async () => {
      const results = [];
      const iterator = new EntriesIterator([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      await iterator.forEach(
        (value) => {
          results.push(value);
        },
        { concurrency: 1 }
      );
      assert.deepEqual(results, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });
  });

  describe('unhappy path', () => {});
});
