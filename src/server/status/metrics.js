'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getMetrics = undefined;

let getMetrics = exports.getMetrics = (() => {
  var _ref = _asyncToGenerator(function* (event, config, server) {
    let cGroupStatsIfAvailable = (() => {
      var _ref2 = _asyncToGenerator(function* () {
        if (!cGroupStatsAvailable) {
          return;
        }

        try {
          const cgroup = yield (0, _cgroup.getAllStats)({
            cpuPath: config.get('cpu.cgroup.path.override'),
            cpuAcctPath: config.get('cpuacct.cgroup.path.override')
          });

          if ((0, _lodash.isObject)(cgroup)) {
            return cgroup;
          }

          cGroupStatsAvailable = false;
        } catch (e) {
          server.log(['error', 'metrics', 'cgroup'], e);
        }
      });

      return function cGroupStatsIfAvailable() {
        return _ref2.apply(this, arguments);
      };
    })();

    const port = config.get('server.port');
    const timestamp = new Date().toISOString();

    const cgroup = yield cGroupStatsIfAvailable();

    const metrics = {
      last_updated: timestamp,
      collection_interval_in_millis: config.get('ops.interval'),
      uptime_in_millis: process.uptime() * 1000,
      process: {
        mem: {
          heap_max_in_bytes: (0, _lodash.get)(event, 'psmem.heapTotal'),
          heap_used_in_bytes: (0, _lodash.get)(event, 'psmem.heapUsed')
        }
      },
      os: {
        cpu: {
          load_average: {
            '1m': (0, _lodash.get)(event, 'osload.0'),
            '5m': (0, _lodash.get)(event, 'osload.1'),
            '15m': (0, _lodash.get)(event, 'osload.2')
          }
        }
      },
      response_times: {
        avg_in_millis: (0, _lodash.get)(event, ['responseTimes', port, 'avg']),
        max_in_millis: (0, _lodash.get)(event, ['responseTimes', port, 'max'])
      },
      requests: (0, _case_conversion.keysToSnakeCaseShallow)((0, _lodash.get)(event, ['requests', port])),
      concurrent_connections: (0, _lodash.get)(event, ['concurrents', port])
    };

    if ((0, _lodash.isObject)(cgroup)) {
      (0, _lodash.set)(metrics, 'os.cgroup', cgroup);
    }

    return metrics;
  });

  return function getMetrics(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
})();

exports.collectMetrics = collectMetrics;

var _lodash = require('lodash');

var _samples = require('./samples');

var _samples2 = _interopRequireDefault(_samples);

var _case_conversion = require('../../utils/case_conversion');

var _cgroup = require('./cgroup');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

let cGroupStatsAvailable = true;

function collectMetrics(kbnServer, server, config) {
  let lastReport = Date.now();
  kbnServer.legacyMetrics = new _samples2.default(12);

  server.plugins['even-better'].monitor.on('ops', event => {
    getMetrics(event, config, server).then(data => {
      kbnServer.metrics = data;
    });

    const now = Date.now();
    const secSinceLast = (now - lastReport) / 1000;
    lastReport = now;

    const port = config.get('server.port');
    const requests = (0, _lodash.get)(event, ['requests', port, 'total'], 0);
    const requestsPerSecond = requests / secSinceLast;

    kbnServer.legacyMetrics.add({
      heapTotal: (0, _lodash.get)(event, 'psmem.heapTotal'),
      heapUsed: (0, _lodash.get)(event, 'psmem.heapUsed'),
      load: event.osload,
      responseTimeAvg: (0, _lodash.get)(event, ['responseTimes', port, 'avg']),
      responseTimeMax: (0, _lodash.get)(event, ['responseTimes', port, 'max']),
      requestsPerSecond: requestsPerSecond
    });
  });
}
