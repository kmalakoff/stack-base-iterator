import assert from 'assert';
import Pinkie from 'pinkie-promise';
import createIterator from '../lib/createIterator.cjs';

const MAX_STACK = 100000;

// Node 0.8 compatible array creation
function range(n: number): number[] {
  const arr: number[] = [];
  for (let i = 0; i < n; i++) arr.push(i);
  return arr;
}

describe('performance', () => {
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

  it('no stack overflow with sync callbacks (concurrency 1)', (done) => {
    const results: number[] = [];
    const iterator = createIterator(range(MAX_STACK));
    iterator.forEach(
      (value, callback) => {
        results.push(value);
        callback(); // Sync callback - trampoline should prevent overflow
      },
      { callbacks: true, concurrency: 1 },
      (err) => {
        if (err) {
          done(err.message);
          return;
        }
        assert.equal(results.length, MAX_STACK);
        // Verify order is preserved
        assert.equal(results[0], 0);
        assert.equal(results[MAX_STACK - 1], MAX_STACK - 1);
        done();
      }
    );
  });

  it('no stack overflow with sync callbacks (concurrency 10)', (done) => {
    const results: number[] = [];
    const iterator = createIterator(range(MAX_STACK));
    iterator.forEach(
      (value, callback) => {
        results.push(value);
        callback(); // Sync callback
      },
      { callbacks: true, concurrency: 10 },
      (err) => {
        if (err) {
          done(err.message);
          return;
        }
        assert.equal(results.length, MAX_STACK);
        // With concurrency > 1, order may vary but all items should be present
        assert.deepEqual(
          results.slice().sort((a, b) => a - b),
          range(MAX_STACK)
        );
        done();
      }
    );
  });

  it('no stack overflow with sync callbacks (concurrency Infinity)', (done) => {
    const results: number[] = [];
    const iterator = createIterator(range(MAX_STACK));
    iterator.forEach(
      (value, callback) => {
        results.push(value);
        callback(); // Sync callback
      },
      { callbacks: true, concurrency: Infinity },
      (err) => {
        if (err) {
          done(err.message);
          return;
        }
        assert.equal(results.length, MAX_STACK);
        done();
      }
    );
  });

  it('order preserved with sync callbacks (concurrency 1)', (done) => {
    const results: number[] = [];
    const iterator = createIterator([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    iterator.forEach(
      (value, callback) => {
        results.push(value);
        callback(); // Sync callback - trampoline should not affect order
      },
      { callbacks: true, concurrency: 1 },
      (err) => {
        if (err) {
          done(err.message);
          return;
        }
        // Order must be preserved exactly
        assert.deepEqual(results, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        done();
      }
    );
  });

  it('order preserved with sync promise callbacks (concurrency 1)', async () => {
    const results: number[] = [];
    const iterator = createIterator([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    await iterator.forEach(
      (value) => {
        results.push(value);
        // Sync return - no callback
      },
      { concurrency: 1 }
    );
    // Order must be preserved exactly
    assert.deepEqual(results, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('order preserved across trampoline boundary (concurrency 1)', (done) => {
    // Create enough items to trigger the trampoline (> 1000)
    const count = 2000;
    const results: number[] = [];
    const iterator = createIterator(range(count));
    iterator.forEach(
      (value, callback) => {
        results.push(value);
        callback(); // Sync callback
      },
      { callbacks: true, concurrency: 1 },
      (err) => {
        if (err) {
          done(err.message);
          return;
        }
        // Order must be preserved exactly even across trampoline yields
        assert.deepEqual(results, range(count));
        done();
      }
    );
  });

  // NOTE: "Missed window" scenario is a known limitation.
  // Work pushed via microtask during the last forEach callback may not be processed
  // because the processor determines completion synchronously.
  // Fixing this would require changes to maximize-iterator or accepting async forEach callbacks.
});
