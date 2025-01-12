import assert from 'assert';
import Pinkie from 'pinkie-promise';
import createIterator from '../lib/createIterator.cjs';

describe('iterator', () => {
  (() => {
    // patch and restore promise
    // @ts-ignore
    let rootPromise: Promise;
    before(() => {
      rootPromise = global.Promise;
      global.Promise = Pinkie;
    });
    after(() => {
      global.Promise = rootPromise;
    });
  })();

  describe('happy path', () => {
    it('destroy iterator', () => {
      const iterator = createIterator([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      iterator.destroy();
      assert.ok(true);
    });

    it('concurrency 1', (done) => {
      const results: number[] = [];
      const iterator = createIterator([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      iterator.forEach(
        (value, callback) => {
          results.push(value);
          callback();
        },
        { callbacks: true, concurrency: 1 },
        (err) => {
          if (err) return done(err);
          assert.deepEqual(results, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
          done();
        }
      );
    });

    it('concurrency Infinity', (done) => {
      const results: number[] = [];
      const iterator = createIterator([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      iterator.forEach(
        (value, callback) => {
          results.push(value);
          callback();
        },
        { callbacks: true, concurrency: Infinity },
        (err) => {
          if (err) return done(err);
          assert.deepEqual(
            results.sort((a, b) => a - b),
            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
          );
          done();
        }
      );
    });

    it('concurrency 1 - promise', async () => {
      const results: number[] = [];
      const iterator = createIterator([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
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
