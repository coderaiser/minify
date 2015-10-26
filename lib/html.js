/* сжимаем код через htmlMinify */

(function() {
    'use strict';
    
    var assert      = require('assert'),
        tryCatch    = require('try-catch'),
        Minifier    = require('html-minifier'),
        
        ErrorMsg    = Error([
            'can\'t load html-minifier',
            'npm install html-minifier',
            'https://github.com/kangax/html-minifier'].join('\n')),
        
        Options     = {
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
    module.exports = function(data, callback) {
        var error;
        
        assert(data);
        assert(callback);
        
        if (!Minifier)
            error   = ErrorMsg;
        else
            error   = tryCatch(function() {
                data = Minifier.minify(data, Options);
            });
        
        callback(error, data);
    };
})();
