#!/usr/bin/env node

/* minify binary
 * usage: node minify <input-file> <output-file>
 */
(function() {
    'use strict';
    
    var Util        = require('util-io'),
        
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
        files       = Util.slice(Argv, 2),
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
        if (!In || Util.strCmp(In, ['-h', '--help']))
            log('minify <input-file1> <input-file2> <inputfileN>\n');
        
        else if (Util.strCmp(In, ['-js', '-css', '-html']))
            readStd(processStream);
        
        else if (Util.strCmp(In, ['-v', '--version']) )
            log('v' + Version);
        
        else if (In)
            uglifyFiles(files);
    }
    
    function processStream(chunks) {
        if (chunks && In)
            getMinify()({
                ext     : Util.replaceStr(In, '-', '.'),
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
            
            return minify.bind(null, current, {
                notLog  : true,
            });
        });
        
        Util.exec.parallel(funcs, function(error) {
            var args = Util.slice(arguments, 1);
            
            if (error)
                log.error(error.message);
            else
                log.apply(null, args);
        });
    }
    
})();
