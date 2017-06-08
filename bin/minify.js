#!/usr/bin/env node

'use strict';

var exec = require('execon');
var Pack = require('../package.json');
var Version = Pack.version;

var log = function() {
    console.log.apply(console, arguments);
    process.stdin.pause();
};

var Argv = process.argv;
var files = Argv.slice(2);
var In = files[0];

var log.error = function() {
    console.error.apply(console, arguments);
    process.stdin.pause();
};

process.on('uncaughtException', function(error) {
    if (error.code !== 'EPIPE')
        log(error.message);
});

minify();

function readStd(callback) {
    var stdin = process.stdin;
    var chunks = '';
    var read = function() {
        var chunk = stdin.read();
        
        if (chunk) {
            chunks += chunk;
        } else {
            stdin.removeListener('readable', read);
            callback(chunks);
        }
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
    var minify = require('..');
    
    if (!chunks || !In)
        return;
    
    var name = In.replace('--', '');
    
    minify[name](chunks, function(error, data) {
        if (error)
            return log.error(error.message);
        
        log(data);
    });
}

function uglifyFiles(files) {
    var funcs = files.map(function(current) {
        var minify = require('..');
        
        return minify.bind(null, current);
    });
    
    exec.parallel(funcs, function(error) {
        var args = [].slice.call(arguments, 1);
        
        if (error)
            log.error(error.message);
        else
            log.apply(null, args);
    });
}

function help() {
    var bin = require('../json/help');
    var usage = 'Usage: minify [options]';
    
    console.log(usage);
    console.log('Options:');
    
    Object.keys(bin).forEach(function(name) {
        console.log('  %s %s', name, bin[name]);
    });
}

