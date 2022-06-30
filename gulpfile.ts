'use strict'

import fs = require('fs')
import { spawn } from 'child_process'

import gulp = require('gulp')
import log = require('fancy-log')
import _if = require('gulp-if')
import jsonminify = require('gulp-jsonminify')
import mustache = require('gulp-mustache')
import plumber = require('gulp-plumber')
import rename = require('gulp-rename')
import tslint from 'gulp-tslint'
import zip = require('gulp-zip')

import chalk = require('chalk')
import del = require('del')
import { Server } from 'karma'
import _ = require('lodash')


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

gulp.task('webpack-prod', done => {
  log('Executing command \'' + chalk.cyan('webpack') + '\'...')
  const proc = spawn('webpack', [], { stdio: 'inherit' })
  proc.on('close', done)
})

gulp.task('webpack-watch', done => {
  log('Executing command \'' + chalk.cyan('webpack --watch') + '\'...')
  const proc = spawn('webpack', ['--watch'], { stdio: 'inherit' })
  proc.on('close', done)
})


// ----- zip ------------------------------------------------------------------

gulp.task('zip-product-v2', () =>
  gulp.src('dist/manifest-v2/**/*')
    .pipe(zip('manifest-v2.zip'))
    .pipe(gulp.dest('dist'))
)

gulp.task('zip-product-v3', () =>
  gulp.src('dist/manifest-v3/**/*')
    .pipe(zip('manifest-v3.zip'))
    .pipe(gulp.dest('dist'))
)

gulp.task('zip-source', () =>
  gulp.src([
    'assets/**/*',
    'src/**/*',
    'test/**/*',
    '.editorconfig',
    '.gitignore',
    '.node-version',
    'LICENSE',
    'yarn.lock',
    '*.js',
    '*.json',
    '*.ts',
    '*.yml',
    '*.md',
  ], { base: '.' })
    .pipe(zip('source.zip'))
    .pipe(gulp.dest('dist'))
)

gulp.task('zip', gulp.parallel('zip-product-v2', 'zip-product-v3', 'zip-source'))


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

gulp.task('karma', done => {
  const proc = spawn('karma', ['start', '--single-run'], { stdio: 'inherit' })
  proc.on('close', done)
})

gulp.task('test', gulp.series('tslint', 'karma'))
