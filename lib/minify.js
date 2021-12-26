import {createCommons} from 'simport';

const {require} = createCommons(import.meta.url);

const {readFile} = require('fs/promises');
const path = require('path');

const tryToCatch = require('try-to-catch');

import debug from 'debug';
const log = debug('minify');

import js from './js.js';
import html from './html.js';
import css from './css.js';
import img from './img.js';

const minifiers = {
    js,
    html,
    css,
    img,
};

const {assign} = Object;

assign(minify, minifiers);

function check(name) {
    if (!name)
        throw Error('name could not be empty!');
}

export async function minify(name, userOptions) {
    const EXT = ['js', 'html', 'css'];
    
    check(name);
    
    const type = process.argv.find(arg => EXT.includes(arg.slice(2)))?.slice(2) ?? path.extname(name).slice(1);
    const is = EXT.includes(type);
    
    if (!is)
        throw Error(`File type "${type}" not supported.`);
    
    log('optimizing ' + path.basename(name));
    return await optimize(name, userOptions, type);
}

/**
 * function minificate js, css and html files
 *
 * @param {string} file - js, css or html file path
 * @param {object} userOptions - object with optional `html`, `css, `js`, and `img` keys, which each can contain options to be combined with defaults and passed to the respective minifier
 * @param {string} type - file type based on extension or user-supplied argument (--js, --css, --html)
 */
async function optimize(file, userOptions, type) {
    check(file);
    
    log('reading file ' + path.basename(file));
    
    const data = await readFile(file, 'utf8');
    return await onDataRead(file, data, userOptions, type);
}

/**
 * Processing of files
 * @param {string} filename
 * @param {string} data - the contents of the file
 * @param {object} userOptions - object with optional `html`, `css, `js`, and `img` keys, which each can contain options to be combined with defaults and passed to the respective minifier
 * @param {string} type - file type based on extension or user-supplied argument (--js, --css, --html)
*/
async function onDataRead(filename, data, userOptions, type) {
    log('file ' + path.basename(filename) + ' read');
    
    const optimizedData = await minifiers[type](data, userOptions);
    
    let b64Optimize;
    
    if (type === 'css')
        [, b64Optimize] = await tryToCatch(minifiers.img, filename, optimizedData, userOptions);
    
    return b64Optimize || optimizedData;
}

