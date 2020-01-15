'use strict';

const terser = require('terser');
const assert = require('assert');

/**
 * minify js data.
 *
 * @param data
 * @param userOptions - (optional) object that may contain a `js` key with an object of options
 */
module.exports = (data, userOptions) => {
    assert(data);
    
    const options = userOptions && userOptions.js || {};
    
    const {
        error,
        code,
    } = terser.minify(data, options);
    
    if (error)
        throw error;
    
    return code;
};

