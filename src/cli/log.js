'use strict';

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _color = require('./color');

var _color2 = _interopRequireDefault(_color);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const log = _lodash2.default.restParam(function (color, label, rest1) {
  console.log.apply(console, [color(` ${_lodash2.default.trim(label)} `)].concat(rest1));
});

module.exports = class Log {
  constructor(quiet, silent) {
    this.good = quiet || silent ? _lodash2.default.noop : _lodash2.default.partial(log, _color2.default.green);
    this.warn = quiet || silent ? _lodash2.default.noop : _lodash2.default.partial(log, _color2.default.yellow);
    this.bad = silent ? _lodash2.default.noop : _lodash2.default.partial(log, _color2.default.red);
  }
};
