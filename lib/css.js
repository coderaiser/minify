/* сжимаем код через clean-css */
(function(){
    'use strict';
    
    var Util        = require('util-io'),
        Clean       = require('clean-css'),
        
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
        
        Util.checkArgs(arguments, ['data', 'callback']);
        
        if (!Clean)
            error       = {
                message: ErrorMsg
            };
        else
            error     = Util.exec.try(function() {
                dataOptimized   = new Clean().minify(data);
            });
        
        callback(error, dataOptimized);
    };
})();
