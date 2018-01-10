'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (oldKey, newKey) {
  return (settings, log = _lodash.noop) => {
    const value = (0, _lodash.get)(settings, oldKey);
    if ((0, _lodash.isUndefined)(value)) {
      return;
    }

    (0, _utils.unset)(settings, oldKey);
    (0, _lodash.set)(settings, newKey, value);

    log(`Config key "${oldKey}" is deprecated. It has been replaced with "${newKey}"`);
  };
};

var _lodash = require('lodash');

var _utils = require('../../utils');

module.exports = exports['default'];
