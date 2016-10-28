'use strict'

let path = require('path')
let webpack = require('webpack')
let baseConfig = require('./base')

let config = Object.assign({}, baseConfig, {
  cache: true
})

config.entry['app'].unshift(
  'webpack-dev-server/client?http://127.0.0.1:' + baseConfig.devServer.port,
  'webpack/hot/only-dev-server'
)

config.plugins.unshift(
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NoErrorsPlugin(),
  new webpack.DefinePlugin({
    '__DEV__': true,
    API_BASE_URL:
      JSON.stringify(process.env.API_BASE_URL || 'http://localhost:3000')
  })
)

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
