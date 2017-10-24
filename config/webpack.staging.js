var webpackMerge = require('webpack-merge');
var commonConfig = require('./webpack.common.js');
var helpers = require('./helpers');

var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

console.log('path', helpers.root('/src/public') )

module.exports = webpackMerge(commonConfig, {
  devtool: 'cheap-module-source-map',

  output: {
    path: helpers.root('dist'),
    publicPath: './',
    filename: 'js/[name].[hash].js',
    chunkFilename: '[id].[hash].chunk.js'
  },

  plugins: [
    // Copy assets from the public folder
    // Reference: https://github.com/kevlened/copy-webpack-plugin
    new CopyWebpackPlugin([{
      from: helpers.root('src/public')
    }])
  ]
});
