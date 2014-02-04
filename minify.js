/* Модуль сжатия js-скриптов, css-стилей, html-файлов и
 * конвертации картинок в css-стилях 
 * в base64 и помещения их в файл стилей
 */
(function() {
    'use strict';
    
   
    var DIR         = __dirname +'/',
        LIBDIR      = DIR + 'lib/',
        main        = require(LIBDIR + 'main'),
        img         = main.require(LIBDIR + 'img'),
        
        crypto      = main.crypto,
        fs          = main.fs,
        path        = main.path,
        Util        = main.util,
        
    
        MinFolder   = DIR + 'min/';
    
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
     *
     * Example: 
     * {callback: func(pData) {}}
     */
    function optimize(files, options) {
        var i,
            name        = '',
            lAllCSS     = '',
            /* varible contains all readed files count */
            lReadedFilesCount = 0,
            
            /**
             * Processing of files
             * @param pFileData_o {name, data}
             */
            dataReaded_f = function(fileData) {
                var name,
                    filename    = fileData.name,
                    data        = fileData.data,
                    lOptimizeParams;
                
                function isLastFile() {
                    return lReadedFilesCount === files.length;
                }
                
                if (Util.isObject(filename)) {
                    for (name in filename) {
                        break;
                    }
                    
                    lOptimizeParams = fileName[name];
                    fileName        = name;
                }
            
            Util.log('minify: file ' + path.basename(filename) + ' read');
                
            var lExt            = Util.getExtension(filename),
                lMinFileName    = getName(filename, lExt);
                
            data = main.optimize({
                ext : lExt,
                data: data
            });
                
            Util.ifExec(lExt !== '.css', function(pOptData) {
                var ret = Util.isString(pOptData);
                
                if (ret) {
                    data    = pOptData;
                    lAllCSS += pOptData;
                }
                
                ++lReadedFilesCount;
                
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
        
          if (!Util.isArray(files))
                files = [files];
        
        /* moving thru all elements of js files array */
        for (i = 0; files[i]; i++) {
            /* if postProcessing function exist
             * getting file name and pass next
             */
            var lPostProcessing_o = files[i];
            if (Util.isObject(lPostProcessing_o))
                for (name in lPostProcessing_o)
                    break;
            else
                name = files[i];
            
            Util.log('minify: reading file ' + path.basename(name) + '...');
            
            /* if it's last file send true */
             fs.readFile(name, Util.call(fileReaded, {
                name    : files[i],
                callback: dataReaded_f
            }));
        }
    }
    
    /**
     * function get name of file in min folder
     * @param pName
     */
    function getName(pName, pExt) {
        var lRet;
        
        if (Util.isString(pName)) {
        
            var lExt        = pExt || Util.getExtension(pName),
                lMinFileName = crypto.createHash('sha1')
                    .update(pName)
                    .digest('hex') + lExt;
            
            lRet = MinFolder + lMinFileName;
        }
        
        return lRet;
    }
    
    /* Функция создаёт асинхроную версию 
     * для чтения файла
     * @pFileName       - имя считываемого файла
     * @pProcessFunc    - функция обработки файла
     */
    function fileReaded(pParams) {
        var p, d, lData,
            lRet =  Util.checkObj(pParams, ['error', 'data']) &&
                    Util.checkObjTrue(pParams.params, ['name', 'callback']);
        
        if (lRet) {
            p = pParams,
            d = p.params;
            
            Util.log(p.error);
            lData = p.data && p.data.toString();
            
            Util.exec(d.callback, {
                name: d.name,
                data: lData
            });
        }
    }
    
    /*
     * Функция записывает файла
     * и выводит ошибку или сообщает,
     * что файл успешно записан
     */
    function writeFile(pName, pData, pCallBack) {
        fs.writeFile(pName, pData, function(pError) {
            if (pError)
                Util.log(pError);
            else{
                pName = path.basename(pName);
                Util.log('minify: file ' + pName + ' written...');
            }
            
            Util.exec(pCallBack, pData);
        });
    }
    
    function saveAllCSS(pParams, pData) {
       if (pParams && pParams.merge) {
           var lPath = MinFolder + 'all.min.css';
           writeFile(lPath, pData);
        }
    }
        
    exports.getName     = getName;
    exports.optimize    = optimize;
    exports.MinFolder   = MinFolder;
    
})();
