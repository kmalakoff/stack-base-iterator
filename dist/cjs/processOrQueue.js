"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return processOrQueue;
    }
});
var _asynccompat = /*#__PURE__*/ _interop_require_default(require("async-compat"));
var _asap = /*#__PURE__*/ _interop_require_default(require("asap"));
var _fifoRemove = /*#__PURE__*/ _interop_require_default(require("./fifoRemove.js"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function processOrQueue(iterator, callback) {
    if (iterator.done) return callback(null, null);
    // nothing to process so queue
    if (!iterator.stack.length) return iterator.queued.unshift(callback);
    // process next
    var next = iterator.stack.pop();
    iterator.processing.push(callback);
    next(iterator, function nextCallback(err, result) {
        // break call stack
        (0, _asap.default)(function() {
            // done is based on stack being empty and not error state as the user may choose to skip the error
            (0, _fifoRemove.default)(iterator.processing, callback);
            if (iterator.done) return callback(null, null); // early exit
            if (err && _asynccompat.default.defaultValue(iterator.options.error(err), true)) err = null; // skip error
            var done = !iterator.stack.length && iterator.processing.length <= 0;
            !done && !err && !result ? processOrQueue(iterator, callback) : callback(err, result || null);
            if (done && !iterator.done) iterator.end(); // end
        });
    });
}
/* CJS INTEROP */ if (exports.__esModule && exports.default) { try { Object.defineProperty(exports.default, '__esModule', { value: true }); for (var key in exports) { exports.default[key] = exports[key]; } } catch (_) {}; module.exports = exports.default; }