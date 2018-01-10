'use strict';

var _path = require('path');

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _mkdirp = require('mkdirp');

var _manage_uuid = require('./server/lib/manage_uuid');

var _manage_uuid2 = _interopRequireDefault(_manage_uuid);

var _ingest = require('./server/routes/api/ingest');

var _ingest2 = _interopRequireDefault(_ingest);

var _search = require('./server/routes/api/search');

var _search2 = _interopRequireDefault(_search);

var _settings = require('./server/routes/api/settings');

var _settings2 = _interopRequireDefault(_settings);

var _scripts = require('./server/routes/api/scripts');

var _scripts2 = _interopRequireDefault(_scripts);

var _system_api = require('./server/lib/system_api');

var systemApi = _interopRequireWildcard(_system_api);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new _bluebird2.default(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return _bluebird2.default.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const mkdirp = _bluebird2.default.promisify(_mkdirp.mkdirp);

module.exports = function (kibana) {
  //笔记：配置kibana的默认根路径，核心插件会引用该路径
  const kbnBaseUrl = '/app/kibana';

  return new kibana.Plugin({
    id: 'kibana',

    config: function config(Joi) {
      return Joi.object({
        enabled: Joi.boolean().default(true),
        defaultAppId: Joi.string().default('discover'),
        index: Joi.string().default('.kibana')
      }).default();
    },

    uiExports: {
      hacks: ['plugins/kibana/dev_tools/hacks/hide_empty_tools'],
      app: {
        id: 'kibana',
        title: 'CDP-DA',
        listed: false,
        description: 'the kibana you know and love',
        main: 'plugins/kibana/kibana',
        uses: ['visTypes', 'spyModes', 'fieldFormats', 'navbarExtensions', 'managementSections', 'devTools', 'docViews'],

        injectVars: function injectVars(server) {
          const serverConfig = server.config();

          //DEPRECATED SETTINGS
          //if the url is set, the old settings must be used.
          //keeping this logic for backward compatibilty.
          const configuredUrl = server.config().get('tilemap.url');
          const isOverridden = typeof configuredUrl === 'string' && configuredUrl !== '';
          const tilemapConfig = serverConfig.get('tilemap');
          return {
            kbnDefaultAppId: serverConfig.get('kibana.defaultAppId'),
            tilemapsConfig: {
              deprecated: {
                isOverridden: isOverridden,
                config: tilemapConfig
              },
              manifestServiceUrl: serverConfig.get('tilemap.manifestServiceUrl')
            }
          };
        }
      },

      links: [{
        id: 'kibana:discover',
        title: '查找',
        order: -1003,
        url: `${kbnBaseUrl}#/discover`,
        description: 'interactively explore your data',
        icon: 'plugins/kibana/assets/discover.svg'
      }, {
        id: 'kibana:visualize',
        title: '可视化',
        order: -1002,
        url: `${kbnBaseUrl}#/visualize`,
        description: 'design data visualizations',
        icon: 'plugins/kibana/assets/visualize.svg'
      }, {
        id: 'kibana:dashboard',
        title: '仪表盘',
        order: -1001,
        url: `${kbnBaseUrl}#/dashboards`,
        // The subUrlBase is the common substring of all urls for this app. If not given, it defaults to the url
        // above. This app has to use a different subUrlBase, in addition to the url above, because "#/dashboard"
        // routes to a page that creates a new dashboard. When we introduced a landing page, we needed to change
        // the url above in order to preserve the original url for BWC. The subUrlBase helps the Chrome api nav
        // to determine what url to use for the app link.
        subUrlBase: `${kbnBaseUrl}#/dashboard`,
        description: 'compose visualizations for much win',
        icon: 'plugins/kibana/assets/dashboard.svg'
      }, {
        id: 'kibana:dev_tools',
        title: '开发工具',
        order: 9001,
        url: '/app/kibana#/dev_tools',
        description: 'development tools',
        icon: 'plugins/kibana/assets/wrench.svg'
      }, {
        id: 'kibana:management',
        title: '管理',
        order: 9003,
        url: `${kbnBaseUrl}#/management`,
        description: 'define index patterns, change config, and more',
        icon: 'plugins/kibana/assets/settings.svg',
        linkToLastSubUrl: false
      }],
      //翻译：注入默认链接
      injectDefaultVars(server, options) {
        return {
          kbnIndex: options.index,
          kbnBaseUrl
        };
      },

      translations: [(0, _path.resolve)(__dirname, './translations/en.json')]
    },

    preInit: (() => {
      var _ref = _asyncToGenerator(function* (server) {
        try {
          // Create the data directory (recursively, if the a parent dir doesn't exist).
          // If it already exists, does nothing.
          yield mkdirp(server.config().get('path.data'));
        } catch (err) {
          server.log(['error', 'init'], err);
          // Stop the server startup with a fatal error
          throw err;
        }
      });

      function preInit(_x) {
        return _ref.apply(this, arguments);
      }

      return preInit;
    })(),

    init: function init(server) {
      // uuid
      (0, _manage_uuid2.default)(server);
      // routes
      (0, _ingest2.default)(server);
      (0, _search2.default)(server);
      (0, _settings2.default)(server);
      (0, _scripts2.default)(server);
      server.expose('systemApi', systemApi);
    }
  });
};
