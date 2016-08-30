import path from 'path'
import defaultConfig from './env.default'

var environmentConfig = require(path.join(process.cwd(), 'config/env.' + process.env.NODE_ENV)) || {}
var config = Object.assign(defaultConfig, environmentConfig)

module.exports = config