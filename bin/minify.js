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
        
        log         = function() {
            console.log.apply(console, arguments);
            process.exit();
        },
        
        getMinify   = function() {
            return require('../minify');
        },
        
        Argv        = process.argv,
        files       = Util.slice(Argv, 2),
        In          = files[0];
    
    readStd(function() {
        if (Chunks && In) {
            getMinify().optimizeData({
                ext     : Util.replaceStr(In, '-', '.'),
                data    : Chunks
            }, function(error, data) {
                log(error || data);
            });
        }
        else if (!In || Util.strCmp(In, ['-h', '--help']))
            log('minify <input-file1> <input-file2> <inputfileN>\n');
        else if (Util.strCmp(In, ['-v', '--version']) )
            log('v' + Version);
        else if (In)
            files.forEach(function(current) {
                getMinify().optimize(current, {
                    notLog  : true,
                }, function(error, data) {
                    log(error || data);
                });
            });
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
