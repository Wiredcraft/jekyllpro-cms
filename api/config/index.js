import path from 'path';
import defaultConfig from './env.default';

var environmentConfig =
  require(path.join(__dirname, 'env.' + process.env.NODE_ENV)) || {};
var config = Object.assign(defaultConfig, environmentConfig);

module.exports = config;
