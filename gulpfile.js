(function() {
    'use strict';
    
    var gulp        = require('gulp'),
        jshint      = require('gulp-jshint'),
        
        Util        = require('util-io'),
        fs          = require('fs'),
        test        = require('./test/test'),
        exec        = require('child_process').exec,
        Info        = require('./package'),
        
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
    
    gulp.task('changelog', function() {
        var version = 'v' + Info.version,
            name    = 'ChangeLog';
        
        Util.exec.parallel([
            Util.exec.with(exec, 'shell/log.sh ' + version),
            Util.exec.with(fs.readFile, name, 'utf8'),
            ], function(error, execParams, fileData) {
                var DATA        = 0,
                    STD_ERR     = 1,
                    execData    = execParams[DATA],
                    date        = Util.getShortDate(),
                    head        = date + ', ' + version + '?\n\n',
                    data        = head + execData + fileData;
                
                error   = error || execParams[STD_ERR];
                
                if (error)
                    console.log(error);
                else
                    fs.writeFile(name, data, function(error) {
                        var msg = 'changelog: done';
                        
                        console.log(error || msg);
                    });
            });
    });
    
    gulp.task('default', ['jshint', 'test']);
    
    function onError(params) {
        console.log(params.message);
    }
    
})();
