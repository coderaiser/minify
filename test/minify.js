import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname} from 'node:path';
import tryToCatch from 'try-to-catch';
import test from 'supertape';
import CleanCSS from 'clean-css';
import {transform as lightningcssTransform} from 'lightningcss';
import {minify as terserMinify} from 'terser';
import {minify as putoutMinify} from '@putout/minify';
import htmlMinifier from 'html-minifier-terser';
import * as esbuild from 'esbuild';
import swc from '@swc/core';
import montag from 'montag';
import {minify} from '../lib/minify.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

test('minify: not found', async (t) => {
    const [error] = await tryToCatch(minify, 'hello.xxx');
    
    t.equal(error.message, 'File type "xxx" not supported.');
    t.end();
});

test('minify: js', async (t) => {
    const js = 'function hello(world) {\nconsole.log(world);\n}';
    
    const minifyOutput = await minify.js(js);
    const code = await putoutMinify(js);
    
    t.equal(code, minifyOutput, 'js output should be equal');
    t.end();
});

test('minify: js: terser', async (t) => {
    const js = 'hello(`x`); function hello(world) {\nconsole.log(world);\n}';
    
    const {code} = await terserMinify(js);
    const result = await minify.js(js, {
        js: {
            type: 'terser',
        },
    });
    
    t.equal(code, result);
    t.end();
});

test('minify: js: esbuild', async (t) => {
    const js = 'const a = 5; if (a) alert()';
    const {code} = await esbuild.transform(js, {
        minify: true,
    });
    
    const result = await minify.js(js, {
        js: {
            type: 'esbuild',
        },
    });
    
    t.equal(code, result);
    t.end();
});

test('minify: js: swc', async (t) => {
    const js = `import foo from '@src/app'; console.log(foo);`;
    const {code} = await swc.minify(js, {
        module: true,
    });
    
    const result = await minify.js(js, {
        js: {
            type: 'swc',
        },
    });
    
    t.equal(code, result);
    t.end();
});

test('minify: auto', async (t) => {
    const js = 'function hello(world) {\nconsole.log(world);\n}';
    const result = await minify.auto(js, {
        js: {
            putout: {
                removeUnusedVariables: false,
            },
        },
    });
    
    const expected = await putoutMinify(js, {
        removeUnusedVariables: false,
    });
    
    t.equal(result, expected);
    t.end();
});

test('minify: js: with alternate options', async (t) => {
    const js = 'const a = 5, b = 6; console.log(a);';
    const expected = 'const a=5,b=6;';
    
    const options = {
        js: {
            putout: {
                removeConsole: true,
                removeUnusedVariables: false,
            },
        },
    };
    
    const minifyOutput = await minify.js(js, options);
    
    t.equal(minifyOutput, expected, 'js output should be equal');
    t.end();
});

test('minify: auto: not found', async (t) => {
    const js = 'hello world';
    const result = await minify.auto(js, {
        js: {
            putout: {
                removeUnusedVariables: false,
            },
        },
    });
    
    t.notOk(result);
    t.end();
});

test('minify: html', async (t) => {
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
    const htmlMinifierOutput = await htmlMinifier.minify(html, options);
    
    t.equal(minifyOutput, htmlMinifierOutput, 'html output should be equal');
    t.end();
});

test('minify: html: with alternate options', async (t) => {
    const html = '<html>\n<body>\nhello world\n</body></html>';
    
    const options = {
        html: {
            removeOptionalTags: false,
        },
    };
    
    const minifyOutput = await minify.html(html, options);
    const htmlMinifierOutput = await htmlMinifier.minify(minifyOutput, options.html);
    
    t.equal(minifyOutput, htmlMinifierOutput, 'html output should be equal');
    t.end();
});

test('minify: html: with alternate options: influence', async (t) => {
    const html = '<html>\n<body>\nhello world\n</body></html>';
    
    const options = {
        html: {
            removeOptionalTags: false,
        },
    };
    
    const minifyOutputWithoutOptions = await minify.html(html);
    const minifyOutput = await minify.html(html, options);
    
    t.notDeepEqual(minifyOutput, minifyOutputWithoutOptions, 'options should influence output');
    t.end();
});

test('minify: css', async (t) => {
    const css = montag`
        body {
            color: '#FFFFFF';
        }
    `;
    
    const result = await minify.css(css);
    const expected = 'body{color:"#FFFFFF"}';
    
    t.equal(result, expected);
    t.end();
});

