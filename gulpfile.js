(function() {
    'use strict';
    
    var gulp        = require('gulp'),
        jshint      = require('gulp-jshint'),
        
        Util        = require('util-io'),
        changelog   = require('changelog-io'),
        
        fs          = require('fs'),
        test        = require('./test/test'),
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
        var version     = 'v' + Info.version,
            versionNew  = getNewVersion();
        
        if (versionNew)
            versionNew  = 'v' + versionNew;
        else
            versionNew  = version + '?';
        
        changelog(versionNew, function(error, msg) {
            if (error)
                console.error(error.message);
            else
                console.log(msg);
        });
    });
    
     gulp.task('package', function() {
        var data,
            msg         = 'ERROR: version is missing. gulp package --v<version>',
            version     = Info.version,
            versionNew  = getNewVersion();
        
        if (!versionNew) {
            console.log(msg);
        } else {
            Info.version    = versionNew;
            data            = JSON.stringify(Info, 0, 2) + '\n';
            Info.version    = version;
            
            fs.writeFile('package.json', data, function(error) {
                var msg = 'package: done';
                
                console.log(error || msg);
            });
        }
    });
    
    gulp.task('docs', function() {
        var version     = Info.version,
            versionNew  = getNewVersion(),
            msg         = 'ERROR: version is missing. gulp docs --v<version>';
        
        if (!versionNew) {
            console.log(msg);
        } else {
            replaceVersion('README.md', version, versionNew);
            replaceVersion('HELP.md', version, versionNew);
        }
    });
    
    gulp.task('release', ['changelog', 'docs', 'package']);
    gulp.task('default', ['jshint', 'test']);
    
    function onError(params) {
        console.log(params.message);
    }
    
    function getNewVersion() {
        var versionNew,
            argv        = process.argv,
            length      = argv.length - 1,
            last        = process.argv[length],
            regExp      = new RegExp('^--'),
            isMatch     = last.match(regExp);
            
        if (isMatch)
            versionNew  = last.substr(3);
        
        return versionNew;
    }
    
    function replaceVersion(name, version, versionNew, callback) {
         fs.readFile(name, 'utf8', function(error, data) {
                if (error) {
                    console.log(error);
                } else {
                    data = data.replace(version, versionNew);
                    
                    fs.writeFile(name, data, function(error) {
                        var msg = 'done: ' + name;
                        
                        console.log(error || msg);
                        Util.exec(callback);
                    });
                }
            });
    }
    
})();
