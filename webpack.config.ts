'use strict'

import { join } from 'path'

import * as webpack from 'webpack'
import * as OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin'
import * as UglifyJsPlugin from 'uglifyjs-webpack-plugin'
import * as WebpackNotifierPlugin from 'webpack-notifier'
import * as EventHooksPlugin from 'event-hooks-webpack-plugin'

const isDev = process.argv.includes('--watch')
const mode = isDev ? 'development' : 'production'

const configuration: webpack.Configuration = {
  mode,

  // Entry and Context
  //~~~~~~~~~~~~~~~~~~~~~~~
  context: __dirname,
  entry: {
    'content_scripts': './src/content_scripts',
    'background': './src/background',
  },

  // Output
  //~~~~~~~~~~
  output: {
    filename: '[name].bundle.js',
    path: join(__dirname, 'dist/extension'),
  },

  // Module
  //~~~~~~~~~~~
  module: {
    noParse: [ /sinon/ ],
    rules: [
      {
        test: /sinon.*\.js$/,
        use: 'imports-loader?define=>false,require=>false',
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
      },
    ],
  },

  // Resolve
  //~~~~~~~~~~~
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    alias: {
      'sinon': 'sinon/pkg/sinon',
    },
  },

  // Optimization and Plugins
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        parallel: true,
        sourceMap: false,
      }),
      new webpack.optimize.AggressiveMergingPlugin(),
      new OptimizeCSSAssetsPlugin({}),
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      _DEBUG: JSON.stringify(isDev),
    }),
    new webpack.NormalModuleReplacementPlugin(
      /sinon/,
      `${__dirname}/node_modules/sinon/pkg/sinon.js`
    ),
    new WebpackNotifierPlugin({ alwaysNotify: true }),
    new EventHooksPlugin({
      run: () => console.log('Mode:', mode),
      watchRun: () => console.log('Mode:', mode),
    }),
  ],

  // Watch and WatchOptions
  //~~~~~~~~~~~~~~~~~~~~~~~~~
  watchOptions: {
    poll: true,
  },

  // Performance
  //~~~~~~~~~~~~~~~
  performance: {
    hints: false,
  },

  // Stats
  //~~~~~~~~
  stats: {
    entrypoints: true,
    children: false,
    chunks: false,
    chunkModules: false,
    chunkOrigins: false,
    colors: true,
    modules: false,
  },
  devtool: 'cheap-module-source-map'
}

module.exports = configuration
