'use strict';

const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')

const baseConfig = require('./base')

module.exports = merge(baseConfig, {
  devtool: false,
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
    app: path.resolve(__dirname, '../src/index.js')
  },
  output: {
    filename: 'assets/[name].[chunkhash].js',
    path: path.resolve(__dirname, '../../public/dist'),
    publicPath: '/app-public/'
  },
  plugins: [
    new LodashModuleReplacementPlugin(),
    new webpack.HashedModuleIdsPlugin(), // @see https://loveky.github.io/2017/03/29/
    new HtmlWebpackPlugin({
      inject: true,
      template: path.resolve(__dirname, '../src/index.html')
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: ['vendor', 'manifest'],
      minChunks: Infinity
    }),
    new webpack.optimize.UglifyJsPlugin({
      mangle: true,
      compress: {
        warnings: false, // Suppress uglification warnings
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        screw_ie8: true
      },
      output: {
        comments: false
      },
      exclude: [/\.min\.js$/gi] // skip pre-minified libs
    }),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new webpack.DefinePlugin({
      '__DEV__': false,
      API_BASE_URL: JSON.stringify(''),
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    })
  ]
})
