#!/usr/bin/env node

'use strict';

var exec        = require('execon'),
    Pack        = require('../package.json'),
    Version     = Pack.version,
    
    log         = function() {
        console.log.apply(console, arguments);
        process.stdin.pause();
    },
    
    Argv        = process.argv,
    files       = Argv.slice(2),
    In          = files[0];
    
    log.error   = function() {
        console.error.apply(console, arguments);
        process.stdin.pause();
    };

process.on('uncaughtException', function(error) {
    if (error.code !== 'EPIPE')
        log(error.message);
});

minify();

function readStd(callback) {
    var stdin   = process.stdin,
        chunks  = '',
        read    = function() {
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
        help();
    
    else if (/^--(js|css|html)$/.test(In))
        readStd(processStream);
    
    else if (/^(-v|--version)$/.test(In))
        log('v' + Version);
    
    else
        uglifyFiles(files);
}

function processStream(chunks) {
    var name,
        minify = require('..');
    
    if (chunks && In) {
        name = In.replace('--', '');
        
        minify[name](chunks, function(error, data) {
            if (error)
                log.error(error.message);
            else
                log(data);
        });
    }
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
    var bin         = require('../json/help'),
        usage       = 'Usage: minify [options]';
    
    console.log(usage);
    console.log('Options:');
    
    Object.keys(bin).forEach(function(name) {
        console.log('  %s %s', name, bin[name]);
    });
}

