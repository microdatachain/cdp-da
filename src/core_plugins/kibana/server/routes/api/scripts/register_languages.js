'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerLanguages = registerLanguages;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _handle_es_error = require('../../../lib/handle_es_error');

var _handle_es_error2 = _interopRequireDefault(_handle_es_error);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function registerLanguages(server) {
  server.route({
    path: '/api/kibana/scripts/languages',
    method: 'GET',
    handler: function handler(request, reply) {
      var _server$plugins$elast = server.plugins.elasticsearch.getCluster('data');

      const callWithRequest = _server$plugins$elast.callWithRequest;


      return callWithRequest(request, 'cluster.getSettings', {
        include_defaults: true,
        filter_path: '**.script.engine.*.inline'
      }).then(esResponse => {
        const langs = _lodash2.default.get(esResponse, 'defaults.script.engine', {});
        const inlineLangs = _lodash2.default.pick(langs, lang => lang.inline === 'true');
        const supportedLangs = _lodash2.default.omit(inlineLangs, 'mustache');
        return _lodash2.default.keys(supportedLangs);
      }).then(reply).catch(error => {
        reply((0, _handle_es_error2.default)(error));
      });
    }
  });
}
