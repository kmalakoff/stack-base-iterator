import assert from 'assert';
import createIterator from '../lib/createIterator.cjs';

describe('exports .ts', () => {
  it('concurrency 1', (done) => {
    const results: number[] = [];
    const iterator = createIterator([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    iterator.forEach(
      (value: number, callback: (err?: Error) => void) => {
        results.push(value);
        callback();
      },
      { callbacks: true, concurrency: 1 },
      (err?: Error) => {
        if (err) return done(err);
        assert.deepEqual(results, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        done();
      }
    );
  });
});
