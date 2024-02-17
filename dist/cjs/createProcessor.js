"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return createProcessor;
    }
});
var _asynccompat = /*#__PURE__*/ _interop_require_default(require("async-compat"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
var isError = function(e) {
    return e && e.stack && e.message;
};
function processDone(err, options, callback) {
    // mark this iteration done
    options.err = options.err || err;
    options.done = true;
    // process done
    if (!options.done || options.counter > 0) return false;
    callback(options.err, options.done);
    return true;
}
function processResult(err, keep, options, callback) {
    options.counter--;
    // mark this iteration done
    if (err && _asynccompat.default.defaultValue(options.error(err), false) || !err && !_asynccompat.default.defaultValue(keep, true)) {
        options.err = options.err || err;
        options.done = true;
    }
    // process done
    if (!options.done || options.counter > 0) return false;
    callback(options.err, options.done);
    return true;
}
function createProcessor(next, options, callback) {
    var isProcessing = false;
    return function processor(doneOrErr) {
        if (doneOrErr && processDone(isError(doneOrErr) ? doneOrErr : null, options, callback)) return;
        if (isProcessing) return;
        isProcessing = true;
        var counter = 0;
        while(options.counter < options.concurrency){
            if (options.done || options.stop(counter++)) break;
            if (options.total >= options.limit) return processDone(null, options, callback);
            options.total++;
            options.counter++;
            next(function(err, value) {
                if (err || value === null) {
                    return !processResult(err, false, options, callback) && !isProcessing ? processor() : undefined;
                }
                _asynccompat.default.asyncFunction(options.each, options.callbacks, value, function(err, keep) {
                    return !processResult(err, keep, options, callback) && !isProcessing ? processor() : undefined;
                });
            });
        }
        isProcessing = false;
    };
}

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  for (var key in exports) exports.default[key] = exports[key];
  module.exports = exports.default;
}