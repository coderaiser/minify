(function() {
    'use strict';
    
    var path        = require('path'),
        
        assert      = require('assert'),
        B64img      = require('css-b64-images'),
        
        ONE_KB      = Math.pow(2, 10),
        MAX_SIZE    = 100 * ONE_KB,
        OPTIONS     = {
            maxSize: MAX_SIZE
        },
        
        ErrorMsg    = Error([
            'can\'t load css-b64-images',
            'npm install css-b64-images',
            'https://github.com/Filirom1/css-base64-images'].join('\n'));
    
    /**
     * minify css data.
     * if can not minify return data
     *
     * @param name
     * @param data
     * @param callback
     */
    module.exports = function(name, data, callback) {
        var dir         = path.dirname(name),
            dirRelative = dir + '/../';
        
        assert(name);
        assert(data);
        assert(callback);
        
        if (!B64img)
            callback(ErrorMsg);
        else
            B64img.fromString(data, dir, dirRelative, OPTIONS, function(error, css) {
                callback(null, css);
            });
    };
})();
