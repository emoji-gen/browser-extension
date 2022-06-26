'use strict'

import * as fs from 'fs'
import { spawn } from 'child_process'

import * as gulp from 'gulp'
import * as log from 'fancy-log'
import * as _if from 'gulp-if'
import * as jsonminify from 'gulp-jsonminify'
import * as mustache from 'gulp-mustache'
import * as plumber from 'gulp-plumber'
import * as rename from 'gulp-rename'
import tslint from 'gulp-tslint'
import * as zip from 'gulp-zip'

import * as del from 'del'
import { Server } from 'karma'
import * as _ from 'lodash'


// ----------------------------------------------------------------------------

const pkg: { [key: string]: string } =
  JSON.parse(fs.readFileSync('./package.json').toString('utf-8'))
const isDev = process.argv.includes('watch')


// ----- assets ---------------------------------------------------------------

gulp.task('assets', () =>
  gulp.src('./assets/**/*')
    .pipe(gulp.dest('./dist/manifest-v2'))
    .pipe(gulp.dest('./dist/manifest-v3'))
)

gulp.task('assets-watch', () =>
  gulp.watch('./assets/**/*', gulp.task('assets'))
)


// ----- clean ----------------------------------------------------------------

gulp.task('clean', async () =>
  await del(['dist'])
)


// ----- manifest -------------------------------------------------------------

gulp.task('manifest', () =>
  gulp.src('./src/manifest-*.json')
    .pipe(plumber())
    .pipe(mustache({
      isDev,
      version: pkg.version,
    }))
    .pipe(rename(path => {
      return {
        dirname: path.basename,
        basename: 'manifest',
        extname: '.json'
      }
    }))
    .pipe(_if(!isDev, jsonminify()))
    .pipe(gulp.dest('./dist'))
)

gulp.task('manifest-watch', () => {
  gulp.watch('./src/manifest-*.json', gulp.task('manifest'))
})


// ----- tslint ---------------------------------------------------------------

gulp.task('tslint', () =>
  gulp.src('src/**/*.ts')
    .pipe(plumber())
    .pipe(tslint({ formatter: 'prose' }))
    .pipe(tslint.report({ summarizeFailureOutput: true }))
)


// ----- webpack --------------------------------------------------------------

function runWebpack(opts: string[], cb: (err: any) => void) {
  const message = 'Run webpack with options `' + opts.join(' ') + '`'
  log(message)

  const child = spawn('webpack', opts)
  if (child.stdout != null) {
    child.stdout.on('data', data => process.stdout.write(data))
  }
  if (child.stderr != null) {
    child.stderr.on('data', data => process.stderr.write(data))
  }
  child.on('close', cb)
}

gulp.task('webpack-prod', cb => {
  runWebpack([], cb)
})

gulp.task('webpack-watch', cb => {
  runWebpack(['--watch'], cb)
})


// ----- zip ------------------------------------------------------------------

gulp.task('zip-archive', () =>
  gulp.src('dist/extension/**/*')
    .pipe(zip('archive.zip'))
    .pipe(gulp.dest('dist'))
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
     '*.ts',
     '*.yml',
     '*.md',
     'yarn.lock',
     'LICENSE',
   ], { base: '.' })
     .pipe(zip('source.zip'))
     .pipe(gulp.dest('dist'))
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
  server.on('run_complete', (browsers, results) => {
    cb(results.error ? 'There are test failures' : null)
  })
  server.start()
})

gulp.task('test', gulp.series('tslint', 'karma'))
