import assert from 'assert';
import createIterator from '../lib/createIterator.cjs';

describe('exports .ts', () => {
  it('concurrency 1', (done) => {
    const results: number[] = [];
    const iterator = createIterator([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    // @ts-ignore
    iterator.forEach(
      (value: number, callback) => {
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
});
