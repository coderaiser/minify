#!/usr/bin/env node

'use strict';

const {writeFile} = require('fs/promises');
const Pack = require('../package');
const {findOptionsFromFile} = require('../lib/options');
const Version = Pack.version;

const log = function(...args) {
    console.log(...args);
    process.stdin.pause();
};

const Argv = process.argv;
const args = Argv.slice(2);
const [In] = args;

log.error = (e) => {
    console.error(e);
    process.stdin.pause();
};

process.on('uncaughtException', (error) => {
    if (error.code !== 'EPIPE')
        log(error);
});

minify(args);

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

function extractFlags(supportedFlags, args) {
    const flags = {};
    const files = [];
    
    // set all flags to false
    for (const flagName in supportedFlags) {
        flags[flagName] = false;
    }
    
    // Set flags to true if they are in the args, else push the arg as a file
    for (const arg of args) {
        let isArgFlag = false;
        for (const flagName in supportedFlags) {
            if (supportedFlags[flagName] === arg) {
                flags[flagName] = true;
                isArgFlag = true;
                break;
            }
        }
        
        if (!isArgFlag) {
            files.push(arg);
        }
    }
    
    return {flags, files};
}

async function minify(args) {
    if (!In || /^(-h|--help)$/.test(In))
        return help();
    
    if (/^--(js|css|html)$/.test(In))
        return readStd(processStream);
    
    if (/^(-v|--version)$/.test(In))
        return log('v' + Version);
    
    const supportedFlags = {
        overwriteSource: '--overwrite-source',
    };
    
    const {flags, files} = extractFlags(supportedFlags, args);
    
    const {options, error: optionsError} = await findOptionsFromFile();
    
    if (optionsError)
        return log.error(optionsError.message);
    
    uglifyFiles(files, options, flags);
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

function uglifyFiles(files, options, flags) {
    const minify = require('..');
    const minifiers = files.map((file) => minify(file, options));
    
    Promise.all(minifiers)
        .then(async (minifiedStrings) => {
            if (flags.overwriteSource)
                await writeAll(files, minifiedStrings);
            else
                logAll(minifiedStrings);
        })
        .catch(log.error);
}

async function writeAll(files, minifiedStrings) {
    for (let index = 0; index < files.length; index++) {
        await writeFile(files[index], minifiedStrings[index], 'utf8');
    }
}

function logAll(array) {
    for (const item of array)
        log(item);
}

function help() {
    const bin = require('../help');
    const usage = 'Usage: minify [options]';
    
    console.log(usage);
    console.log('Options:');
    
    for (const name of Object.keys(bin)) {
        console.log('  %s %s', name, bin[name]);
    }
}

