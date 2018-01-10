'use strict';

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _package_json = require('./package_json');

var _path = require('path');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = _lodash2.default.flow(_lodash2.default.partial(_path.join, _package_json.__dirname), _path.normalize);
