'use strict'

let path = require('path')
let webpack = require('webpack')
let HtmlWebpackPlugin = require('html-webpack-plugin')
let ExtractTextPlugin = require('extract-text-webpack-plugin')

let baseConfig = require('./base')
let defaultSettings = require('./defaults')

let prodLoaders = [
  {
    test: /\.css$/,
    loader: ExtractTextPlugin.extract("style-loader", "css-loader")
  }, {
    test: /\.scss/,
    loader: ExtractTextPlugin.extract('style-loader', 'css-loader!postcss-loader!sass-loader')
  }, {
    test: /\.(png|jpg|gif|ico|ttf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
    loader: 'file?name=[name].[ext]?[hash:6]'
  }, {
    test: /\.json$/,
    loader: 'json'
  }
]

let config = Object.assign({}, baseConfig, {
  entry: path.join(__dirname, '../src/index'),
  cache: false,
  debug: false,
  devtool: null,
  output: {
    path: path.join(__dirname, '../dist'),
    filename: '/assets/app.js',
    publicPath: '/'
  },
  plugins: [
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
    new HtmlWebpackPlugin({
      inject: false,
      template: path.join(__dirname, '../src/index.html')
    }),
    new ExtractTextPlugin('/assets/app.css'),
    new webpack.NoErrorsPlugin()
  ],
  module: {loaders: prodLoaders}
})

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
