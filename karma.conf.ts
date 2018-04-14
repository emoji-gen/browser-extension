'use strict'

module.exports = config => {
  config.set({
    autoWatch: true,
    basePath: '',
    browsers: ['ChromeHeadless'],
    colors: true,
    concurrency: Infinity,
    exclude: [
    ],
    frameworks: ['mocha'],
    files: [
      'test/**/*.ts'
    ],
    logLevel: config.LOG_INFO,
    mime: {
      'text/x-typescript': ['ts','tsx'],
    },
    port: 9876,
    preprocessors: {
      'test/**/*.ts': ['webpack']
    },
    reporters: ['progress', 'growl'],
    singleRun: false,
    webpack: require('./webpack.config'),
    webpackMiddleware: {
      noInfo: true,
    },
  })
}
