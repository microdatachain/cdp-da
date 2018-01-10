'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Deprecations = exports.createTransform = undefined;

var _create_transform = require('./create_transform');

var _create_transform2 = _interopRequireDefault(_create_transform);

var _deprecations = require('./deprecations');

var _Deprecations = _interopRequireWildcard(_deprecations);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.createTransform = _create_transform2.default;
exports.Deprecations = _Deprecations;
