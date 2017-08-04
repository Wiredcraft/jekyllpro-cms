'use strict';

const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const VersionFile = require('webpack-version-file')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const baseConfig = require('./base')

module.exports = merge(baseConfig, {
  devtool: false,
  entry: {
    vendor: [
      'react',
      'react-dom',
      'react-router',
      'react-codemirror',
      'react-jsonschema-form',
      'moment',
      'superagent',
      'js-yaml'
    ],
    app: [
      path.resolve(__dirname, '../src/index.js')
    ]
  },
  output: {
    filename: 'assets/[name].[chunkhash].js',
    path: path.resolve(__dirname, '../dist'),
    publicPath: '/'
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: path.resolve(__dirname, '../src/index.html')
    }),
    new webpack.optimize.CommonsChunkPlugin({ name: "vendor", minChunks: Infinity }),
    new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false },
      mangle: false
    }),
    new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 15 }),
    new webpack.optimize.MinChunkSizePlugin({ minChunkSize: 100000 }),
    new webpack.DefinePlugin({
      '__DEV__': true,
      API_BASE_URL:
        JSON.stringify(process.env.API_BASE_URL || 'http://localhost:3000'),
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    })
  ]
})
