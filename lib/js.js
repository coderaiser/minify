/* сжимаем код через uglify-js */

(function(){
    'use strict';
    
    var main        = global.minify.main,
        Util        = main.util,
        uglify      = main.require('uglify-js'),
        
        ErrorMsg    =   'can\'t load uglify-js          \n' +
                        'npm install uglify-js          \n' +
                        'https://github.com/mishoo/UglifyJS2';
    
    /** 
     * minify js data.
     * 
     * @param data
     */
    exports._uglifyJS = function (data, callback) {
        var error, dataOptimized;
        
        if (uglify)
            error = Util.exec.try(function() {
                dataOptimized = uglify.minify(data, {fromString: true}).code;
            });
        else
            error = ErrorMsg;
        
        Util.exec(callback, error, dataOptimized);
    };

})();
