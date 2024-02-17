"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
var _asynccompat = /*#__PURE__*/ _interop_require_default(require("async-compat"));
var _fifoRemove = /*#__PURE__*/ _interop_require_default(require("./fifoRemove.js"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
module.exports = function processOrQueue(iterator, callback) {
    if (iterator.done) return callback(null, null);
    // nothing to process so queue
    if (!iterator.stack.length) return iterator.queued.unshift(callback);
    // process next
    var next = iterator.stack.pop();
    iterator.processing.push(callback);
    next(iterator, function nextCallback(err, result) {
        if (iterator.done) return callback(null, null);
        (0, _fifoRemove.default)(iterator.processing, callback);
        if (err && _asynccompat.default.defaultValue(iterator.options.error(err), true)) err = null; // skip error
        // done is based on stack being empty and not error state as the user may choose to skip the error
        var done = !iterator.stack.length && iterator.processing.length <= 0;
        !done && !err && !result ? processOrQueue(iterator, callback) : callback(err, result || null);
        if (done && !iterator.done) iterator.end(); // end
    });
};

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  for (var key in exports) exports.default[key] = exports[key];
  module.exports = exports.default;
}