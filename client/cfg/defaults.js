'use strict'
const path = require('path')
const srcPath = path.join(__dirname, '/../src')
const dfltPort = 8000
function getDefaultModules() {
  return {
    loaders: [
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader!postcss-loader'
      }, {
        test: /\.scss/,
        loader: 'style-loader!css-loader!postcss-loader!sass-loader?outputStyle=expanded'
      }, {
        test: /\.(png|jpg|gif|ico|ttf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
        loader: 'file-loader?name=[name].[ext]?[hash:6]'
      }, {
        test: /\.json$/,
        loader: 'json'
      }
    ]
  }
}
module.exports = {
  srcPath: srcPath,
  publicPath: '/assets/',
  port: dfltPort,
  getDefaultModules: getDefaultModules
}
