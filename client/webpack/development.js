'use strict';

const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const baseConfig = require('./base')

module.exports = merge(baseConfig, {
  devtool: 'eval-cheap-module-source-map',
  resolve: {
    unsafeCache: true
  },
  entry: {
    vendor: [
      'react',
      'react-dom',
      'react-router',
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
    filename: 'assets/[name].js',
    path: path.resolve(__dirname, '../../public/dev'),
    publicPath: '/app-public/'
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: path.resolve(__dirname, '../src/index.html')
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      name: "vendor",
      minChunks: Infinity
    }),
    new webpack.DefinePlugin({
      '__DEV__': true,
      API_BASE_URL:
        JSON.stringify(process.env.API_BASE_URL || 'http://localhost:3000'),
      'process.env': {
        'NODE_ENV': JSON.stringify('development')
      }
    })
  ]
})
