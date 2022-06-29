'use strict'

import { join } from 'path'

import webpack = require('webpack')
import WebpackNotifierPlugin = require('webpack-notifier')
import EventHooksPlugin = require('event-hooks-webpack-plugin')
import TerserPlugin = require('terser-webpack-plugin')

const FileManagerPlugin = require('filemanager-webpack-plugin')

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
    filename: '[name].js',
    path: join(__dirname, 'dist/manifest-v2'),
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
      new TerserPlugin({
        extractComments: false,
      }),
      new webpack.optimize.AggressiveMergingPlugin(),
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
    new WebpackNotifierPlugin(),
    new EventHooksPlugin({
      run: () => console.log('Mode:', mode),
      watchRun: () => console.log('Mode:', mode),
    }),
    new FileManagerPlugin({
      events: {
        onEnd: {
          copy: [
            {
              source: 'dist/manifest-v2/*.js',
              destination: 'dist/manifest-v3/',
            },
            {
              source: 'dist/manifest-v2/*.js.map',
              destination: 'dist/manifest-v3/',
            },
          ],
        },
      },
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
  devtool: isDev ? 'cheap-module-source-map' : false,
}

module.exports = configuration
