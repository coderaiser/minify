(function(){
    'use strict';
    
    var main        = global.minify.main,
        path        = main.path,
        Util        = main.util,
        B64img      = main.require('css-b64-images'),
        
        ErrorMsg    = 'can\'t load css-b64-images \n'           +
                      'npm install css-b64-images\n'            +
                      'https://github.com/Filirom1/css-base64-images';
    
    /**
     * minify css data.
     * if can not minify return data
     * 
     * @param name
     * @param data
     * @param callback
     */
    exports.optimize = function(name, data, callback) {
        var dir = path.dirname(name) + '/../';
        
        if (!B64img) {
            Util.log(ErrorMsg);
            Util.exec(callback, data);
        } else
            B64img.fromString(data, name, dir, function(error, css) {
                Util.log('minify: images converted to base64 and saved in css file');
                Util.log(error);
                Util.exec(callback, css);
            });
    };
})();
