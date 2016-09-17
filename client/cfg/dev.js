'use strict'

let path = require('path')
let webpack = require('webpack')
let baseConfig = require('./base')
let defaultSettings = require('./defaults')

let config = Object.assign({}, baseConfig, {
  entry: [
    'webpack-dev-server/client?http://127.0.0.1:' + defaultSettings.port,
    'webpack/hot/only-dev-server',
    './src/index'
  ],
  bail: true,
  cache: true,
  devtool: 'eval-source-map',
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      API_BASE_URL:
        JSON.stringify(process.env.API_BASE_URL || 'http://localhost:3000')
    })
  ],
  module: defaultSettings.getDefaultModules()
})

// Add needed loaders to the defaults here
config.module.loaders.push({
  test: /\.(js|jsx)$/,
  loader: 'react-hot!babel',
  include: [].concat(
    config.additionalPaths,
    [ path.join(__dirname, '/../src') ]
  )
})

module.exports = config
