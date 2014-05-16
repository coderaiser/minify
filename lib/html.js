/* сжимаем код через htmlMinify */

(function(){
    'use strict';
    
    var main        = global.minify.main,
        Util        = main.util,
        js          = main.librequire('js'),
        css         = main.librequire('css'),
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
        var i, n, optimizeCur, dataJS,
            bind        = Util.bind,
            $           = cheerio.load(data),
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
            
            data = entities.decodeHTML($.html());
        }
        
        return data;
    }
    
    function optimizeCSS(data) {
        var dataCSS, optimizeCur, i, n,
            bind        = Util.bind,
            $           = cheerio.load(data),
            style      = $('style'),
            length      = style.length,
            cur         = style.first(),
            optimize    = function(current, error, data) {
                if (!error)
                    current.text(data);
            };
            
        if (length) {
            dataCSS          = cur.text();
            optimizeCur     = bind(optimize, cur);
            
            /* uglilfy js is sync func that work with callback */
            css._cleanCSS(dataCSS, optimizeCur);
            
            for (i = 1; i < n; i++) {
                cur         = style.next();
                optimizeCur = bind(optimize, cur);
                dataCSS     = cur.text();
                
                css._cleanCSS(dataCSS, optimizeCur);
            }
            
            data = entities.decodeHTML($.html());
        }
        
        return data;
    }
    
    /** 
     * minify html data.
     * 
     * @param data
     * @param callback
     */
    exports.htmlMinify = function(data, callback) {
        var error;
        
        if (Minifier) {
            data    = optimizeJS(data);
            data    = optimizeCSS(data);
            error   = Util.tryCatch(function() {
                data = Minifier.minify(data, Options);
            });
        } else
            error = ErrorMsg;
        
        Util.exec(callback, error, data);
    };
})();
