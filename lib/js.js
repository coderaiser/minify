'use strict';

const uglify = require('uglify-js');
const assert = require('assert');

/**
 * minify js data.
 *
 * @param data
 */
module.exports = async (data) => {
    assert(data);
    
    const {
        error,
        code,
    } = uglify.minify(data);
    
    if (error)
        throw error;
    
    return code;
};

