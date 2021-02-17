'use strict';

const {readFile} = require('fs/promises');

const minify = require('..');

const tryToCatch = require('try-to-catch');
const test = require('supertape');
const CleanCSS = require('clean-css');
const terser = require('terser');
const htmlMinifier = require('html-minifier-terser');

test('js', async (t) => {
    const js = 'function hello(world) {\nconsole.log(world);\n}';
    
    const minifyOutput = await minify.js(js);
    const {code} = await terser.minify(js);
    
    t.equal(code, minifyOutput, 'js output should be equal');
    t.end();
});

test('js: with alternate options', async (t) => {
    const js = 'function isTrueFalse() { if (true !== false) { return true; } }';
    const expected = 'function isTrueFalse(){return 1}';
    
    const options = {
        js: {
            compress: {
                booleans_as_integers: true,
            },
        },
    };
    
    const minifyOutputWithoutOptions = await minify.js(js);
    const minifyOutput = await minify.js(js, options);
    
    t.equal(minifyOutput, expected, 'js output should be equal');
    t.notEqual(minifyOutput, minifyOutputWithoutOptions, 'options should influence the output');
    t.end();
});

test('html', async (t) => {
    const html = '<html>\n<body>\nhello world\n</body></html>';
    
    const options = {
        removeComments: true,
        removeCommentsFromCDATA: true,
        removeCDATASectionsFromCDATA: true,
        collapseWhitespace: true,
        collapseBooleanAttributes: true,
        removeAttributeQuotes: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        /* оставляем, поскольку у нас
         * в элемент fm генерируеться
         * таблица файлов
         */
        removeEmptyElements: false,
        removeOptionalTags: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        
        minifyJS: true,
        minifyCSS: true,
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
    const dir = `${__dirname}/fixture`;
    const pathToCSS = `${dir}/style.css`;
    const pathToMinifiedCSS = `${dir}/style.min.css`;
    
    const outputCSS = await minify(pathToCSS);
    const result = `${outputCSS}\n`;
    const expected = await readFile(pathToMinifiedCSS, 'utf8');
    
    t.equal(result, expected, 'image should be inlined');
    t.end();
});

test('css: base64 with alternate options', async (t) => {
    const pathToCSS = `${__dirname}/fixture/style.css`;
    const options = {img: {maxSize: 512}};
    
    const result = await minify(pathToCSS, options);
    const expected = ".header{background-url:url('ok.png')}";
    
    t.equal(result, expected, 'image should not be inlined since options define it as too big');
    t.end();
});

test('css: with errors', async (t) => {
    const css = '@import "missing.css";';
    
    const [e] = await tryToCatch(minify.css, css);
    
    t.equal(e, 'Ignoring local @import of "missing.css" as resource is missing.', 'throw when clean-css reports an error');
    t.end();
});

test('arguments: no', async (t) => {
    const [e] = await tryToCatch(minify);
    t.equal(e.message, 'name could not be empty!', 'throw when name empty');
    t.end();
});

test('unsupported file extension', async (t) => {
    const pathToFile = `${__dirname}/fixture/unsupported.md`;

    const [e] = await tryToCatch(minify, pathToFile);

    t.equal(e?.message, 'File type "md" not supported.', 'throw when file extension is unsupported');
    t.end();
});

