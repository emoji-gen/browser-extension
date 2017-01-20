'use strict'

const path    = require('path')
const webpack = require('webpack')

const WebpackFailPlugin     = require('webpack-fail-plugin')
const WebpackNotifierPlugin = require('webpack-notifier')

const isWatch = ~process.argv.indexOf('--watch')
const plugins = [ new WebpackNotifierPlugin({ alwaysNotify: true }) ]

if (!isWatch) {
  plugins.push(
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.AggressiveMergingPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false },
      sourceMap: false,
    }),
    WebpackFailPlugin
  )
}

module.exports = {
  context: __dirname,
  entry: {
    'content_scripts': './src/content_scripts',
    'background': './src/background',
  },
  output: {
    filename: './dist/[name].bundle.js',
  },
  resolve: {
    extensions: ['', '.ts', '.tsx', '.js', 'jsx'],
    modulesDirectories: ['node_modules'],
  },
  module: {
    loaders: [
      {
        test: /\.tsx?$/,
        loader: 'ts',
      },
      {
        test: /\.json$/,
        loader: 'json',
      },
    ],
  },
  plugins,
  watchOptions: {
    poll: true,
  },
}
