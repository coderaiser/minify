/* сжимаем код через clean-css */
'use strict';

const assert = require('assert');
const tryCatch = require('try-catch');
const Clean = require('clean-css');

const ErrorMsg = Error([
    'can\'t load clean-css',
    'npm install clean-css',
    'https://github.com/GoalSmashers/clean-css'
].join('\n'));

/**
 * minify css data.
 *
 * @param data
 * @param callback
 */
module.exports = (data, callback) => {
    assert(data);
    assert(callback);
    
    if (!Clean)
        return callback(ErrorMsg);
    
    let dataOptimized;
    let errorParse;
    
    const error = tryCatch(() => {
        const min = new Clean().minify(data);
        
        dataOptimized = min.styles;
        errorParse = min.errors[0];
    });
    
    callback(errorParse || error, dataOptimized);
};

