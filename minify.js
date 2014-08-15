/* Модуль сжатия js-скриптов, css-стилей, html-файлов и
 * конвертации картинок в css-стилях 
 * в base64 и помещения их в файл стилей
 */
(function() {
    'use strict';
    
    var DIR         = __dirname + '/',
        LIBDIR      = DIR + 'lib/',
        os          = require('os'),
        main        = require(LIBDIR + 'main'),
        img         = main.require(LIBDIR + 'img'),
        
        mkdirp      = main.require('mkdirp'),
        ischanged   = require('ischanged'),
        
        WIN         = process.platform === 'win32',
        crypto      = main.crypto,
        fs          = main.fs,
        path        = main.path,
        Util        = main.util,
        
        MinFolder   = getDir() || DIR + 'min/';
        
    exports.optimize        = optimize;
    exports.getName         = getName;
    exports.optimizeData    = main.optimize;
    exports.MinFolder       = MinFolder;
    
    function optimize(name, options, callback) {
        var isChanged, isExist,
            exec    = Util.exec,
            nameMin = getName(name);
        
        Util.checkArgs(arguments, ['name', 'callback']);
        
        if (!callback)
            callback = options;
        
        isChanged   = exec.with(ischanged, name),
        isExist     = exec.with(fs.lstat, nameMin);
            
        exec.parallel([isChanged, isExist], function(error, changed, exists) {
             if (error)
                callback(error);
            else if (changed || !exists)
                minify(name, options, callback);
            else
                if (options.returnName)
                    callback(null, nameMin);
                else
                    fs.readFile(nameMin, 'utf8', callback);
        });
    }
    
    function getDir() {
        var dir;
        
        if (os.tmpdir) {
            dir     = os.tmpdir();
            dir     += '/minify';
            
            if (!WIN)
                dir += '/' + process.getuid() + '/';
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
    
    /**
     * function minificate js,css and html files
     * 
     * @param files     -   js, css or html file path
     * @param options   -   object contain main options
     */
    function minify(file, options, callback) {
        if (!callback)
            callback = options;
        
        Util.checkArgs(arguments, ['file', 'callback']);
        
        makeDir(function(error) {
            var name, basename, msg,
                notLog  = options.notLog,
                isObj   = Util.isObject(file);
            
            if (error)
                log(error, notLog);
            
            if (isObj)
                name    = Object.keys(file)[0];
            else
                name    = file;
            
            basename    = path.basename(name);
            msg         = 'minify: reading file ' + basename + '...';
            
            log(msg, notLog);
            
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
            notLog          = options.notLog,
            returnName      = options.returnName,
            basename        = path.basename(filename);
        
        log('minify: file ' + basename + ' read', notLog);
        
        ext         = Util.getExtension(filename);
        minFileName = getName(filename, ext);
            
        main.optimize({
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
                    
                    writeFile(minFileName, data, notLog, function(dataMin) {
                        if (returnName)
                            callback(null, minFileName);
                        else
                            callback(null, dataMin);
                        });
                    }, function(callback) {
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
                ext         = Util.getExtension(name);
            
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
    function writeFile(name, data, notLog, callback) {
        fs.writeFile(name, data, function(error) {
            var basename = path.basename(name),
                msg = 'minify: file ' + basename + ' written...';
            
            log(error || msg, notLog);
            
            Util.exec(callback, data);
        });
    }
    
    function log(msg, notLog) {
        if (!notLog)
            Util.log(msg);
    }
    
})();
