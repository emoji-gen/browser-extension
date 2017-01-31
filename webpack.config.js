'use strict'

const path    = require('path')
const webpack = require('webpack')

const WebpackFailPlugin     = require('webpack-fail-plugin')
const WebpackNotifierPlugin = require('webpack-notifier')

const isWatch = ~process.argv.indexOf('--watch')
const plugins = [
  new webpack.NormalModuleReplacementPlugin(
    /sinon/,
    `${__dirname}/node_modules/sinon/pkg/sinon.js`
  ),
  new WebpackNotifierPlugin({ alwaysNotify: true })
]

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
    alias: {
      'sinon': 'sinon/pkg/sinon',
    },
  },
  module: {
    noParse: [
      /sinon/,
    ],
    loaders: [
      {
        test: /sinon.*\.js$/,
        loader: 'imports?define=>false,require=>false',
      },
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
  browsers: {
    fs: false
  },
  plugins,
  watchOptions: {
    poll: true,
  },
}
