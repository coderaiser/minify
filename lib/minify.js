(function() {
    'use strict';
    
    var DIR         = __dirname + '/',
        os          = require('os'),
        crypto      = require('crypto'),
        fs          = require('fs'),
        path        = require('path'),
        
        mkdirp      = require('mkdirp'),
        ischanged   = require('ischanged'),
        Util        = require('util-io'),
        type        = Util.type,
        ponse       = require('ponse'),
        
        log         = require('debug')('minify'),
        
        modules     = {},
        
        WIN         = process.platform === 'win32',
        
        ERROR_MSG   = 'File type "{{ ext }}" not supported.',
        
        MinFolder   = getDir() || DIR + 'min/';
        
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
        var isChanged, isExist, ret, ext, is,
            EXT         = ['js', 'html', 'css'],
            isObject    = type.object(name),
            exec        = Util.exec,
            nameMin     = getName(name);
        
        if (!callback)
            callback = options;
        
        if (!options && !callback) {
            ret = middle.bind(null, name);
        } else if (isObject) {
            optimizeData(name, callback);
        } else {
            ext         = path.extname(name).slice(1);
            is          = ~EXT.indexOf(ext);
            
            if (!is) {
                callback(Error(Util.render(ERROR_MSG, {
                    ext: ext
                })));
            } else {
                isChanged   = exec.with(ischanged, name),
                isExist     = exec.with(fs.lstat, nameMin);
                    
                exec.parallel([isChanged, isExist], function(error, changed, exists) {
                    Util.exec.if(!changed && exists, function() {
                        switch(options) {
                        case 'name':
                            callback(null, nameMin);
                            break;
                        
                        case 'stream':
                            callback(null, fs.createReadStream(nameMin));
                            break;
                        
                        default:
                            fs.readFile(nameMin, 'utf8', callback);
                            break;
                        }
                    }, function(cb) {
                        optimize(name, function(error) {
                            if (error)
                                callback(error);
                            else
                                cb();
                        });
                    });
                });
            }
        }
        
        return ret;
    }
    
    function getDir() {
        var dir;
        
        if (os.tmpdir) {
            dir = path.join(os.tmpdir(), 'minify');
            
            if (!WIN)
                dir = dir + path.sep + process.getuid();
            
            dir += path.sep;
        }
        
        return dir;
    }
    
    function makeDir(callback) {
        var ANY_MASK    = 0,
            umask       = process.umask(ANY_MASK);
        
        mkdirp(MinFolder, function(error) {
            process.umask(umask);
            
            if (error && error.code === 'EEXIST')
                callback();
            else
                callback(error);
        });
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
        Util.check(arguments, ['file', 'callback']);
        
        makeDir(function(error) {
            var name,
                isObj   = type.object(file);
            
            if (error)
                log(error);
            
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
        });
    }
    
   /**
    * Processing of files
    * @param fileData {name, data}
    */
    function onDataRead(filename, data, callback) {
        var ext, minFileName, 
            readFilesCount  = 0;
        
        log('file ' + path.basename(filename) + ' read');
        
        ext         = path.extname(filename);
        minFileName = getName(filename, ext);
            
        optimizeData({
            ext : ext,
            data: data
        }, function(error, data) {
            if (error)
                callback(error);
            else
                Util.exec.if(ext !== '.css', function(error, optimizedData) {
                    var isStr   = type.string(optimizedData);
                    
                    if (isStr)
                        data    = optimizedData;
                    
                    ++readFilesCount;
                    
                    writeFile(minFileName, data, function(error) {
                        callback(error);
                    });
                }, function(callback) {
                    modules.img(filename, data, callback);
                });
            });
    }
    
    /**
     * function get name of file in min folder
     * 
     * @param name
     * @param ext
     */
    function getName(name, ext) {
        var ret, minFileName;
        
        if (type.string(name)) {
            if (!ext)
                ext         = path.extname(name);
            
            minFileName = crypto.createHash('sha1')
                .update(name)
                .digest('hex') + ext;
            
            ret = MinFolder + minFileName;
        }
        
        return ret;
    }
    
    /*
     * Функция записывает файла
     * и выводит ошибку или сообщает,
     * что файл успешно записан
     */
    function writeFile(name, data, callback) {
        fs.writeFile(name, data, function(error) {
            var msg = 'file ' + path.basename(name) + ' written';
            
            log(error || msg);
            
            callback(error);
        });
    }
    
})();
