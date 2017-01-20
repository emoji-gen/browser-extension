'use strict'

const path    = require('path')
const webpack = require('webpack')

const WebpackFailPlugin       = require('webpack-fail-plugin')
const WebpackNotifierPlugin   = require('webpack-notifier')

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
    'content_script': './src/content_script',
  },
  output: {
    filename: isWatch ?
      './dist/[name].bundle.js' : './dist/[name].bundle.min.js',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    loaders: [
      { test: /\.ts$/, loader: 'ts' },
    ],
  },
  plugins,
  watchOptions: {
    poll: true,
  },
}
