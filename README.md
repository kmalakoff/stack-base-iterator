# stack-base-iterator

Base class for iterators whose values come from a stack of asynchronous functions.

```bash
npm install stack-base-iterator
```

Subclass `StackBaseIterator` and push functions that call their value callback with an `IteratorResult`. The base class provides async iteration, `next()`, `forEach()`, and lifecycle methods.

```js
var StackBaseIterator = require('stack-base-iterator').default;

class YourIterator extends StackBaseIterator {
  constructor(values) {
    super();
    values.forEach(function (value) {
      this.push(function (_iterator, callback) {
        callback(null, { done: false, value: value });
      });
    }, this);
  }
}
```

The subclass above is illustrative. A real subclass would push functions that perform its asynchronous work.

## Consume values

Use async iteration when the runtime supports it:

```js
var iterator = new YourIterator([1, 2, 3]);

(async function () {
  try {
    for await (var value of iterator) {
      console.log(value);
    }
  } finally {
    iterator.destroy();
  }
})();
```

For callback processing, call `forEach(fn, { callbacks: true, concurrency: 1 }, done)`. Without `callbacks: true`, `fn` may return a value or promise. Set `concurrency` to control parallel processing. Call `next()` to retrieve one `IteratorResult` at a time, and `destroy()` to stop the iterator.
