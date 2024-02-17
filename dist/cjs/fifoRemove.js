"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return fifoRemove;
    }
});
function fifoRemove(fifo, value) {
    for(var node = fifo.node; node; node = fifo.next(node)){
        if (node.value === value) {
            fifo.remove(node);
            return true;
        }
    }
    return false;
}

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  for (var key in exports) exports.default[key] = exports[key];
  module.exports = exports.default;
}