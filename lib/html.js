/* сжимаем код через htmlMinify */

'use strict';

const assert = require('assert');
const tryCatch = require('try-catch');
const Minifier = require('html-minifier');

const ErrorMsg = Error([
    'can\'t load html-minifier',
    'npm install html-minifier',
    'https://github.com/kangax/html-minifier'
].join('\n'));

const Options = {
    removeComments:                 true,
    removeCommentsFromCDATA:        true,
    removeCDATASectionsFromCDATA:   true,
    collapseWhitespace:             true,
    collapseBooleanAttributes:      true,
    removeAttributeQuotes:          true,
    removeRedundantAttributes:      true,
    useShortDoctype:                true,
    removeEmptyAttributes:          true,
    /* оставляем, поскольку у нас
     * в элемент fm генерируеться
     * таблица файлов
     */
    removeEmptyElements:            false,
    removeOptionalTags:             true,
    removeScriptTypeAttributes:     true,
    removeStyleLinkTypeAttributes:  true,
    
    minifyJS:                       true,
    minifyCSS:                      true
};

/**
 * minify html data.
 *
 * @param data
 * @param callback
 */
module.exports = (data, callback) => {
    assert(data);
    assert(callback);
    
    if (!Minifier)
        return callback(ErrorMsg);
    
    const error = tryCatch(() => {
        data = Minifier.minify(data, Options);
    });
    
    callback(error, data);
};
