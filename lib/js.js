'use strict';

var uglify = require('uglify-js');
var assert = require('assert');

var ErrorMsg = Error([
    'can\'t load uglify-js',
    'npm install uglify-js',
    'https://github.com/mishoo/UglifyJS2'
].join('\n'));

/**
 * minify js data.
 *
 * @param data
 */
module.exports = function(data, callback) {
    assert(data);
    assert(callback);
    
    if (!uglify)
        return callback(ErrorMsg);
    
    var result = uglify.minify(data);
    var error = result.error;
    var code = result.code;
    
    callback(error, code);
};