test('minify: css: options', async (t) => {
    const options = {
        level: {
            1: {
                specialComments: false,
            },
        },
    };
    
    const css = `
        body {
            color: red;
        }
        
        /*!
         * comments
         * comments
         * comments
         * comments
         * comments
         */
     `;
    
    const minifyOutput = await minify.css(css, {
        css: {
            'type': 'clean-css',
            'clean-css': options,
        },
    });
    
    const {styles} = new CleanCSS(options).minify(css);
    
    t.equal(minifyOutput, styles, 'css output should be equal');
    t.end();
});

test('minify: css: lightningcss', async (t) => {
    const css = montag`
        .tidy_swap {
          margin-block-end: 0.5em;
          padding: 0.125em;
          
          color: var(--submit-color);
          background: var(--submit-background);
          
          &:is(:hover, :focus) {
            color: var(--submit-background);
            background: var(--submit-color);
          }
        }
    `;
    
    const minifyOutput = await minify.css(css, {
        css: {
            type: 'lightningcss',
        },
    });
    
    const {code} = lightningcssTransform({
        code: Buffer.from(css),
        minify: true,
    });
    
    const result = String(code);
    
    t.equal(result, minifyOutput, 'css output should be equal');
    t.end();
});

test('minify: css: with alternate options', async (t) => {
    const css = `.gradient { -ms-filter: 'progid:DXImageTransform.Microsoft.Gradient(startColorStr="#ffffff", endColorStr="#000000", GradientType=1)'; background-image: linear-gradient(to right, #ffffff 0%, #000000 100%); }`;
    
    const options = {
        css: {
            'type': 'clean-css',
            'clean-css': {
                compatibility: {
                    properties: {
                        ieFilters: true,
                    },
                },
            },
        },
    };
    
    const minifyOutput = await minify.css(css, options);
    const {styles} = new CleanCSS(options.css['clean-css']).minify(css);
    
    t.equal(minifyOutput, styles, 'css output should be equal');
    t.end();
});

test('minify: css: with alternate options: influence', async (t) => {
    const css = `.gradient { -ms-filter: 'progid:DXImageTransform.Microsoft.Gradient(startColorStr="#ffffff", endColorStr="#000000", GradientType=1)'; background-image: linear-gradient(to right, #ffffff 0%, #000000 100%); }`;
    
    const options = {
        css: {
            'type': 'clean-css',
            'clean-css': {
                compatibility: {
                    properties: {
                        ieFilters: true,
                    },
                },
            },
        },
    };
    
    const minifyOutputWithoutOptions = await minify.css(css);
    const minifyOutput = await minify.css(css, options);
    
    t.notDeepEqual(minifyOutput, minifyOutputWithoutOptions, 'options should influence output');
    t.end();
});

test('minify: css: base64', async (t) => {
    const dir = `${__dirname}/fixture`;
    const pathToCSS = `${dir}/style.css`;
    const pathToMinifiedCSS = `${dir}/style.min.css`;
    
    const outputCSS = await minify(pathToCSS, {
        css: {
            type: 'clean-css',
        },
    });
    
    const result = `${outputCSS}\n`;
    const expected = await readFile(pathToMinifiedCSS, 'utf8');
    
    t.equal(result, expected, 'image should be inlined');
    t.end();
});

test('minify: css: base64 with alternate options', async (t) => {
    const pathToCSS = `${__dirname}/fixture/style.css`;
    
    const options = {
        img: {
            maxSize: 512,
        },
        css: {
            type: 'clean-css',
        },
    };
    
    const result = await minify(pathToCSS, options);
    const expected = `.header{background-url:url('ok.png')}`;
    
    t.equal(result, expected, 'image should not be inlined since options define it as too big');
    t.end();
});

test('minify: css: with errors', async (t) => {
    const css = '@import "missing.css";';
    
    const [e] = await tryToCatch(minify.css, css, {
        css: {
            type: 'clean-css',
        },
    });
    
    t.equal(e, 'Ignoring local @import of "missing.css" as resource is missing.', 'throw when clean-css reports an error');
    t.end();
});

test('minify: arguments: no', async (t) => {
    const [e] = await tryToCatch(minify);
    
    t.equal(e.message, 'name could not be empty!', 'throw when name empty');
    t.end();
});

test('minify: unsupported file extension', async (t) => {
    const pathToFile = `${__dirname}/fixture/unsupported.md`;
    
    const [e] = await tryToCatch(minify, pathToFile);
    
    t.equal(e?.message, 'File type "md" not supported.', 'throw when file extension is unsupported');
    t.end();
});
