/* сжимаем код через clean-css */
(function(){
    'use strict';
    
    var check       = require('checkup'),
        exec        = require('execon'),
        Clean       = require('clean-css'),
        
        ErrorMsg    = Error([
            'can\'t load clean-css',
            'npm install clean-css',
            'https://github.com/GoalSmashers/clean-css'].join('\n'));
    
    /**
     * minify css data.
     * 
     * @param data
     * @param callback
     */
    module.exports = function(data, callback){
        var error, errorParse, dataOptimized;
        
        check(arguments, ['data', 'callback']);
        
        if (!Clean)
            error   = ErrorMsg;
        else
            error   = exec.try(function() {
                var min         = new Clean().minify(data);
                dataOptimized   = min.styles;
                errorParse      = min.errors[0];
            });
        
        callback(error || errorParse, dataOptimized);
    };
})();
