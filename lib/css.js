/* сжимаем код через clean-css */
(function(){
    'use strict';
    
    var Util        = require('util-io'),
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
        var error, dataOptimized;
        
        Util.check(arguments, ['data', 'callback']);
        
        if (!Clean)
            error   = ErrorMsg;
        else
            error   = Util.exec.try(function() {
                dataOptimized   = new Clean().minify(data);
            });
        
        callback(error, dataOptimized);
    };
})();
