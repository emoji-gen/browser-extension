'use strict'

const path    = require('path')
const webpack = require('webpack')

const WebpackNotifierPlugin = require('webpack-notifier')

const isDev = ~process.argv.indexOf('--watch')
const mode = isDev ? 'development' : 'production'
console.log('Mode:', mode)

const plugins = [
  new webpack.NormalModuleReplacementPlugin(
    /sinon/,
    `${__dirname}/node_modules/sinon/pkg/sinon.js`
  ),
  new WebpackNotifierPlugin({ alwaysNotify: true })
]

// if (!isWatch) {
//   plugins.push(
//     new webpack.optimize.AggressiveMergingPlugin(),
//     new webpack.optimize.UglifyJsPlugin({
//       compress: { warnings: false },
//       sourceMap: false,
//     })
//   )
// }

module.exports = {
  mode,

  context: __dirname,
  entry: {
    'content_scripts': './src/content_scripts',
    'background': './src/background',
  },
  output: {
    filename: './dist/[name].bundle.js',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    alias: {
      'sinon': 'sinon/pkg/sinon',
    },
  },
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
  plugins,
  watchOptions: {
    poll: true,
  },
}
