/* сжимаем код через clean-css */
(function(){
    'use strict';
    
    var main        = global.minify.main,
        Util        = main.util,
        B64img      = main.require('css-b64-images'),
        
        ErrorMsg    = 'can\'n load css-b64-images \n'           +
                      'to use img minification you'             +
                      'need to install css-b64-images \n'       +
                      'npm install css-b64-images\n'            +
                      'https://github.com/Filirom1/css-base64-images';
    
    /**
     * minify css data.
     * if can not minify return pData
     * 
     * @param pData
     */
    exports.optimize = function(pData, pCallBack){
        if(!B64img){
            Util.log(ErrorMsg);
            Util.exec(pCallBack, pData);
        }
        else
            B64img.fromString(pData, '.', '', function(pError, pCSS){
                Util.log('minify: images converted to base64 and saved in css file');
                Util.exec(pCallBack, pCSS);
            });
    };
})();
