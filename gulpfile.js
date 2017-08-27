import gulp from 'gulp';
import plumber from 'gulp-plumber';
import babel from 'gulp-babel';
import concat from 'gulp-concat';
import pug from 'gulp-pug';
import postcss from 'gulp-postcss';
import nesting from 'postcss-nesting';
import customProperties from 'postcss-custom-properties';
import autoprefixer from 'autoprefixer';
// import uglify from 'gulp-uglify';
import del from 'del';
import browserSync from 'browser-sync';

const paths = {
  src: './src',
  dest: './dest',
}
paths.html = [
  `${paths.src}/pages/**/*.{html,pug}`,
  `!${paths.src}/**/_{*,**/*}`,
]
paths.css = [
  `${paths.src}/css/normalize.css`,
  // `${paths.src}/css/fonts.css`,
  `${paths.src}/css/base.css`,
  `${paths.src}/css/global.css`,
  `${paths.src}/_components/**/*.css`,
]
paths.scripts = [
  `${paths.src}/js/app.js`,
  `${paths.src}/_components/**/*.js`,
]

const handleError = (err) => console.log(err)

export const clean = () => del(paths.dest)

export const copy = () => {
  return gulp.src(paths.src + '/static/**/*')
    .pipe(gulp.dest(paths.dest))
}

export const html = () => {
  return gulp.src(paths.html)
    .pipe(plumber())
    .pipe(pug({
      basedir: "./src/",
      cache: false
    }))
    .on('error', handleError)
    .pipe(gulp.dest(paths.dest))
}

export function css() {
  return gulp.src(paths.css, { sourcemaps: true })
    .pipe(postcss([
        customProperties,
        nesting,
        autoprefixer,
      ]))
    .pipe(concat('style.css'))
    .pipe(gulp.dest(`${paths.dest}/assets`));
}

export function scripts() {
  return gulp.src(paths.scripts, { sourcemaps: true })
    .pipe(babel())
    // .pipe(uglify())
    .pipe(concat('app.js'))
    .pipe(gulp.dest(`${paths.dest}/assets`));
}

export const watch = () => {
  gulp.watch(`${paths.src}/**/*.{html,pug}`, html)
  gulp.watch(`${paths.src}/**/*.css`, css)
  gulp.watch(`${paths.src}/**/*.js`, scripts)
}

export const serve = () => {
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

export const build = gulp.series(clean, gulp.parallel(copy, html, css, scripts))
export const dev = gulp.series(build, gulp.parallel(watch, serve))
export default dev