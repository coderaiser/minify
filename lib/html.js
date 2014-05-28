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
    
    function optimizeInlines(data) {
        var isScript, isStyle,
            $           = cheerio.load(data),
            
            optimize    = function(name, optimizeFunc) {
                var elements    = $(name),
                    length      = elements.length;
                
                elements.each(function(i, element) {
                    var el      = $(element),
                        data    = el.text();
                    
                    optimizeFunc(data, function(error, data) {
                        if (!error)
                            el.text(data);
                    });
                });
                
                return length > 0;
            };
            
        isStyle     = optimize('style', function(dataCur, optimizeCur) {
            css._cleanCSS(dataCur, optimizeCur);
        });
        
        isScript    = optimize('script', function(dataCur, optimizeCur) {
            js._uglifyJS(dataCur, optimizeCur);
        });
        
        if (isStyle || isScript)
            data = entities.decodeHTML($.html());
        
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
            data    = optimizeInlines(data);
            
            error   = Util.exec.try(function() {
                data = Minifier.minify(data, Options);
            });
        } else
            error = ErrorMsg;
        
        Util.exec(callback, error, data);
    };
})();
