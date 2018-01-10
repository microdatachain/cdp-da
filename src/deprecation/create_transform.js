'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (deprecations) {
  return (settings, log = _lodash.noop) => {
    const result = (0, _utils.deepCloneWithBuffers)(settings);

    (0, _lodash.forEach)(deprecations, deprecation => {
      deprecation(result, log);
    });

    return result;
  };
};

var _utils = require('../utils');

var _lodash = require('lodash');

module.exports = exports['default'];
