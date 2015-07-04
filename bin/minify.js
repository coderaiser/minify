#!/usr/bin/env node

/* minify binary
 * usage: node minify <input-file> <output-file>
 */
(function() {
    'use strict';
    
    var exec        = require('execon'),
        Pack        = require('../package.json'),
        Version     = Pack.version,
        
        log         = function() {
            console.log.apply(console, arguments);
            process.stdin.pause();
        },
        
        getMinify   = function() {
            return require('..');
        },
        
        Argv        = process.argv,
        files       = Argv.slice(2),
        In          = files[0];
        
        log.error   = function() {
            console.error.apply(console, arguments);
            process.stdin.pause();
        };
    
    process.on('uncaughtException', function(error) {
        if (error.code !== 'EPIPE')
            log(error.message);
    });
    
    minify();
    
    function readStd(callback) {
        var stdin   = process.stdin,
            chunks  = '',
            read    = function() {
                var chunk = stdin.read();
                
                if (chunk) {
                    chunks += chunk;
                } else {
                    stdin.removeListener('readable', read);
                    callback(chunks);
                }
            };
        
        stdin.setEncoding('utf8');
        stdin.addListener('readable', read);
    }
    
    function minify() {
        if (!In || /^(-h|--help)$/.test(In))
            log('minify <input-file1> <input-file2> <inputfileN>');
        
        else if (/^(-js|-css|-html)$/.test(In))
            readStd(processStream);
        
        else if (/^(-v|--version)$/.test(In))
            log('v' + Version);
        
        else
            uglifyFiles(files);
    }
    
    function processStream(chunks) {
        if (chunks && In)
            getMinify()({
                ext     : In.replace('-', '.'),
                data    : chunks
            }, function(error, data) {
                if (error)
                    log.error(error.message);
                else
                    log(data);
            });
    }
    
    function uglifyFiles(files) {
        var funcs = files.map(function(current) {
            var minify = getMinify();
            
            return minify.bind(null, current);
        });
        
        exec.parallel(funcs, function(error) {
            var args = [].slice.call(arguments, 1);
            
            if (error)
                log.error(error.message);
            else
                log.apply(null, args);
        });
    }
    
})();
