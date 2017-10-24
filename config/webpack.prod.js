var webpackMerge = require('webpack-merge');
var commonConfig = require('./webpack.common.js');
var helpers = require('./helpers');
var webpack = require('webpack');

var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');


module.exports = webpackMerge(commonConfig, {
  devtool: 'cheap-module-source-map',

  output: {
    path: helpers.root('dist'),
    publicPath: './',
    filename: 'js/[name].[hash].js',
    chunkFilename: '[id].[hash].chunk.js'
  },

  plugins: [
      // Only emit files when there are no errors
      new webpack.NoErrorsPlugin(),

      // Dedupe modules in the output
      new webpack.optimize.DedupePlugin(),

      // Minify all javascript, switch loaders to minimizing mode
      new webpack.optimize.UglifyJsPlugin({
        // Angular 2 is broken again, disabling mangle until beta 6 that should fix the thing
        // Todo: remove this with beta 6
        mangle: false
      }),

      // Copy assets from the public folder
      // Reference: https://github.com/kevlened/copy-webpack-plugin
      new CopyWebpackPlugin([{
        from: helpers.root('src/public')
      }]),

      // set environment for setting angular production mode.
      new webpack.DefinePlugin({
        'process.env': {
          'ENV': JSON.stringify('build')
        }
      })
  ]
});
