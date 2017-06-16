'use strict';

const DIR = __dirname + '/';

const fs = require('fs');
const path = require('path');
const exec = require('execon');
const tomas = require('tomas');
const log = require('debug')('minify');

['js', 'html', 'css', 'img'].forEach((name) => {
    minify[name] = require(DIR + name);
});

module.exports  = minify;

function check(name, callback) {
    if (!name)
        throw Error('name could not be empty!');
    
    if (typeof callback !== 'function')
        throw Error('callback should be function!');
}

function minify(name, options, callback) {
    const EXT = ['js', 'html', 'css'];
    
    if (!callback)
        callback = options;
    
    check(name, callback);
    
    const ext = path.extname(name).slice(1);
    const is = ~EXT.indexOf(ext);
    
    if (!is)
        return callback(Error(`File type "${ext}" not supported.`));
    
    tomas.check(name, (is) => {
        exec.if(is, () => {
            tomas.read(name, options, callback);
        }, (fn) => {
            log('optimizing ' + path.basename(name));
            optimize(name, (error) => {
                !error ? fn() : callback(error);
            });
        });
    });
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
function optimize(file, callback) {
    check(file, callback);
    
    const name = getName(file);
    
    log('reading file ' + path.basename(name));
    
    fs.readFile(name, 'utf8', (error, data) => {
        if (error)
            return callback(error);
        
        onDataRead(file, data, callback);
    });
}

/**
* Processing of files
* @param fileData {name, data}
*/
function onDataRead(filename, data, callback) {
    log('file ' + path.basename(filename) + ' read');
    
    const ext = path.extname(filename).replace(/^\./, '');
    
    minify[ext](data, (error, data) => {
        if (error)
            return callback(error);
            
        exec.if(ext !== 'css', (error, optimizedData) => {
            const isStr = typeof optimizedData === 'string';
            
            if (isStr)
                data = optimizedData;
            
            log('writing ' + filename);
            tomas.write(filename, data, callback);
        }, (callback) => {
            minify.img(filename, data, callback);
        });
    });
}

