'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = setupSettings;

var _lodash = require('lodash');

var _defaults = require('./defaults');

var _defaults2 = _interopRequireDefault(_defaults);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function setupSettings(kbnServer, server, config) {
  let get = (() => {
    var _ref = _asyncToGenerator(function* (req, key) {
      assertRequest(req);
      return getAll(req).then(function (all) {
        return all[key];
      });
    });

    return function get(_x, _x2) {
      return _ref.apply(this, arguments);
    };
  })();

  let getAll = (() => {
    var _ref2 = _asyncToGenerator(function* (req) {
      assertRequest(req);
      return getRaw(req).then(function (raw) {
        return Object.keys(raw).reduce(function (all, key) {
          const item = raw[key];
          const hasUserValue = 'userValue' in item;
          all[key] = hasUserValue ? item.userValue : item.value;
          return all;
        }, {});
      });
    });

    return function getAll(_x3) {
      return _ref2.apply(this, arguments);
    };
  })();

  let getRaw = (() => {
    var _ref3 = _asyncToGenerator(function* (req) {
      assertRequest(req);
      return Promise.all([getDefaults(), getUserProvided(req)]).then(function ([defaults, user]) {
        return (0, _lodash.defaultsDeep)(user, defaults);
      });
    });

    return function getRaw(_x4) {
      return _ref3.apply(this, arguments);
    };
  })();

  let getUserProvided = (() => {
    var _ref4 = _asyncToGenerator(function* (req, { ignore401Errors = false } = {}) {
      assertRequest(req);

      var _server$plugins$elast = server.plugins.elasticsearch.getCluster('admin');

      const callWithRequest = _server$plugins$elast.callWithRequest,
            errors = _server$plugins$elast.errors;

      // If the ui settings status isn't green, we shouldn't be attempting to get
      // user settings, since we can't be sure that all the necessary conditions
      // (e.g. elasticsearch being available) are met.

      if (status.state !== 'green') {
        return hydrateUserSettings({});
      }

      const params = getClientSettings(config);
      const allowedErrors = [errors[404], errors[403], errors.NoConnections];
      if (ignore401Errors) allowedErrors.push(errors[401]);

      return _bluebird2.default.resolve(callWithRequest(req, 'get', params, { wrap401Errors: !ignore401Errors })).catch(...allowedErrors, function () {
        return {};
      }).then(function (resp) {
        return resp._source || {};
      }).then(function (source) {
        return hydrateUserSettings(source);
      });
    });

    return function getUserProvided(_x5) {
      return _ref4.apply(this, arguments);
    };
  })();

  let setMany = (() => {
    var _ref5 = _asyncToGenerator(function* (req, changes) {
      assertRequest(req);

      var _server$plugins$elast2 = server.plugins.elasticsearch.getCluster('admin');

      const callWithRequest = _server$plugins$elast2.callWithRequest;

      const clientParams = _extends({}, getClientSettings(config), {
        body: { doc: changes }
      });
      return callWithRequest(req, 'update', clientParams).then(function () {
        return {};
      });
    });

    return function setMany(_x6, _x7) {
      return _ref5.apply(this, arguments);
    };
  })();

  let set = (() => {
    var _ref6 = _asyncToGenerator(function* (req, key, value) {
      assertRequest(req);
      return setMany(req, { [key]: value });
    });

    return function set(_x8, _x9, _x10) {
      return _ref6.apply(this, arguments);
    };
  })();

  let remove = (() => {
    var _ref7 = _asyncToGenerator(function* (req, key) {
      assertRequest(req);
      return set(req, key, null);
    });

    return function remove(_x11, _x12) {
      return _ref7.apply(this, arguments);
    };
  })();

  let removeMany = (() => {
    var _ref8 = _asyncToGenerator(function* (req, keys) {
      assertRequest(req);
      const changes = {};
      keys.forEach(function (key) {
        changes[key] = null;
      });
      return setMany(req, changes);
    });

    return function removeMany(_x13, _x14) {
      return _ref8.apply(this, arguments);
    };
  })();

  const status = kbnServer.status.create('ui settings');

  if (!config.get('uiSettings.enabled')) {
    status.disabled('uiSettings.enabled config is set to `false`');
    return;
  }

  const uiSettings = {
    // returns a Promise for the value of the requested setting
    get,
    // returns a Promise for a hash of setting key/value pairs
    getAll,
    // .set(key, value), returns a Promise for persisting the new value to ES
    set,
    // takes a key/value hash, returns a Promise for persisting the new values to ES
    setMany,
    // returns a Promise for removing the provided key from user-specific settings
    remove,
    // takes an array, returns a Promise for removing every provided key from user-specific settings
    removeMany,

    // returns a Promise for the default settings, follows metadata format (see ./defaults)
    getDefaults,
    // returns a Promise for user-specific settings stored in ES, follows metadata format
    getUserProvided,
    // returns a Promise merging results of getDefaults & getUserProvided, follows metadata format
    getRaw
  };

  server.decorate('server', 'uiSettings', () => uiSettings);
  kbnServer.ready().then(mirrorEsStatus);

  function getDefaults() {
    return Promise.resolve((0, _defaults2.default)());
  }

  function mirrorEsStatus() {
    const esStatus = kbnServer.status.getForPluginId('elasticsearch');

    if (!esStatus) {
      status.red('UI Settings requires the elasticsearch plugin');
      return;
    }

    copyStatus();
    esStatus.on('change', copyStatus);

    function copyStatus() {
      const state = esStatus.state;

      const statusMessage = state === 'green' ? 'Ready' : `Elasticsearch plugin is ${state}`;
      status[state](statusMessage);
    }
  }
}

function hydrateUserSettings(user) {
  return Object.keys(user).reduce(expand, {});
  function expand(expanded, key) {
    const userValue = user[key];
    if (userValue !== null) {
      expanded[key] = { userValue };
    }
    return expanded;
  }
}

function getClientSettings(config) {
  const index = config.get('kibana.index');
  const id = config.get('pkg.version');
  const type = 'config';
  return { index, type, id };
}

function assertRequest(req) {
  if (typeof req === 'object' && typeof req.path === 'string' && typeof req.headers === 'object') return;

  throw new TypeError('all uiSettings methods must be passed a hapi.Request object');
}
module.exports = exports['default'];
