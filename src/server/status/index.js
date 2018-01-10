'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (kbnServer, server, config) {
  kbnServer.status = new _server_status2.default(kbnServer.server);

  if (server.plugins['even-better']) {
    kbnServer.mixin(require('./metrics').collectMetrics);
  }

  const wrapAuth = (0, _wrap_auth_config2.default)(config.get('status.allowAnonymous'));
  const matchSnapshot = /-SNAPSHOT$/;
  server.route(wrapAuth({
    method: 'GET',
    path: '/api/status',
    handler: function handler(request, reply) {
      const v6Format = config.get('status.v6ApiFormat');
      if (v6Format) {
        return reply({
          name: config.get('server.name'),
          uuid: config.get('server.uuid'),
          version: {
            number: config.get('pkg.version').replace(matchSnapshot, ''),
            build_hash: config.get('pkg.buildSha'),
            build_number: config.get('pkg.buildNum'),
            build_snapshot: matchSnapshot.test(config.get('pkg.version'))
          },
          status: kbnServer.status.toJSON(),
          metrics: kbnServer.metrics
        });
      }

      return reply({
        name: config.get('server.name'),
        version: config.get('pkg.version'),
        buildNum: config.get('pkg.buildNum'),
        buildSha: config.get('pkg.buildSha'),
        uuid: config.get('server.uuid'),
        status: kbnServer.status.toJSON(),
        metrics: kbnServer.legacyMetrics
      });
    }
  }));

  server.decorate('reply', 'renderStatusPage', _asyncToGenerator(function* () {
    const app = kbnServer.uiExports.getHiddenApp('status_page');
    const response = yield getResponse(this);
    response.code(kbnServer.status.isGreen() ? 200 : 503);
    return response;

    function getResponse(ctx) {
      if (app) {
        return ctx.renderApp(app);
      }
      return ctx(kbnServer.status.toString());
    }
  }));

  server.route(wrapAuth({
    method: 'GET',
    path: '/status',
    handler: function handler(request, reply) {
      return reply.renderStatusPage();
    }
  }));
};

var _server_status = require('./server_status');

var _server_status2 = _interopRequireDefault(_server_status);

var _wrap_auth_config = require('./wrap_auth_config');

var _wrap_auth_config2 = _interopRequireDefault(_wrap_auth_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

module.exports = exports['default'];
