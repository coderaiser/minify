(function() {
    'use strict';
    
    var DIR         = __dirname + '/',
        
        fs          = require('fs'),
        path        = require('path'),
        exec        = require('execon'),
        tomas       = require('tomas'),
        rendy       = require('rendy'),
        
        log         = require('debug')('minify'),
        
        modules     = {},
        
        ERROR_MSG   = 'File type "{{ ext }}" not supported.';
        
        ['js', 'html', 'css', 'img'].forEach(function(name) {
            modules[name] = require(DIR + name);
        });
    
    module.exports  = minify;
    
    function optimizeData(params, callback) {
        var p   = params,
            ext = p.ext.slice(1);
        
        modules[ext](p.data, callback);
    }
    
    function check(name, callback) {
        if (!name)
            throw(Error('name could not be empty!'));
        
        if (typeof callback !== 'function')
            throw(Error('callback should be function!'));
    }
    
    function minify(name, options, callback) {
        var ret, ext, is,
            EXT         = ['js', 'html', 'css'],
            isObject    = typeof name === 'object';
        
        if (!callback)
            callback = options;
        
        check(name, callback);
        
        if (isObject) {
            optimizeData(name, callback);
        } else {
            ext         = path.extname(name).slice(1);
            is          = ~EXT.indexOf(ext);
            
            if (!is)
                callback(Error(rendy(ERROR_MSG, {
                    ext: ext
                })));
            else
                tomas.check(name, function(is) {
                    exec.if(is, function() {
                        tomas.read(name, options, callback);
                    }, function(fn) {
                        log('optimizing ' + path.basename(name));
                        optimize(name, function(error) {
                            if (error)
                                callback(error);
                            else
                                fn();
                        });
                    });
                });
        }
        
        return ret;
    }
    
    /**
     * function minificate js,css and html files
     * 
     * @param files     -   js, css or html file path
     * @param options   -   object contain main options
     */
    function optimize(file, callback) {
        var name, isObj;
        
        check(file, callback);
        
        isObj = typeof file === 'object';
        
        if (isObj)
            name    = Object.keys(file)[0];
        else
            name    = file;
        
        log('reading file ' + path.basename(name));
        
        fs.readFile(name, 'utf8', function(error, data) {
            if (error)
                callback(error);
            else
                onDataRead(file, data, callback);
        });
    }
    
   /**
    * Processing of files
    * @param fileData {name, data}
    */
    function onDataRead(filename, data, callback) {
        var ext,
            readFilesCount  = 0;
        
        log('file ' + path.basename(filename) + ' read');
        
        ext = path.extname(filename);
        
        optimizeData({
            ext : ext,
            data: data
        }, function(error, data) {
            if (error)
                callback(error);
            else
                exec.if(ext !== '.css', function(error, optimizedData) {
                    var isStr   = typeof optimizedData === 'string';
                    
                    if (isStr)
                        data    = optimizedData;
                    
                    ++readFilesCount;
                    log('writing ' + filename);
                    tomas.write(filename, data, callback);
                }, function(callback) {
                    modules.img(filename, data, callback);
                });
            });
    }
    
})();
