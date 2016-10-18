var gulp = require('gulp');
var babel = require('gulp-babel');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');

// es6 compile task
gulp.task('es6', function() {
  gulp.src('src/javascript/script.js')
    .pipe(babel())
    .pipe(gulp.dest('./demo/javascript/'))
});

// Sass compile task
gulp.task('sass', function() {
  gulp.src('./src/sass/*.scss')
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(gulp.dest('./demo/css/')); 
});

// watch task
gulp.task( 'watch', [ 'es6', 'sass' ], function () {
  gulp.watch( [ './src/sass/*.scss' ], [ 'sass' ] );
  gulp.watch( [ './src/javascript/*.js' ], [ 'es6' ] );
});
