var webpackMerge = require('webpack-merge');
var commonConfig = require('./webpack.common.js');
var helpers = require('./helpers');

var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = webpackMerge(commonConfig, {
  devtool: 'eval-source-map',

  loaders: {
    preLoaders: [
      {
        test: /\.ts$/, 
        loader: 'tslint'
      }
    ]
  },

  output: {
    path: helpers.root('dist'),
    publicPath: 'http://localhost:8080/',
    filename: 'js/[name].js',
    chunkFilename: '[id].chunk.js'
  },

  tslint: {
    emitErrors: false,
    failOnHint: false
  },

  debug: true,

  devServer: {
    contentBase: './src/public',
    historyApiFallback: true,
    stats: 'normal' //minimal
  }
});
