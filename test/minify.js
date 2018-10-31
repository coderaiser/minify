'use strict';

const fs = require('fs');

const minify = require('..');

const tryToCatch = require('try-to-catch');
const test = require('tape');
const CleanCSS = require('clean-css');
const uglify = require('uglify-js');
const htmlMinifier = require('html-minifier');

test('js', async (t) => {
    const js = 'function hello(world) {\nconsole.log(world);\n}';
    
    const data = await minify.js(js);
    const min = uglify.minify(data).code;
    
    t.equal(data, min, 'js output should be equal');
    t.end();
});

test('html', async (t) => {
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
    
    const data = await minify.html(html);
    const min = htmlMinifier.minify(data, options);
    
    t.equal(data, min, 'html output should be equal');
    t.end();
});

test('css', async (t) => {
    const css = 'color: #FFFFFF';
    
    const data = await minify.css(css);
    const {styles} = new CleanCSS().minify(css);
    
    t.equal(data, styles, 'css output should be equal');
    t.end();
});

test('css: base64', async (t) => {
    const dir =  `${__dirname}/fixtures`;
    const name = `${dir}/style.css`;
    const nameMin = `${dir}/style.min.css`;
    
    const min = fs.readFileSync(nameMin, 'utf8');
    const data = await minify(name);
    
    t.equal(data, min, 'should equal');
    t.end();
});

test('arguments: no', async (t) => {
    const [e] = await tryToCatch(minify);
    t.equal(e.message, 'name could not be empty!', 'throw when name empty');
    t.end();
});

