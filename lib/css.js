/* сжимаем код через clean-css */
(function(){
    'use strict';
    
    var main        = global.minify.main,
        Util        = main.util,
        Clean       = main.require('clean-css'),
        
        ErrorMsg    = 'can\'t load clean-css \n'                +
                      'npm install clean-css\n'                 +
                      'https://github.com/GoalSmashers/clean-css';
    
    /**
     * minify css data.
     * 
     * @param data
     * @param callback
     */
    exports._cleanCSS = function(data, callback){
        var error, dataOptimized;
        
        if (!Clean)
            error           = ErrorMsg;
        else
            dataOptimized   = new Clean().minify(data);
        
        Util.exec(callback, error, dataOptimized);
    };
})();
