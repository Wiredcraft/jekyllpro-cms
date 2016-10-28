'use strict'

let path = require('path')
let webpack = require('webpack')

let baseConfig = require('./base')

let config = Object.assign({}, baseConfig, {
  cache: false,
  debug: false,
  devtool: null
})

config.output.path = path.join(__dirname, '../dist')

config.plugins.unshift(
  new webpack.optimize.DedupePlugin(),
  new webpack.DefinePlugin({
    '__DEV__': false,
    API_BASE_URL:
      JSON.stringify(process.env.API_BASE_URL || 'http://localhost:3000'),
    'process.env.NODE_ENV': '"production"'
  }),
  new webpack.optimize.UglifyJsPlugin(),
  new webpack.optimize.OccurenceOrderPlugin(),
  new webpack.optimize.AggressiveMergingPlugin(),
  new webpack.NoErrorsPlugin()
)

// Add needed loaders to the defaults here
config.module.loaders.push({
  test: /\.(js|jsx)$/,
  loader: 'babel',
  include: [].concat(
    config.additionalPaths,
    [ path.join(__dirname, '/../src') ]
  )
})

module.exports = config
