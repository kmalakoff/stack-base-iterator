"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return drainStack;
    }
});
var _processOrQueue = /*#__PURE__*/ _interop_require_default(require("./processOrQueue.js"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function canProcess(iterator) {
    if (iterator.done || !iterator.stack.length) return false;
    if (iterator.queued.length) return true;
    if (!iterator.processors.length) return false;
    iterator.processors.first()(false);
    if (iterator.done) return false;
    return iterator.queued.length;
}
function drainStack(iterator) {
    while(canProcess(iterator)){
        (0, _processOrQueue.default)(iterator, iterator.queued.pop());
    }
}

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  for (var key in exports) exports.default[key] = exports[key];
  module.exports = exports.default;
}