import assert from 'assert';
import EntriesIterator from '../lib/EntriesIterator.cjs';

describe('exports .ts', () => {
  it('concurrency 1', (done) => {
    const results = [];
    const iterator = new EntriesIterator([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    // @ts-ignore
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
});
