'use strict';

const path = require('path')
const webpack = require('webpack')
const autoprefixer = require('autoprefixer')

module.exports = {
  context: path.resolve(__dirname, '..'),
  resolve: {
    modules: [
      path.resolve(__dirname, '..'),
      path.resolve(__dirname, '../node_modules')
    ],
    alias: {
      actions: path.resolve(__dirname, '../src/actions'),
      components: path.resolve(__dirname, '../src/components'),
      stores: path.resolve(__dirname, '../src/stores'),
      styles: path.resolve(__dirname, '../src/styles')
    }
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
      test: /\.json$/,
      use: 'json-loader'
    }]
  }
}
