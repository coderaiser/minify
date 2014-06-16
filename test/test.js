(function() {
    'use strict';
    
    var DIR         = __dirname + '/../',
        
        fs          = require('fs'),
        filename    = DIR + 'test/test.js',
        
        minify      = require(DIR + 'minify'),
        uglify      = require('uglify-js');
    
    exports.uglify  = function() {
        fs.readFile(filename, 'utf8', function(error, data) {
            var uglified;
            
            if (error) {
                throw(error);
            } else {
                uglified    = _uglifyJS(data);
                
                minify.optimizeData({
                    ext: '.js',
                    data: data,
                }, function(error, data) {
                    var result = error || uglified !== data;
                    
                    if (result)
                        throw('uglify-js: Not OK');
                    else
                        console.log('uglify-js: OK');
                });
                
            }
        });
        
        function _uglifyJS(data) {
            var result = uglify.minify(data, {
                fromString: true
            });
            
            return result.code;
        }
    };
})();
