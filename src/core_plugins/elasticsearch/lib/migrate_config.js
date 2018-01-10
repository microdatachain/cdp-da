'use strict';

var _upgrade_config = require('./upgrade_config');

var _upgrade_config2 = _interopRequireDefault(_upgrade_config);

var _kibana_index_mappings = require('./kibana_index_mappings');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function (server) {
  const config = server.config();

  var _server$plugins$elast = server.plugins.elasticsearch.getCluster('admin');

  const callWithInternalUser = _server$plugins$elast.callWithInternalUser;


  const options = {
    index: config.get('kibana.index'),
    type: 'config',
    body: {
      size: 1000,
      sort: [{
        buildNum: {
          order: 'desc',
          unmapped_type: _kibana_index_mappings.mappings.config.properties.buildNum.type
        }
      }]
    }
  };

  return callWithInternalUser('search', options).then((0, _upgrade_config2.default)(server));
};
