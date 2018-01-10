'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerFieldCapabilities = registerFieldCapabilities;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _handle_es_error = require('../../../lib/handle_es_error');

var _handle_es_error2 = _interopRequireDefault(_handle_es_error);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function registerFieldCapabilities(server) {
  server.route({
    path: '/api/kibana/{indices}/field_capabilities',
    method: ['GET'],
    handler: function handler(req, reply) {
      var _server$plugins$elast = server.plugins.elasticsearch.getCluster('data');

      const callWithRequest = _server$plugins$elast.callWithRequest;

      const indices = req.params.indices || '';

      return callWithRequest(req, 'fieldStats', {
        fields: '*',
        level: 'cluster',
        index: indices,
        allowNoIndices: false
      }).then(res => {
        const fields = _lodash2.default.get(res, 'indices._all.fields', {});
        const fieldsFilteredValues = _lodash2.default.mapValues(fields, value => {
          return _lodash2.default.pick(value, ['searchable', 'aggregatable']);
        });

        const retVal = { fields: fieldsFilteredValues };
        if (res._shards && res._shards.failed) {
          retVal.shard_failure_response = res;
        }

        reply(retVal);
      }, error => {
        reply((0, _handle_es_error2.default)(error));
      });
    }
  });
}
