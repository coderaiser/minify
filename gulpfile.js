(function() {
    'use strict';
    
    var gulp        = require('gulp'),
        jshint      = require('gulp-jshint'),
        
        test        = require('./test/test'),
        
        LIB         = './lib/',
        Src         = [
            './*.js',
            'test/**/*.js',
            LIB + '/**/*.js'
        ];
    
    gulp.task('jshint', function() {
        gulp.src(Src)
            .pipe(jshint())
            .pipe(jshint.reporter())
            .on('error', onError);
    });
    
    gulp.task('test', function() {
       test.uglify();
    });
    
    gulp.task('default', ['jshint', 'test']);
    
    function onError(params) {
        console.log(params.message);
    }
    
})();
