/* Модуль сжатия js-скриптов, css-стилей, html-файлов и
 * конвертации картинок в css-стилях 
 * в base64 и помещения их в файл стилей
 */
(function() {
    'use strict';
    
    var DIR         = __dirname +'/',
        LIBDIR      = DIR + 'lib/',
        os          = require('os'),
        main        = require(LIBDIR + 'main'),
        img         = main.require(LIBDIR + 'img'),
        
        crypto      = main.crypto,
        fs          = main.fs,
        path        = main.path,
        Util        = main.util,
        
        TMPDIR, MinFolder;
    
    if (os.tmpdir) {
        TMPDIR      = os.tmpdir();
        MinFolder   = TMPDIR + '/minify/';
    } else {
        MinFolder   = DIR + '/min/';
    }
    
    /* Trying to create folder min
     * where woud be minifyed versions
     * of files 511(10)=777(8)
     * rwxrwxrwx
     */
    fs.exists(MinFolder, function makeFolder(exist) {
        if (!exist)
            fs.mkdir(MinFolder, 511, Util.log.bind(Util));
    });
    
    /**
     * function minificate js,css and html files
     * @param files  -   array of js, css and html file names or string, if name
     *                      single, or object if postProcessing neaded
     *                          {'client.js': function(pFinalCode) {} }
     *                      or convertion images to base64 neaded
     *                          {'style.css': true}
     *                       or {'style.css':{minimize: true, func: function() {}}
     *
     * @param options  -   object contain main options
     */
    function optimize(filesParam, options) {
        var i, postProcessing_o, isObj,
            isArray             = Util.isArray(filesParam),
            files               = isArray ? filesParam : [filesParam],
            name                = '',
            lAllCSS             = '',
            readedFilesCount    = 0,
            
            /**
             * Processing of files
             * @param fileData {name, data}
             */
            onDataRead  = function(fileData) {
                var name, lOptimizeParams,
                    filename    = fileData.name,
                    isObj       = Util.isObject(filename),
                    data        = fileData.data,
                    isLastFile  = function() {
                        return readedFilesCount === files.length;
                    };
                
                if (isObj) {
                    for (name in filename) {
                        break;
                    }
                    
                    lOptimizeParams = filename[name];
                    filename        = name;
                }
            
                Util.log('minify: file ' + path.basename(filename) + ' read');
                    
                var lExt            = Util.getExtension(filename),
                    lMinFileName    = getName(filename, lExt);
                    
                data = main.optimize({
                    ext : lExt,
                    data: data
                });
                    
                Util.ifExec(lExt !== '.css', function(optimizedData) {
                    var ret = Util.isString(optimizedData);
                    
                    if (ret) {
                        data    = optimizedData;
                        lAllCSS += optimizedData;
                    }
                    
                    ++readedFilesCount;
                    
                    if (isLastFile())
                        saveAllCSS(lOptimizeParams, lAllCSS);
                    
                    writeFile(lMinFileName, data, function(pData) {
                        if (options)
                            if (options.returnName)
                                 Util.exec(options.callback, {
                                     name: lMinFileName
                                 });
                             else
                                Util.exec(options.callback, pData);
                        });
                    }, function(callback) {
                        img.optimize(filename, data, callback);
                    });
            };
        
        /* moving thru all elements of js files array */
        for (i = 0; files[i]; i++) {
            /* if postProcessing function exist
             * getting file name and pass next
             */
            postProcessing_o    = files[i];
            isObj               = Util.isObject(postProcessing_o);
            
            if (isObj)
                name = Object.keys(postProcessing_o)[0];
            else
                name = files[i];
            
            Util.log('minify: reading file ' + path.basename(name) + '...');
            
             fs.readFile(name, 'utf8', Util.bind(fileRead, {
                name    : files[i],
                callback: onDataRead
            }));
        }
    }
    
    /**
     * function get name of file in min folder
     * @param pName
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
    
    function fileRead(params, error, data) {
        Util.log(error);
        
        if (params)
            Util.exec(params.callback, {
                name: params.name,
                data: data
            });
    }
    
    /*
     * Функция записывает файла
     * и выводит ошибку или сообщает,
     * что файл успешно записан
     */
    function writeFile(name, data, callback) {
        fs.writeFile(name, data, function(error) {
            if (error)
                Util.log(error);
            else {
                name = path.basename(name);
                Util.log('minify: file ' + name + ' written...');
            }
            
            Util.exec(callback, data);
        });
    }
    
    function saveAllCSS(params, data) {
        var path;
        
        if (params && params.merge) {
           path = MinFolder + 'all.min.css';
           writeFile(path, data);
        }
    }
        
    exports.getName     = getName;
    exports.optimize    = optimize;
    exports.MinFolder   = MinFolder;
    
})();
