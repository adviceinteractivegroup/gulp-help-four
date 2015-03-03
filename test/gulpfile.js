'use strict';

var gulp = require('gulp');
require('../index')(gulp);

gulp.task('default', 'Custom description', function(cb) {
  console.log('ok');
});

gulp.task('test', 'Test', function (cb) {
  console.log('basic test');
});

gulp.task('test:child', 'Child', function (cb) {
  console.log('child test');
});

gulp.task('test:nested:child', function (cb) {
  console.log('nested child');
});

gulp.task(function ok(cb) {
  console.log('cant use anonymous without a name');
});
