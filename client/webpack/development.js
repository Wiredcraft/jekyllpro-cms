'use strict';

const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const baseConfig = require('./base')

module.exports = merge(baseConfig, {
  devtool: 'source-map',
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
      'react-hot-loader/patch',
      'webpack-dev-server/client?http://localhost:8000',
      'webpack/hot/only-dev-server',
      path.resolve(__dirname, '../src/index.js')
    ]
  },
  output: {
    filename: 'assets/[name].js',
    path: path.resolve(__dirname, '../dev'),
    publicPath: '/'
  },
  devServer: {
    port: 8000,
    hot: true,
    contentBase: path.resolve(__dirname, '../dev'),
    publicPath: '/',
    historyApiFallback: {
      rewrites: [
        { from: /./, to: '/index.html' }
      ]
    },
    stats: 'minimal'
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
