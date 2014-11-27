/* сжимаем код через uglify-js */

(function(){
    'use strict';
    
    var uglify      = require('uglify-js'),
        
        check       = require('checkup'),
        exec        = require('execon'),
        
        ErrorMsg    = Error([
            'can\'t load uglify-js',
            'npm install uglify-js',
            'https://github.com/mishoo/UglifyJS2'].join('\n'));
    
    /** 
     * minify js data.
     * 
     * @param data
     */
    module.exports = function (data, callback) {
        var error, dataOptimized;
        
        check(arguments, ['data', 'callback']);
        
        if (!uglify)
            error = ErrorMsg;
        else
            error = exec.try(function() {
                dataOptimized = uglify.minify(data, {fromString: true}).code;
            });
        
        callback(error, dataOptimized);
    };

})();
