#!/usr/bin/env node

'use strict';

const Pack = require('../package');
const Version = Pack.version;
const processOptions = require('../lib/processOptions');

const log = function(...args) {
    console.log(...args);
    process.stdin.pause();
};

const Argv = process.argv;
const cliParameters = Argv.slice(2);
const [In] = cliParameters;

log.error = (e) => {
    console.error(e);
    process.stdin.pause();
};

process.on('uncaughtException', (error) => {
    if (error.code !== 'EPIPE')
        log(error);
});

minify();

function readStd(callback) {
    const {stdin} = process;
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
    
    const [files, options] = processOptions(cliParameters);
    
    uglifyFiles(files, options);
}

async function processStream(chunks) {
    const minify = require('..');
    const tryToCatch = require('try-to-catch');
    
    if (!chunks || !In)
        return;
    
    const name = In.replace('--', '');
    
    const [e, data] = await tryToCatch(minify[name], chunks);
    
    if (e)
        return log.error(e);
    
    log(data);
}

function uglifyFiles(files, options) {
    const minify = require('..');
    const minifiers = files.map((file) => minify(file, options));
    
    Promise.all(minifiers)
        .then(logAll)
        .catch(log.error);
}

function logAll(array) {
    for (const item of array)
        log(item);
}

function help() {
    const bin = require('../help');
    
    const helpString = `Usage:
  minify [options]
    This will read from stdin and output to stdout.
  minify filePath [options]
    This will read from a file and output to stdout.

Examples:
  minify -h
    Print this message.
  
  cat hello.js > minify --js > hello.min.js
    Minify js as part of a pipeline of stream processors.
  
  minify hello.html --html-options="{\\"removeOptionalTags\\": false}" > hello.min.html
    Minify an html file, writing it to a new file, without removing optional tags.

Options:`;
    
    console.log(helpString);
    
    for (const name of Object.keys(bin)) {
        console.log('  %s %s', name, bin[name]);
    }
}
