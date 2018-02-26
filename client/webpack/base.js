'use strict';

const path = require('path')
const webpack = require('webpack')
const autoprefixer = require('autoprefixer')

module.exports = {
  context: path.resolve(__dirname, '..'),
  resolve: {
    modules: [
      path.resolve(__dirname, '..'),
      path.resolve(__dirname, '../../node_modules')
    ]
  },
  stats: {
    colors: true,
    reasons: true,
    hash: false,
    version: false,
    timings: true,
    chunks: true,
    chunkModules: true,
    cached: false,
    cachedAssets: false
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      use: 'babel-loader'
    }, {
      test: /\.css$/,
      use: [
        'style-loader',
        'css-loader',
        {
          loader: 'postcss-loader',
          options: {
            plugins: function () {
              return [autoprefixer]
            }
          }
        }
      ]
    }, {
      test: /\.(png|jpg|gif|ico|ttf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
      loader: 'file-loader',
      options: {
        name: '[name].[ext]?[hash:6]',
        limit: 10000
      }
    }, {
      test: /\.scss$/,
      use: [
        'style-loader',
        'css-loader',
        {
          loader: 'postcss-loader',
          options: {
            plugins: function () {
              return [autoprefixer]
            }
          }
        },
        'sass-loader'
      ]
    }, {
      test: /\.(yaml|yml)$/,
      use: 'yaml-loader'
    }, {
      test: /\.json$/,
      use: 'json-loader'
    }]
  }
}
