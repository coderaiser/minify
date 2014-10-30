/* сжимаем код через uglify-js */

(function(){
    'use strict';
    
    var uglify      = require('uglify-js'),
        
        Util        = require('util-io'),
        
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
        
        if (!uglify)
            error = ErrorMsg;
        else
            error = Util.exec.try(function() {
                dataOptimized = uglify.minify(data, {fromString: true}).code;
            });
        
        Util.exec(callback, error, dataOptimized);
    };

})();
