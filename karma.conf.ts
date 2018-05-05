'use strict'

import * as karma from 'karma'

module.exports = (config: karma.Config) => {
  config.set({
    autoWatch: true,
    basePath: '',
    browsers: [ process.env.CI ? 'ChromiumHeadless_without_security' : 'ChromeHeadless' ],
    colors: true,
    concurrency: Infinity,
    customLaunchers: {
      ChromiumHeadless_without_security: {
        base: 'ChromiumHeadless',
        flags: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
    },
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
