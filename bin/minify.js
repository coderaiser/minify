#!/usr/bin/env node

/* minify binary
 * usage: node minify <input-file> <output-file>
 */
(function() {
    'use strict';
    
    var Util        = require('util-io'),
        pipe        = require('pipe-io'),
        
        Pack        = require('../package.json'),
        Version     = Pack.version,
        
        log         = function() {
            console.log.apply(console, arguments);
        },
        
        getMinify   = function() {
            return require('..');
        },
        
        isTTY       = process.stdin.isTTY,
        
        Argv        = process.argv,
        files       = Util.slice(Argv, 2),
        In          = files[0];
        
        log.error   = console.error;
    
    process.on('uncaughtException', function(error) {
        if (error.code !== 'EPIPE')
            log(error.message);
    });
    
    if (isTTY)
        minify();
    else
        pipe.getBody(process.stdin, function(error, chunks) {
            minify(chunks);
        });
    
    function minify(chunks) {
        if (chunks && In)
            getMinify().optimizeData({
                ext     : Util.replaceStr(In, '-', '.'),
                data    : chunks
            }, function(error, data) {
                if (error)
                    log.error(error.message);
                else
                    log(data);
            });
        
        else if (!In || Util.strCmp(In, ['-h', '--help']))
            log('minify <input-file1> <input-file2> <inputfileN>\n');
        
        else if (Util.strCmp(In, ['-v', '--version']) )
            log('v' + Version);
        
        else if (In)
            uglifyFiles(files);
    }
    
    function uglifyFiles(files) {
        var funcs = files.map(function(current) {
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
        });
    }

})();
