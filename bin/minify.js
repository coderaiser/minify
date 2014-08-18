#!/usr/bin/env node

/* minify binary
 * usage: node minify <input-file> <output-file>
 */
(function() {
    'use strict';
    
    var Util        = require('util-io'),
        
        Pack        = require('../package.json'),
        Version     = Pack.version,
        Chunks      = '',
        
        exit        = process.exit,
        
        log         = function() {
            console.log.apply(console, arguments);
        },
        
        getMinify   = function() {
            return require('..');
        },
        
        Argv        = process.argv,
        files       = Util.slice(Argv, 2),
        In          = files[0];
        
        log.error   = console.error;
    
    readStd(function() {
        var funcs;
        
        if (Chunks && In) {
            getMinify().optimizeData({
                ext     : Util.replaceStr(In, '-', '.'),
                data    : Chunks
            }, function(error, data) {
                if (error)
                    log.error(error.message);
                else
                    log(data);
                
                exit();
            });
        
        } else if (!In || Util.strCmp(In, ['-h', '--help'])) {
            log('minify <input-file1> <input-file2> <inputfileN>\n');
            exit();
        
        } else if (Util.strCmp(In, ['-v', '--version']) ) {
            log('v' + Version);
            exit();
        
        } else if (In) {
            funcs = files.map(function(current) {
                var minify = getMinify();
                
                return minify.optimize.bind(null, current, {
                    notLog  : true,
                });
            });
            
            Util.exec.parallel(funcs, function(error) {
                var args = Util.slice(arguments, 1);
                if (error)
                    log.error(error.message);
                else
                    log.apply(null, args);
                
                exit();
            });
        }
    });
    
    function readStd(callback) {
        process.stdin.on('readable', function() {
            var chunk = process.stdin.read();
            
            if (chunk !== null)
                Chunks += chunk;
            else
                callback();
        });
    }

})();
