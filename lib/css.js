/* сжимаем код через clean-css */
(function(){
    "use strict";
    
    var DIR         = process.cwd() + '/node_modules/minify/',
        main        = require(DIR   + 'lib/main'),
        
        LIBDIR      = main.LIBDIR,
        
        ErrorMsg    = 'can\'n load clean-css \n'                +
                      'to use css-minification you'             +
                      'need to install clean-css \n'            +
                      'npm install clean-css\n'                 +
                      'https://github.com/GoalSmashers/clean-css';
    
    /** 
     * connecting cleanCSS,
     * if we can't find it -
     * return false
     * 
     * @param pData
     */
    exports._cleanCSS = function(pData){
        var cleanCSS = main.require('clean-css');
        
        if(!cleanCSS)
            console.log(ErrorMsg);
        else
            pData =  cleanCSS.process(pData);
        
        return pData;
    };
})();
