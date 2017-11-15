var helpers = require('./helpers');
var webpack = require('webpack');

// Webpack Plugins
var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var autoprefixer = require('autoprefixer');

module.exports = {
  entry: {
    'polyfills': './src/polyfills.ts',
    'vendor': './src/vendor.ts',
    'app': './src/main.ts' 
  },

  resolve: {
    cache: true,
    root: helpers.root(),
    extensions: ['', '.ts', '.js', '.json', '.css', '.sass', '.html'],
    alias: {
      'app': 'src/app'
    }
  },

  module: {
    loaders: [
      {
        test: /\.ts$/,
        loader: 'ts',
        query: {
          'ignoreDiagnostics': [
            2403, // 2403 -> Subsequent variable declarations
            2300, // 2300 -> Duplicate identifier
            2374, // 2374 -> Duplicate number index signature
            2375, // 2375 -> Duplicate string index signature
            2502  // 2502 -> Referenced directly or indirectly
          ]
        },
        exclude: [/\.(spec|e2e)\.ts$/, /node_modules\/(?!(ng2-.+))/]
      },

      // copy those assets to output
      {
        test: /\.(png|jpe?g|gif|ico)$/, 
        loader: 'file?name=images/[name].[ext]'
      },

      // Support for *.json files.
      {
        test: /\.json$/, 
        loader: 'json'
      },

      {
        test: /\.sass$/,
        exclude: helpers.root('src', 'app'),
        loader: ExtractTextPlugin.extract('style', 'css!postcss!sass?sourceMap', {
          publicPath: '../'
        })
      },
      

      // support for .html as raw text
      // todo: change the loader to something that adds a hash to images
      {
        test: /\.html$/, 
        loader: 'raw'
      },

      // SVG sprite
      {
        test: /\.svg$/,
        loader: 'svg-sprite?' + JSON.stringify({
          name: '[name]',
          prefixize: true
        })
      }
    ],
    postLoaders: [],
    noParse: [/.+zone\.js\/dist\/.+/, /.+angular2\/bundles\/.+/, /angular2-polyfills\.js/]
  },

  postcss: function () {
    return {
      defaults: [autoprefixer],
      cleaner:  [autoprefixer({ browsers: ['last 2 versions'] })]
    };
  },

  plugins: [
    // Generate common chunks 
    new CommonsChunkPlugin({
      name: ['vendor', 'polyfills']
    }),

    // Inject script and link tags into html files
    new HtmlWebpackPlugin({
      template: './src/public/index.html',
      chunksSortMode: 'dependency'
    }),

     // Extract css files
    new ExtractTextPlugin('css/[name].[hash].css'),
    
    new webpack.ProvidePlugin({
      jQuery: 'jquery',
      $: 'jquery',
      jquery: 'jquery'
    })
  ]
};
