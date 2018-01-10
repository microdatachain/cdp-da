'use strict';

var _require = require('./helpers');

const nodePresets = _require.nodePresets,
      webpackPresets = _require.webpackPresets,
      plugins = _require.plugins,
      buildIgnore = _require.buildIgnore;


const nodeOptions = {
  presets: nodePresets,
  plugins,
  ignore: buildIgnore
};

exports.webpack = {
  presets: webpackPresets,
  plugins: plugins
};

exports.node = nodeOptions;

exports.registerNodeOptions = function () {
  require('babel-register')(nodeOptions);
};
