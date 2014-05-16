/* сжимаем код через htmlMinify */

(function(){
    'use strict';
    
    var main        = global.minify.main,
        Util        = main.util,
        js          = main.librequire('js'),
        cheerio     = require('cheerio'),
        Minifier    = main.require('html-minifier'),
        entities    = require('entities'),
        
        ErrorMsg    = 'can\'t load html-minifier        \n'     +
                      'npm install html-minifier        \n'     +
                      'https://github.com/kangax/html-minifier',
        
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
            removeStyleLinkTypeAttributes:  true
        };
    
    function optimizeJS(data) {
        var i, n, optimizeCur, dataJS, ret,
            bind        = Util.bind,
            $           = cheerio.load(data, {
                encodeEntities: false
            }),
            script      = $('script'),
            length      = script.length,
            cur         = script.first(),
            optimize    = function(current, error, data) {
                if (!error)
                    current.text(data);
            };
        
        if (length) {
            dataJS          = cur.text();
            optimizeCur     = bind(optimize, cur);
            
            /* uglilfy js is sync func that work with callback */
            js._uglifyJS(dataJS, optimizeCur);
            
            for (i = 1; i < n; i++) {
                cur         = script.next();
                optimizeCur = bind(optimize, cur);
                dataJS      = cur.text();
                
                js._uglifyJS(dataJS, optimizeCur);
            }
            
            ret = entities.decodeHTML($.html());
            
            return ret;
        }
    }
    
    /** 
     * minify html data.
     * 
     * @param data
     * @param callback
     */
    exports.htmlMinify = function(data, callback) {
        var error, dataOptimized;
        
        if (Minifier) {
            dataOptimized = optimizeJS(data);
            
            error = Util.tryCatch(function() {
                dataOptimized = Minifier.minify(dataOptimized, Options);
            });
        } else
            error = ErrorMsg;
        
        Util.exec(callback, error, dataOptimized);
    };
})();
