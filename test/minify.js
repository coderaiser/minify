'use strict';

const fs = require('fs');

const minify = require('..');

const tryToCatch = require('try-to-catch');
const test = require('supertape');
const CleanCSS = require('clean-css');
const terser = require('terser');
const htmlMinifier = require('html-minifier');

test('js', async (t) => {
    const js = 'function hello(world) {\nconsole.log(world);\n}';
    
    const minifyOutput = await minify.js(js);
    const terserOutput = terser.minify(js).code;
    
    t.equal(minifyOutput, terserOutput, 'js output should be equal');
    t.end();
});

test('js: with alternate options', async (t) => {
    const js = 'function isTrueFalse() { if (true !== false) { return true; } }';
    
    const options = {
        js: {
            compress: {
                booleans_as_integers: true,
            },
        },
    };
    
    const minifyOutputWithoutOptions = await minify.js(js);
    const minifyOutput = await minify.js(js, options);
    const terserOutput = terser.minify(js, options.js).code;
    
    t.equal(minifyOutput, terserOutput, 'js output should be equal');
    t.notEqual(minifyOutput, minifyOutputWithoutOptions, 'options should influence the output');
    t.end();
});

test('html', async (t) => {
    const html = '<html>\n<body>\nhello world\n</body></html>';
    
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
        minifyCSS:                      true,
    };
    
    const minifyOutput = await minify.html(html);
    const htmlMinifierOutput = htmlMinifier.minify(html, options);
    
    t.equal(minifyOutput, htmlMinifierOutput, 'html output should be equal');
    t.end();
});

test('html: with alternate options', async (t) => {
    const html = '<html>\n<body>\nhello world\n</body></html>';
    
    const options = {
        html: {
            removeOptionalTags: false,
        },
    };
    
    const minifyOutputWithoutOptions = await minify.html(html);
    const minifyOutput = await minify.html(html, options);
    const htmlMinifierOutput = htmlMinifier.minify(minifyOutput, options.html);
    
    t.equal(minifyOutput, htmlMinifierOutput, 'html output should be equal');
    t.notEqual(minifyOutput, minifyOutputWithoutOptions, 'options should influence output');
    t.end();
});

test('css', async (t) => {
    const css = 'color: #FFFFFF';
    
    const minifyOutput = await minify.css(css);
    const {styles} = new CleanCSS().minify(css);
    
    t.equal(minifyOutput, styles, 'css output should be equal');
    t.end();
});

test('css: with alternate options', async (t) => {
    const css = '.gradient { -ms-filter: \'progid:DXImageTransform.Microsoft.Gradient(startColorStr="#ffffff", endColorStr="#000000", GradientType=1)\'; background-image: linear-gradient(to right, #ffffff 0%, #000000 100%); }';
    const options = {
        css: {
            compatibility: {
                properties: {
                    ieFilters: true,
                },
            },
        },
    };
    
    const minifyOutputWithoutOptions = await minify.css(css);
    const minifyOutput = await minify.css(css, options);
    const {styles} = new CleanCSS(options.css).minify(css);
    
    t.equal(minifyOutput, styles, 'css output should be equal');
    t.notEqual(minifyOutput, minifyOutputWithoutOptions, 'options should influence output');
    t.end();
});

test('css: base64', async (t) => {
    const dir = `${__dirname}/fixtures`;
    const pathToCSS = `${dir}/style.css`;
    const pathToMinifiedCSS = `${dir}/style.min.css`;
    
    const minifiedCSS = fs.readFileSync(pathToMinifiedCSS, 'utf8');
    const outputCSS = await minify(pathToCSS);
    
    t.equal(outputCSS, minifiedCSS, 'should be equal');
    t.end();
});

test('arguments: no', async (t) => {
    const [e] = await tryToCatch(minify);
    t.equal(e.message, 'name could not be empty!', 'throw when name empty');
    t.end();
});

