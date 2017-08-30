const path =  require('path');
const gulp =  require('gulp');
const babel =  require('gulp-babel');
const concat =  require('gulp-concat');
const each =  require('gulp-each');
const sourcemaps = require('gulp-sourcemaps');
const postcss =  require('gulp-postcss');
const nesting =  require('postcss-nesting');
const customProperties =  require('postcss-custom-properties');
const autoprefixer =  require('autoprefixer');
// const uglify =  require('gulp-uglify');
const del =  require('del');
const browserSync =  require('browser-sync');
require('marko/node-require');
require('marko/compiler').configure({
  writeToDisk: false
});
require('marko/hot-reload').enable();

const paths = {
  src: './src',
  dest: './dest',
}
paths.html = [
  `${paths.src}/pages/**/*.{html,pug}`,
  `!${paths.src}/**/_{*,**/*}`,
]
paths.marko = [
  `${paths.src}/pages/**/*.marko`,
  `!${paths.src}/**/_{*,**/*}`,
]
paths.css = [
  `${paths.src}/css/normalize.css`,
  // `${paths.src}/css/fonts.css`,
  `${paths.src}/css/base.css`,
  `${paths.src}/css/global.css`,
  `${paths.src}/components/**/*.css`,
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

const marko = (done) => {
  return gulp.src(paths.marko)
    .pipe(sourcemaps.init())
    .pipe(each((content, file, callback) => {
      const filepath = './'+path.relative(__dirname, file.path)
      try {
        const template = require(filepath)
        file.extname = '.html'
        const templateRendered = template.renderToString({}, callback)
      }
      catch (err) {
        callback(err)
      }
    }))
    .on('error', function(err) {
      console.log(err);
      done()
    })
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.dest))
}

const css = (done) => {
  return gulp.src(paths.css, { sourcemaps: true })
    .pipe(sourcemaps.init())
    .pipe(concat('style.css'))
    .pipe(postcss([
        customProperties,
        nesting,
        autoprefixer,
    ]))
    .on('error', function(err) {
      console.log(err);
      done()
    })
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(`${paths.dest}/assets`));
}

const scripts = (done) => {
  return gulp.src(paths.scripts, { sourcemaps: true })
    .pipe(sourcemaps.init())
    .pipe(concat('app.js'))
    .pipe(babel())
    .on('error', function(err) {
      console.log(err);
      done()
    })
    // .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(`${paths.dest}/assets`));
}

const watch = () => {
  gulp.watch(`${paths.src}/**/*.marko`, marko)
  .on('all', (e, filepath) => {
    require('marko/hot-reload').handleFileModified(path.join(__dirname, filepath))
  })
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

const build = gulp.series(clean, gulp.parallel(copy, marko, css, scripts))
const dev = gulp.series(build, gulp.parallel(watch, serve))

exports.clean = clean
exports.copy = copy
exports.marko = marko
exports.css = css
exports.scripts = scripts
exports.watch = watch
exports.serve = serve
exports.build = build
exports.dev = dev
exports.default = dev