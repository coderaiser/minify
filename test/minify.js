'use strict';

const fs = require('fs');

const minify        = require('..'),
    test            = require('tape'),
    CleanCSS        = require('clean-css'),
    uglify          = require('uglify-js'),
    htmlMinifier    = require('html-minifier');

test('js', t => {
    const js = 'function hello(world) {\nconsole.log(world);\n}';
    
    minify.js(js, (error, data) => {
        const min = uglify.minify(data, {fromString: true}).code;
        
        t.equal(data, min, 'js output should be equal');
        t.end();
    });
});

test('html', t => {
    const html    = '<html>\n<body>\nhello world\n</body></html>';
    
    const options = {
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
        const min = htmlMinifier.minify(data, options);
        
        t.equal(data, min, 'html output should be equal');
        t.end();
    });
});

test('css', t => {
    const css     =   'color: #FFFFFF';
    
    minify.css(css, (error, data) => {
        const min = new CleanCSS().minify(css);
        
        t.equal(data, min.styles, 'css output should be equal');
        t.end();
    });
});

test.only('css: base64', (t) => {
    const dir =  `${__dirname}/fixtures`;
    const name = `${dir}/style.css`;
    const nameMin = `${dir}/style.min.css`;
    
    const min = fs.readFileSync(nameMin, 'utf8');
    
    minify(name, (error, data) => {
        t.equal(min, data);
        t.end();
    });
});

test('arguments: no', t => {
    t.throws(minify, /name could not be empty!/, 'throw when name empty');
    t.end();
});

test('arguments: no callback', t => {
    const fn = name => () => minify(name);
    
    t.throws(fn('hello.css'), /callback should be function!/, 'throw when callback not function');
    t.end();
});
