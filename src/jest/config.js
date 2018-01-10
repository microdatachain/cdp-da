'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.config = undefined;

var _path = require('path');

const config = exports.config = {
  roots: ['<rootDir>/ui_framework/'],
  collectCoverageFrom: ['ui_framework/components/**/*.js', '!ui_framework/components/index.js', '!ui_framework/components/**/*/index.js'],
  coverageDirectory: '<rootDir>/target/jest-coverage',
  coverageReporters: ['html'],
  moduleFileExtensions: ['jsx', 'js', 'json'],
  testPathIgnorePatterns: ['<rootDir>[/\\\\]ui_framework[/\\\\](dist|doc_site|jest)[/\\\\]'],
  transform: {
    '^.+\\.(js|jsx)$': (0, _path.resolve)(__dirname, './babelTransform.js')
  },
  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$'],
  snapshotSerializers: ['<rootDir>/node_modules/enzyme-to-json/serializer']
};
