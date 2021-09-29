#!/usr/bin/env node

'use strict';

const {writeFile} = require('fs/promises');
const tryToCatch = require('try-to-catch');
const Pack = require('../package');
const yargsParser = require("yargs-parser");
const Version = Pack.version;

const log = function(...args) {
    console.log(...args);
    process.stdin.pause();
};

const Argv = process.argv;
const args = yargsParser(Argv.slice(2))
const [In] = args._;

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

async function minify(args) {
    const {hasArg} = await import("../lib/cli.mjs");

    if (!In || hasArg(['h', 'help'], args))
        return help();

    if (hasArg(['js', 'css', 'html'], args))
        return readStd(processStream);

    if (hasArg(['v', 'version'], args))
        return log('v' + Version);

    const readOptions = await import('../lib/read-options.mjs');
    const [optionsError, options] = await tryToCatch(readOptions);

    if (optionsError)
        return log.error(optionsError.message);

    uglifyFiles(args._, options, args);
}

async function processStream(chunks) {
    const minify = require('..');

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

