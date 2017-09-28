const gulp = require('gulp');
const gutil = require('gulp-util');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const pug = require('gulp-pug');
const postcss = require('gulp-postcss');
const nesting = require('postcss-nested');
const customProperties = require('postcss-custom-properties');
const atImport = require('postcss-import');
const autoprefixer = require('autoprefixer');
// const uglify = require('gulp-uglify');
const del = require('del');
const browserSync = require('browser-sync');

const paths = {
  src: './src',
  dest: './dist',
}
paths.html = [
  `${paths.src}/pages/**/*.{html,pug}`,
  `!${paths.src}/**/_{*,**/*}`, // ignore files that start with _
]
paths.css = [
  `${paths.src}/css/**/*.{css,scss}`, // h2
  // `${paths.src}/css/normalize.css`,
  // `${paths.src}/css/fonts.css`,
  // `${paths.src}/css/base.css`,
  // `${paths.src}/css/global.css`,
  // `${paths.src}/components/**/*.css`,
  `!${paths.src}/**/_{*,**/*}`, // ignore files that start with _
]
paths.scripts = [
  `${paths.src}/js/util.js`,
  `${paths.src}/components/**/*.js`,
  `${paths.src}/js/app.js`,
]

const clean = () => del(paths.dest)

const copy = () => {
  return gulp.src(paths.src + '/static/**/*')
    .pipe(gulp.dest(paths.dest))
}

const html = (done) => {
  return gulp.src(paths.html)
    .pipe(sourcemaps.init())
    .pipe(pug({
      basedir: "./src/",
      locals: {
        site: {},
      }
    }))
    .on('error', function(err) {
      gutil.log(err);
      done()
    })
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.dest))
}

const css = (done) => {
  return gulp.src(paths.css, { sourcemaps: true })
    .pipe(sourcemaps.init())
    // .pipe(concat('style.css')) // h2
    .pipe(postcss([
        atImport,
        customProperties,
        nesting,
        autoprefixer,
    ]))
    .on('error', function(err) {
      gutil.log(err);
      done()
    })
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(`${paths.dest}/assets/css`));
}

const scripts = (done) => {
  return gulp.src(paths.scripts, { sourcemaps: true })
    .pipe(sourcemaps.init())
    // .pipe(concat('app.js')) // h2
    .pipe(babel())
    .on('error', function(err) {
      gutil.log(err);
      done()
    })
    // .pipe(uglify()) // h2
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(`${paths.dest}/assets/js`));
}

const watch = () => {
  gulp.watch(`${paths.src}/**/*.{html,pug}`, html)
  gulp.watch(`${paths.src}/**/*.css`, css)
  gulp.watch(`${paths.src}/**/*.js`, scripts)
}

const serve = (done) => {
  browserSync({
    // https: true,
    // port: 3000,
    ui: false,
    server: {
     baseDir: paths.dest
    },
    files: [paths.dest + '/**/*'],
    notify: false,
    ghostMode: false,
    open: false
  });
}

const build = gulp.series(clean, gulp.parallel(copy, html, css, scripts))
const dev = gulp.series(build, gulp.parallel(watch, serve))

exports.clean = clean
exports.copy = copy
exports.html = html
exports.css = css
exports.scripts = scripts
exports.watch = watch
exports.serve = serve
exports.build = build
exports.dev = dev
exports.default = dev