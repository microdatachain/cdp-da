'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createToolingLog = createToolingLog;

var _util = require('util');

var _stream = require('stream');

var _log_levels = require('./log_levels');

var _ansicolors = require('ansicolors');

function createToolingLog(logLevel = 'silent') {
  const logLevelFlags = (0, _log_levels.createLogLevelFlags)(logLevel);

  let indentString = '';

  class ToolingLog extends _stream.PassThrough {
    verbose(...args) {
      if (!logLevelFlags.verbose) return;
      this.write(' %s ', (0, _ansicolors.magenta)('sill'), (0, _util.format)(...args));
    }

    debug(...args) {
      if (!logLevelFlags.debug) return;
      this.write(' %s ', (0, _ansicolors.brightBlack)('debg'), (0, _util.format)(...args));
    }

    info(...args) {
      if (!logLevelFlags.info) return;
      this.write(' %s ', (0, _ansicolors.blue)('info'), (0, _util.format)(...args));
    }

    warning(...args) {
      if (!logLevelFlags.warning) return;
      this.write(' %s ', (0, _ansicolors.yellow)('warn'), (0, _util.format)(...args));
    }

    error(err) {
      if (!logLevelFlags.error) return;

      if (typeof err !== 'string' && !(err instanceof Error)) {
        err = new Error(`"${err}" thrown`);
      }

      this.write('%s ', (0, _ansicolors.red)('ERROR'), err.stack || err.message || err);
    }

    indent(delta = 0) {
      const width = Math.max(0, indentString.length + delta);
      indentString = ' '.repeat(width);
      return indentString.length;
    }

    write(...args) {
      (0, _util.format)(...args).split('\n').forEach((line, i) => {
        const subLineIndent = i === 0 ? '' : '       ';
        const indent = !indentString ? '' : indentString.slice(0, -1) + (i === 0 && line[0] === '-' ? '└' : '│');
        super.write(`${indent}${subLineIndent}${line}\n`);
      });
    }
  }

  return new ToolingLog();
}
