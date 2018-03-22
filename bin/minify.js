#!/usr/bin/env node

'use strict';

const exec = require('execon');
const Pack = require('../package');
const Version = Pack.version;

const log = function() {
    console.log.apply(null, arguments);
    process.stdin.pause();
};

const Argv = process.argv;
const files = Argv.slice(2);
const In = files[0];

log.error = function() {
    console.error.apply(null, arguments);
    process.stdin.pause();
};

process.on('uncaughtException', (error) => {
    if (error.code !== 'EPIPE')
        log(error.message);
});

minify();

function readStd(callback) {
    const stdin = process.stdin;
    let chunks = '';
    const read = () => {
        const chunk = stdin.read();
        
        if (chunk)
            return chunks += chunk;
        
        stdin.removeListener('readable', read);
        callback(chunks);
    };
    
    stdin.setEncoding('utf8');
    stdin.addListener('readable', read);
}

function minify() {
    if (!In || /^(-h|--help)$/.test(In))
        return help();
    
    if (/^--(js|css|html)$/.test(In))
        return readStd(processStream);
    
    if (/^(-v|--version)$/.test(In))
        return log('v' + Version);
    
    uglifyFiles(files);
}

function processStream(chunks) {
    const minify = require('..');
    
    if (!chunks || !In)
        return;
    
    const name = In.replace('--', '');
    
    minify[name](chunks, (error, data) => {
        if (error)
            return log.error(error.message);
        
        log(data);
    });
}

function uglifyFiles(files) {
    const funcs = files.map((current) => {
        const minify = require('..');
        
        return minify.bind(null, current);
    });
    
    exec.parallel(funcs, function (error) {
        const args = [].slice.call(arguments, 1);
        
        if (error)
            return log.error(error.message);
        
        log.apply(null, args);
    });
}

function help() {
    const bin = require('../help');
    const usage = 'Usage: minify [options]';
    
    console.log(usage);
    console.log('Options:');
    
    Object.keys(bin).forEach((name) => {
        console.log('  %s %s', name, bin[name]);
    });
}

