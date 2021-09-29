#!/usr/bin/env node

import Pack from '../package';
import {findOptionsFromFile} from '../lib/options.js';
const Version = Pack.version;

class log {
    constructor(...args) {
        console.log(...args);
        process.stdin.pause();
    }
    
    static error(e) {
        console.error(e);
        process.stdin.pause();
    }
}

const Argv = process.argv;
const files = Argv.slice(2);
const [In] = files;

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

async function minify() {
    if (!In || /^(-h|--help)$/.test(In))
        return await help();
    
    if (/^--(js|css|html)$/.test(In))
        return readStd(processStream);
    
    if (/^(-v|--version)$/.test(In))
        return log('v' + Version);
    
    const {options, error: optionsError} = await findOptionsFromFile();
    
    if (optionsError)
        return log.error(optionsError.message);
    
    await uglifyFiles(files, options);
}

async function processStream(chunks) {
    await import('..');
    const tryToCatch = await import('try-to-catch');
    
    if (!chunks || !In)
        return;
    
    const name = In.replace('--', '');
    
    const [e, data] = await tryToCatch(minify[name], chunks);
    
    if (e)
        return log.error(e);
    
    log(data);
}

async function uglifyFiles(files, options) {
    const minify = await import('..');
    const minifiers = files.map((file) => minify(file, options));
    
    Promise.all(minifiers)
        .then(logAll)
        .catch(log.error);
}

function logAll(array) {
    for (const item of array)
        log(item);
}

async function help() {
    const bin = await import('../help.json');
    const usage = 'Usage: minify [options]';
    
    console.log(usage);
    console.log('Options:');
    
    for (const name of Object.keys(bin)) {
        console.log('  %s %s', name, bin[name]);
    }
}

