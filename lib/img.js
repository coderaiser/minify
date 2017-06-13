'use strict';

const path = require('path');
const assert = require('assert');

const B64img = require('css-b64-images');

const ONE_KB = Math.pow(2, 10);

const maxSize = 100 * ONE_KB;
const OPTIONS = {
    maxSize
};

const ErrorMsg = Error([
    'can\'t load css-b64-images',
    'npm install css-b64-images',
    'https://github.com/Filirom1/css-base64-images'
].join('\n'));

/**
 * minify css data.
 * if can not minify return data
 *
 * @param name
 * @param data
 * @param callback
 */
module.exports = (name, data, callback) => {
    const dir = path.dirname(name);
    const dirRelative = dir + '/../';
    
    assert(name);
    assert(data);
    assert(callback);
    
    if (!B64img)
        return callback(ErrorMsg);
    
    B64img.fromString(data, dir, dirRelative, OPTIONS, (error, css) => {
        callback(null, css);
    });
};
