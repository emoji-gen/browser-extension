const fs          = require('fs')
const { exec }    = require('child_process')

const gulp        = require('gulp')
const gutil       = require('gulp-util')
const $           = require('gulp-load-plugins')()
const { Server }  = require('karma')
const del         = require('del')
const runSequence = require('run-sequence')
const _           = require('lodash')

const pkg         = require('./package.json')

const isWatch = ~process.argv.indexOf('watch')


// ----- assets ---------------------------------------------------------------

gulp.task('assets', () =>
  gulp.src('./assets/**/*')
    .pipe(gulp.dest('./dist'))
)

gulp.task('assets-watch', () =>
  gulp.watch('./assets/**/*', ['assets'])
)


// ----- clean ----------------------------------------------------------------

gulp.task('clean', cb => {
  del(['dist', 'archive.*'])
    .then(()=> cb())
    .catch(err => cb(err))
})


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
    .pipe($.mustache({
      isDev: isWatch,
      version: pkg.version,
    }))
    .pipe($.rename({ extname: '' }))
    .pipe($.if(!isWatch, $.jsonminify()))
    .pipe(gulp.dest('./dist'))
)

gulp.task('manifest-watch', () => {
  gulp.watch('./src/manifest.json.mustache', ['manifest'])
})


// ----- tslint ---------------------------------------------------------------

gulp.task('tslint', () =>
  gulp.src('src/**/*.ts')
    .pipe($.plumber())
    .pipe($.tslint({ formatter: 'prose' }))
    .pipe($.tslint.report({ summarizeFailureOutput: true }))
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
    'clean',
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
    'clean',
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


// ----- for test -------------------------------------------------------------

gulp.task('karma', cb => {
  const server = new Server({
    configFile: `${__dirname}/karma.conf.js`,
    singleRun: true
  })
  server.on('run_complete', function(browsers, results) {
    cb(results.error ? 'There are test failures' : null)
  })
  server.start()
})

gulp.task('test', ['karma', 'tslint'])
