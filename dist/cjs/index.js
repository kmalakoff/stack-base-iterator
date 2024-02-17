"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return StackBaseIterator;
    }
});
var _fifo = /*#__PURE__*/ _interop_require_default(require("fifo"));
var _justextend = /*#__PURE__*/ _interop_require_default(require("just-extend"));
var _once = /*#__PURE__*/ _interop_require_default(require("once"));
var _createProcessor = /*#__PURE__*/ _interop_require_default(require("./createProcessor.js"));
var _drainStack = /*#__PURE__*/ _interop_require_default(require("./drainStack.js"));
var _fifoRemove = /*#__PURE__*/ _interop_require_default(require("./fifoRemove.js"));
var _processOrQueue = /*#__PURE__*/ _interop_require_default(require("./processOrQueue.js"));
function _class_call_check(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}
function _defineProperties(target, props) {
    for(var i = 0; i < props.length; i++){
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
    }
}
function _create_class(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
}
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
var StackBaseIterator = /*#__PURE__*/ function() {
    "use strict";
    function StackBaseIterator(options) {
        _class_call_check(this, StackBaseIterator);
        options = options || {};
        this.options = (0, _justextend.default)({}, options);
        this.options.error = options.error || function defaultError(err) {
            return !!err; // fail on errors
        };
        this.queued = (0, _fifo.default)();
        this.processors = (0, _fifo.default)();
        this.stack = (0, _fifo.default)();
        this.entries = (0, _fifo.default)();
        this.links = (0, _fifo.default)();
        this.processing = (0, _fifo.default)();
    }
    _create_class(StackBaseIterator, [
        {
            key: "destroy",
            value: function destroy(err) {
                if (this.destroyed) throw new Error("Already destroyed");
                this.destroyed = true;
                this.end(err);
            }
        },
        {
            key: "push",
            value: function push(item) {
                if (this.done) return console.log("Attempting to push on a done iterator");
                this.stack.push(item);
                (0, _drainStack.default)(this);
            }
        },
        {
            key: "end",
            value: function end(err) {
                if (this.done) return;
                this.done = true;
                while(this.processors.length)this.processors.pop()(err || true);
                while(this.processing.length)err ? this.processing.pop()(err) : this.processing.pop()(null, null);
                while(this.queued.length)err ? this.queued.pop()(err) : this.queued.pop()(null, null);
                while(this.stack.length)this.stack.pop();
            }
        },
        {
            key: "next",
            value: function next(callback) {
                if (typeof callback === "function") return (0, _processOrQueue.default)(this, (0, _once.default)(callback));
                var self = this;
                return new Promise(function nextPromise(resolve, reject) {
                    self.next(function nextCallback(err, result) {
                        err ? reject(err) : resolve(result);
                    });
                });
            }
        },
        {
            key: "forEach",
            value: function forEach(fn, options, callback) {
                var self = this;
                if (typeof fn !== "function") throw new Error("Missing each function");
                if (typeof options === "function") {
                    callback = options;
                    options = {};
                }
                if (typeof callback === "function") {
                    if (this.done) return callback(null, true);
                    options = options || {};
                    options = {
                        each: fn,
                        callbacks: options.callbacks || false,
                        concurrency: options.concurrency || 1,
                        limit: options.limit || Infinity,
                        error: options.error || function defaultError() {
                            return true; // default is exit on error
                        },
                        total: 0,
                        counter: 0,
                        stop: function stop() {
                            return self.done || self.queued.length >= self.stack.length;
                        }
                    };
                    var processor = (0, _createProcessor.default)(this.next.bind(this), options, function processorCallback(err) {
                        if (!self.destroyed) (0, _fifoRemove.default)(self.processors, processor);
                        processor = null;
                        options = null;
                        var done = !self.stack.length;
                        if ((err || done) && !self.done) self.end(err);
                        return callback(err, self.done || done);
                    });
                    this.processors.push(processor);
                    processor();
                    return;
                }
                return new Promise(function forEachPromise(resolve, reject) {
                    self.forEach(fn, options, function forEachCallback(err, done) {
                        err ? reject(err) : resolve(done);
                    });
                });
            }
        }
    ]);
    return StackBaseIterator;
}();
if (typeof Symbol !== "undefined" && Symbol.asyncIterator) {
    StackBaseIterator.prototype[Symbol.asyncIterator] = function asyncIterator() {
        var self = this;
        return {
            next: function next() {
                return self.next().then(function nextCallback(value) {
                    return Promise.resolve({
                        value: value,
                        done: value === null
                    });
                });
            },
            destroy: function destroy() {
                self.destroy();
                return Promise.resolve();
            }
        };
    };
}

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  for (var key in exports) exports.default[key] = exports[key];
  module.exports = exports.default;
}