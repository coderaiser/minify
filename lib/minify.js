/* Модуль сжатия js-скриптов, css-стилей, html-файлов и
 * конвертации картинок в css-стилях 
 * в base64 и помещения их в файл стилей
 */
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
        ponse       = require('ponse'),
        
        WIN         = process.platform === 'win32',
        
        MinFolder   = getDir() || DIR + 'min/';
    
    module.exports  = minify;
    
    function getModule(name) {
        return require(DIR + name);
    }
    
    function optimizeData(params, callback) {
        var module, p = params;
        
        switch(p.ext) {
            case '.js': 
                module = getModule('js');
                module._uglifyJS(p.data, callback);
                break;
            
            case '.html':
                module = getModule('html');
                module.htmlMinify(p.data, callback);
                break;
            
            case '.css':
                module = getModule('css');
                module._cleanCSS(p.data, callback);
                break;
        }
    }
    
    function minify(name, options, callback) {
        var isChanged, isExist, ret,
            isObject    = Util.isObject(name),
            exec        = Util.exec,
            nameMin     = getName(name);
        
        if (!callback)
            callback = options;
        
        if (!options && !callback)
            ret = middle.bind(null, name);
        else if (isObject) {
            optimizeData(name, callback);
        } else {
            isChanged   = exec.with(ischanged, name),
            isExist     = exec.with(fs.lstat, nameMin);
                
            exec.parallel([isChanged, isExist], function(error, changed, exists) {
                if (changed || !exists)
                    optimize(name, options, callback);
                else
                    if (options.returnName)
                        callback(null, nameMin);
                    else
                        fs.readFile(nameMin, 'utf8', callback);
            });
        }
        
        return ret;
    }
    
    function getDir() {
        var dir;
        
        if (os.tmpdir) {
            dir     = os.tmpdir();
            dir     += '/minify';
            
            if (!WIN)
                dir += '/' + process.getuid();
            
            dir     += '/';
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
        
        Util.checkArgs([options], ['options']);
        
        is              = options.is;
        dir             = options.dir || './';
        
        isFunction      = Util.isFunction(is);
        name            = path.join(dir, name);
        
        if (isFunction)
            isMinify    = is();
        else
            isMinify    = is || Util.isUndefined(is);
        
        if (!isExt || !isMinify)
            next();
        else
            minify(name, {
                log         : options.log,
                returnName  : true
            }, function(error, name) {
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
    function optimize(file, options, callback) {
        if (!callback)
            callback = options;
        
        Util.checkArgs(arguments, ['file', 'callback']);
        
        makeDir(function(error) {
            var name, basename, msg,
                islog   = options.log,
                isObj   = Util.isObject(file);
            
            if (error)
                log(error, islog);
            
            if (isObj)
                name    = Object.keys(file)[0];
            else
                name    = file;
            
            basename    = path.basename(name);
            msg         = 'minify: reading file ' + basename + '...';
            
            log(msg, islog);
            
            fs.readFile(name, 'utf8', function(error, data) {
                if (error)
                    callback(error);
                else
                    onDataRead(file, data, options, callback);
            });
        });
    }
    
   /**
    * Processing of files
    * @param fileData {name, data}
    */
    function onDataRead(filename, data, options, callback) {
        var ext, minFileName, 
            readFilesCount  = 0,
            isLog           = options.log,
            returnName      = options.returnName,
            basename        = path.basename(filename);
        
        log('minify: file ' + basename + ' read', isLog);
        
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
                    var isStr   = Util.isString(optimizedData);
                    
                    if (isStr)
                        data    = optimizedData;
                    
                    ++readFilesCount;
                    
                    writeFile(minFileName, data, isLog, function(dataMin) {
                        if (returnName)
                            callback(null, minFileName);
                        else
                            callback(null, dataMin);
                        });
                    }, function(callback) {
                        var img = getModule('img');
                        img.optimize(filename, data, callback);
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
        
        if (Util.isString(name)) {
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
    function writeFile(name, data, isLog, callback) {
        fs.writeFile(name, data, function(error) {
            var basename = path.basename(name),
                msg = 'minify: file ' + basename + ' written...';
            
            log(error || msg, isLog);
            
            Util.exec(callback, data);
        });
    }
    
    function log(msg, isLog) {
        if (isLog)
            Util.log(msg);
    }
    
})();
