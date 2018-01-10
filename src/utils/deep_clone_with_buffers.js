'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (vals) {
  return (0, _lodash.cloneDeep)(vals, cloneBuffersCustomizer);
};

var _lodash = require('lodash');

function cloneBuffersCustomizer(val) {
  if (Buffer.isBuffer(val)) {
    return new Buffer(val);
  }
}

module.exports = exports['default'];
