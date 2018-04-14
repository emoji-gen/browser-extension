'use strict'

import * as fs from 'fs'
import { exec } from 'child_process'

import * as gulp from 'gulp'
import * as gutil from 'gulp-util'
import * as _if from 'gulp-if'
import * as jsonminify from 'gulp-jsonminify'
import * as mustache from 'gulp-mustache'
import * as plumber from 'gulp-plumber'
import * as rename from 'gulp-rename'
import * as tslint from 'gulp-tslint'
import * as zip from 'gulp-zip'

import * as del from 'del'
import { Server } from 'karma'
import * as _ from 'lodash'


// ----------------------------------------------------------------------------

interface PackageJSON {
  version: string
}

const pkg: PackageJSON = JSON.parse(fs.readFileSync('./package.json').toString('utf-8'))
const isDev = process.argv.indexOf('watch') > -1


// ----- assets ---------------------------------------------------------------

gulp.task('assets', () =>
  gulp.src('./assets/**/*')
    .pipe(gulp.dest('./dist'))
)

gulp.task('assets-watch', () =>
  gulp.watch('./assets/**/*', gulp.task('assets'))
)


// ----- clean ----------------------------------------------------------------

gulp.task('clean', async () =>
  await del(['dist', '*.zip'])
)


// ----- manifest -------------------------------------------------------------

gulp.task('manifest', () =>
  gulp.src('./src/manifest.json.mustache')
    .pipe(plumber())
    .pipe(mustache({
      isDev,
      version: pkg.version,
    }))
    .pipe(rename({ extname: '' }))
    .pipe(_if(!isDev, jsonminify()))
    .pipe(gulp.dest('./dist'))
)

gulp.task('manifest-watch', () => {
  gulp.watch('./src/manifest.json.mustache', gulp.task('manifest'))
})


// ----- tslint ---------------------------------------------------------------

gulp.task('tslint', () =>
  gulp.src('src/**/*.ts')
    .pipe(plumber())
    .pipe(tslint({ formatter: 'prose' }))
    .pipe(tslint.report({ summarizeFailureOutput: true }))
)


// ----- webpack --------------------------------------------------------------

function runWebpack(opt, cb) {
  const defaults = ['--colors']
  if (!process.env.CI) {
    defaults.push('--progress')
  }
  opt = _.union(opt, defaults)

  const message = 'Run webpack with options `' + opt.join(' ') + '`'
  gutil.log(message)

  const cmd = 'webpack ' + opt.join(' ')
  const child = exec(cmd, cb)
  child.stdout.on('data', data => process.stdout.write(data))
  child.stderr.on('data', data => process.stderr.write(data))
}

gulp.task('webpack-prod', cb => {
  runWebpack([], cb);
})

gulp.task('webpack-watch', cb => {
  runWebpack(['--watch'], cb)
})


// ----- zip ------------------------------------------------------------------

gulp.task('zip-archive', () =>
  gulp.src('dist/**/*')
    .pipe(zip('archive.zip'))
    .pipe(gulp.dest('.'))
)

 gulp.task('zip-source', () =>
   gulp.src([
     'assets/**/*',
     'src/**/*',
     'test/**/*',
     '.node-version',
     '.editorconfig',
     '.gitignore',
     '*.js',
     '*.json',
     '*.yml',
     '*.md',
     'yarn.lock',
     'LICENSE',
   ], { base: '.' })
     .pipe(zip('source.zip'))
     .pipe(gulp.dest('.'))
 )

gulp.task('zip', gulp.parallel('zip-archive', 'zip-source'))


// ----- for production -------------------------------------------------------

gulp.task('build-prod', gulp.series(
  'clean',
  gulp.parallel('assets', 'manifest', 'webpack-prod'),
  'zip',
))

gulp.task('default', gulp.series('build-prod'))


// ----- for development ------------------------------------------------------

gulp.task('build-watch', gulp.parallel('assets', 'manifest'))

gulp.task('watch', gulp.series(
  'clean',
  'build-watch',
  gulp.parallel(
    'assets-watch',
    'manifest-watch',
    'webpack-watch',
  ),
))


// ----- for test -------------------------------------------------------------

gulp.task('karma', cb => {
  const server = new Server({
    configFile: `${__dirname}/karma.conf.ts`,
    singleRun: true
  })
  server.on('run_complete', function(browsers, results) {
    cb(results.error ? 'There are test failures' : null)
  })
  server.start()
})

gulp.task('test', gulp.series('tslint', 'karma'))
