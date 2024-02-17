import assert from 'assert';
import EntriesIterator from '../lib/EntriesIterator.cjs';

describe('iterator', () => {
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
          assert.ok(!err);
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
          assert.ok(!err);
          assert.deepEqual(
            results.sort((a, b) => a - b),
            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
          );
          done();
        }
      );
    });

    it('concurrency 1 - promise', (done) => {
      if (typeof Promise === 'undefined') return done();

      const results = [];
      const iterator = new EntriesIterator([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      iterator
        .forEach(
          (value) => {
            results.push(value);
          },
          { concurrency: 1 }
        )
        .then(() => {
          assert.deepEqual(results, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
          done();
        })
        .catch((err) => {
          assert.ok(!err);
        });
    });
  });

  describe('unhappy path', () => {});
});
