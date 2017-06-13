'use strict';

const uglify = require('uglify-js');
const assert = require('assert');

const ErrorMsg = Error([
    'can\'t load uglify-js',
    'npm install uglify-js',
    'https://github.com/mishoo/UglifyJS2'
].join('\n'));

/**
 * minify js data.
 *
 * @param data
 */
module.exports = (data, callback) => {
    assert(data);
    assert(callback);
    
    if (!uglify)
        return callback(ErrorMsg);
    
    const result = uglify.minify(data);
    const error = result.error;
    const code = result.code;
    
    callback(error, code);
};

