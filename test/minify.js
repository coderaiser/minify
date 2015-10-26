(function() {
    'use strict';
    
    let minify          = require('..'),
        test            = require('tape'),
        CleanCSS        = require('clean-css'),
        uglify          = require('uglify-js'),
        htmlMinifier    = require('html-minifier');
    
    test('js', t => {
        let js = 'function hello(world) {\nconsole.log(world);\n}';
        
        minify.js(js, (error, data) => {
            let min = uglify.minify(data, {fromString: true}).code;
            
            t.equal(data, min, 'js output should be equal');
            t.end();
        });
    });
    
    test('html', t => {
        let html    = '<html>\n<body>\nhello world\n</body></html>';
        
        let options = {
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
        
        minify.html(html, (error, data) => {
            let min = htmlMinifier.minify(data, options);
            
            t.equal(data, min, 'html output should be equal');
            t.end();
        });
    });
    
    test('css', t => {
        var css     =   'color: #FFFFFF';
        
        minify.css(css, (error, data) => {
            let min = new CleanCSS().minify(css);
            
            t.equal(data, min.styles, 'css output should be equal');
            t.end();
        });
    });
    
    test('arguments: no', t => {
        t.throws(minify, /name could not be empty!/, 'name empty check');
        t.end();
    });
    
    test('arguments: no callback', t => {
        let fn = name => () => minify(name);
        
        t.throws(fn('hello.css'), /callback should be function!/, 'callback check');
        t.end();
    });
})();
