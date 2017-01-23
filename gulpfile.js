const fs       = require('fs')
const { exec } = require('child_process')

const gulp        = require('gulp')
const gutil       = require('gulp-util')
const $           = require('gulp-load-plugins')()
const runSequence = require('run-sequence')
const _           = require('lodash')

const isWatch = ~process.argv.indexOf('watch')

// ----- env ------------------------------------------------------------------

gulp.task('env', () =>
  gulp.src('./src/env.js.mustache')
    .pipe($.plumber())
    .pipe($.mustache({ isDev: isWatch }))
    .pipe($.rename({ extname: '' }))
    .pipe(gulp.dest('./dist'))
)

gulp.task('env-watch', () => {
  gulp.watch('./src/env.js.mustache', ['env'])
})


// ----- manifest -------------------------------------------------------------

gulp.task('manifest', () =>
  gulp.src('./src/manifest.json.mustache')
    .pipe($.plumber())
    .pipe($.mustache({ isDev: isWatch }))
    .pipe($.rename({ extname: '' }))
    .pipe($.if(!isWatch, $.jsonminify()))
    .pipe(gulp.dest('./dist'))
)

gulp.task('manifest-watch', () => {
  gulp.watch('./src/manifest.json.mustache', ['manifest'])
})


// ----- assets ---------------------------------------------------------------

gulp.task('assets', () =>
  gulp.src('./assets/**/*')
    .pipe(gulp.dest('./dist'))
)

gulp.task('assets-watch', () =>
  gulp.watch('./assets/**/*', ['assets'])
)


// ----- webpack --------------------------------------------------------------

function runWebpack(opt, cb) {
  const defaults = [
    '--colors',
    '--progress',
    '--display-chunks',
  ]
  opt = _.union(opt, defaults)

  const message = 'Run webpack with options `' + opt.join(' ') + '`'
  gutil.log(message)

  const cmd   = 'webpack ' + opt.join(' ')
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

gulp.task('zip', () =>
  gulp.src('dist/**/*')
    .pipe($.zip('archive.zip'))
    .pipe(gulp.dest('.'))
)


// ----- for production -------------------------------------------------------

gulp.task('build-prod', cb => {
  runSequence(
    [
      'assets',
      'env',
      'manifest',
      'webpack-prod',
    ],
    'zip',
    cb
  )
})

gulp.task('default', ['build-prod'])


// ----- for development ------------------------------------------------------

gulp.task('build-watch', cb => {
  runSequence(
    [
      'assets',
      'env',
      'manifest',
    ],
    cb
  )
})

gulp.task('watch', cb => {
  runSequence(
    [
      'build-watch',
    ],
    [
      'assets-watch',
      'env-watch',
      'manifest-watch',
      'webpack-watch',
    ],
    cb
  )
})
