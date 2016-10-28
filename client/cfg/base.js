'use strict'
let webpack = require('webpack')
let HtmlWebpackPlugin = require('html-webpack-plugin')
let ExtractTextPlugin = require('extract-text-webpack-plugin')
let path = require('path')
// let bourbon = require('node-bourbon')
let srcPath = path.join(__dirname, '/../src')
let publicPath = '/'

module.exports = {
  additionalPaths: [],
  debug: true,
  devtool: 'eval-source-map',
  entry: {
    app: [path.join(__dirname, '../src/index')],
    vendors: [
      'react',
      'react-dom',
      'react-router',
      'react-codemirror',
      'react-jsonschema-form',
      'moment',
      'superagent',
      'js-yaml'
    ]
  },
  output: {
    path: path.join(__dirname, '../dev'),
    filename: 'assets/[name].js',
    publicPath: `${publicPath}`
  },
  devServer: {
    contentBase: path.join(__dirname, '../dev'),
    historyApiFallback: true,
    hot: true,
    port: 8000,
    publicPath: `${publicPath}`,
    noInfo: false
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
    alias: {
      actions: `${srcPath}/actions/`,
      components: `${srcPath}/components/`,
      sources: `${srcPath}/sources/`,
      stores: `${srcPath}/stores/`,
      styles: `${srcPath}/styles/`,
      config: `${srcPath}/config/` + process.env.REACT_WEBPACK_ENV
    }
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin('vendors', 'assets/vendors.js'),
    new HtmlWebpackPlugin({
      inject: true,
      template: path.join(__dirname, '../src/index.html')
    }),
    new ExtractTextPlugin('assets/app.css')
  ],
  module: {
    loaders: [{
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
    }]
  },
  // sassLoader: {
  //   includePaths: bourbon.with()
  // },
  postcss: function () {
    return [
      require('precss'),
      require('autoprefixer')
    ]
  }
}
