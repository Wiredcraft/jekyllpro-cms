'use strict'

const path = require('path')
const webpack = require('webpack')
const autoprefixer = require('autoprefixer')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const extractSass = new ExtractTextPlugin({
  filename: '[name].css',
  allChunks: true,
  disable: process.env.NODE_ENV === 'development'
})

module.exports = {
  context: path.resolve(__dirname, '..'),
  resolve: {
    modules: [
      path.resolve(__dirname, '..'),
      path.resolve(__dirname, '../../node_modules')
    ],
    alias: {
      actions: path.resolve(__dirname, '../src/actions'),
      components: path.resolve(__dirname, '../src/components'),
      stores: path.resolve(__dirname, '../src/stores'),
      styles: path.resolve(__dirname, '../src/styles')
    }
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
      use: extractSass.extract({
        fallback: 'style-loader',
        use: [{
          loader: 'css-loader',
          options: {
            minimize: process.env.NODE_ENV !== 'development'
          }
        }, {
          loader: 'postcss-loader',
          options: {
            plugins: () => [autoprefixer]
          }
        }]
      })
    }, {
      test: /\.(png|jpg|gif|ico|ttf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
      loader: 'file-loader',
      options: {
        name: '[name].[ext]?[hash:6]',
        limit: 10000
      }
    }, {
      test: /\.scss$/,
      use: extractSass.extract({
        fallback: 'style-loader',
        use: [{
          loader: 'css-loader',
          options: {
            minimize: process.env.NODE_ENV !== 'development'
          }
        }, {
          loader: 'postcss-loader',
          options: {
            plugins: () => [autoprefixer]
          }
        }, {
          loader: 'sass-loader'
        }]
      })
    }, {
      test: /\.json$/,
      use: 'json-loader'
    }]
  },
  plugins: [
    extractSass
  ]
}
