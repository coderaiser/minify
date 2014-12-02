(function() {
    'use strict';
    
    var DIR         = __dirname + '/',
        
        fs          = require('fs'),
        path        = require('path'),
        check       = require('checkup'),
        exec        = require('execon'),
        tomas       = require('tomas'),
        
        Util        = require('util-io'),
        type        = Util.type,
        ponse       = require('ponse'),
        
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
    
    function minify(name, options, callback) {
        var ret, ext, is,
            EXT         = ['js', 'html', 'css'],
            isObject    = type.object(name);
        
        if (!callback)
            callback = options;
        
        if (!options && !callback) {
            ret = middle.bind(null, name);
        } else if (isObject) {
            optimizeData(name, callback);
        } else {
            ext         = path.extname(name).slice(1);
            is          = ~EXT.indexOf(ext);
            
            if (!is)
                callback(Error(Util.render(ERROR_MSG, {
                    ext: ext
                })));
            else
                tomas.check(name, function(is) {
                    exec.if(is, function() {
                        tomas.read(name, options, callback);
                    }, function(fn) {
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
    
    function middle(options, req, res, next) {
        var isMinify, dir, is, isFunction,
            name        = req.url,
            isExt       = Util.checkExt(name, ['js', 'css', 'html']);
        
        Util.check([options], ['options']);
        
        is              = options.is;
        dir             = options.dir || './';
        
        isFunction      = type.function(is);
        name            = path.join(dir, name);
        
        if (isFunction)
            isMinify    = is();
        else
            isMinify    = is || type.undefined(is);
        
        if (!isExt || !isMinify)
            next();
        else
            minify(name, 'name', function(error, name) {
                if (error)
                    next();
                else
                    ponse.sendFile({
                        request: req,
                        response: res,
                        name: name,
                        gzip: true,
                        cache:true,
                    });
            });
    }
    
    /**
     * function minificate js,css and html files
     * 
     * @param files     -   js, css or html file path
     * @param options   -   object contain main options
     */
    function optimize(file, callback) {
        var name, isObj;
        
        check(arguments, ['file', 'callback']);
        
        isObj = type.object(file);
        
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
                    var isStr   = type.string(optimizedData);
                    
                    if (isStr)
                        data    = optimizedData;
                    
                    ++readFilesCount;
                    
                    tomas.write(filename, data, callback);
                }, function(callback) {
                    modules.img(filename, data, callback);
                });
            });
    }
    
})();
