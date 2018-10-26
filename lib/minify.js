'use strict';

const DIR = __dirname + '/';

const fs = require('fs');
const path = require('path');
const {
    promisify,
} = require('util');

const tomas = require('tomas');
const tryToCatch = require('try-to-catch');

const tomasCheck = promisify(tomas.check);
const tomasRead = promisify(tomas.read);
const tomasWrite = promisify(tomas.write);
const readFile = promisify(fs.readFile);

const log = require('debug')('minify');

['js', 'html', 'css', 'img'].forEach((name) => {
    minify[name] = require(DIR + name);
});

module.exports = minify;

function check(name) {
    if (!name)
        throw Error('name could not be empty!');
}

async function minify(name, options) {
    const EXT = ['js', 'html', 'css'];
    
    check(name);
    
    const ext = path.extname(name).slice(1);
    const is = ~EXT.indexOf(ext);
    
    if (!is)
        throw Error(`File type "${ext}" not supported.`);
    
    const [isOptimized] = await tryToCatch(tomasCheck, name);
    
    if (!isOptimized) {
        log('optimizing ' + path.basename(name));
        await optimize(name);
    }
    
    return tomasRead(name, options);
}

function getName(file) {
    const notObj = typeof file !== 'object';
    
    if (notObj)
        return file;
    
    return Object.keys(file)[0];
}

/**
 * function minificate js,css and html files
 *
 * @param files     -   js, css or html file path
 * @param options   -   object contain main options
 */
async function optimize(file) {
    check(file);
    
    const name = getName(file);
    
    log('reading file ' + path.basename(name));
    
    const data = await readFile(name, 'utf8');
    return onDataRead(file, data);
}

/**
* Processing of files
* @param fileData {name, data}
*/
async function onDataRead(filename, data) {
    log('file ' + path.basename(filename) + ' read');
    
    const ext = path.extname(filename).replace(/^\./, '');
    
    await minify[ext](data);
    
    let optimizedData;
    
    if (ext !== 'css')
        optimizedData = await tryToCatch(minify.img, filename, data);
    
    log('writing ' + filename);
    return tomasWrite(filename, optimizedData || data);
}

