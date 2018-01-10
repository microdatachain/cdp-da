'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _binder = require('./binder');

var _binder2 = _interopRequireDefault(_binder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class BinderFor extends _binder2.default {
  constructor(emitter) {
    super();
    this.emitter = emitter;
  }

  on(...args) {
    super.on(this.emitter, ...args);
  }
}
exports.default = BinderFor;
module.exports = exports['default'];
