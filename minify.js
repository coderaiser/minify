/* Модуль сжатия js-скриптов, css-стилей, html-файлов и
 * конвертации картинок в css-стилях 
 * в base64 и помещения их в файл стилей
 */
(function(){
    'use strict';
        
    global.minify   = {};
    
    var DIR         = __dirname +'/',
        LIBDIR      = DIR + 'lib/',
        main        = global.minify.main = require(LIBDIR + 'main'),
        
        crypto      = main.crypto,
        fs          = main.fs,
        path        = main.path,
        Util        = main.util,
        
        html        = main.librequire('html'),
        js          = main.librequire('js'),
        css         = main.librequire('css'),
        
        Minify      = {},
        
        /* object contains hashes of files*/
        HASHESNAME  = DIR       + 'hashes',
        HASHES_JSON = HASHESNAME   + '.json',
        
        Hashes,
        HashesChanged;
        
    if(!html || !js || !css)
        console.log('One of the necessary modules is absent\n'  +
            're-install the modules\n'                          +
            'npm r\n'                                           +
            'npm i');
    else{
        Minify._uglifyJS    = js._uglifyJS;
        Minify._cleanCSS    = css._cleanCSS;
        Minify.htmlMinify   = html.htmlMinify;
    }
    
    var MinFolder   = DIR + 'min/';
    /* function clear MinFolder
     * if we could not create
     * directory and it is
     * not exist
     */
    var folderExist = function(pError, pStat){
        /*file found and it's directory */
        if(!pError && pStat.isDirectory())
            console.log('folder exist: ' + MinFolder);
        else MinFolder='/';
    };
    
    /*
     * function says thet folder created
     * if everything is OK, or
     * moves to folderExist function
     */
    var makeFolder = function(pError){
        /*folder created successfully*/
        if(!pError)
            console.log('folder created: min');
        else fs.stat(MinFolder,folderExist);
    };
    
    /* Trying to create folder min
     * where woud be minifyed versions
     * of files 511(10)=777(8)
     * rwxrwxrwx
     */
    fs.mkdir(MinFolder, 511, makeFolder);
    
    exports.MinFolder = MinFolder;
    exports.Cache    = {};
    
    /**
     * function gets file extension
     * @param pFileName
     * @return Ext
     */
    function getExtension (pFileName){
        var lDot = pFileName.lastIndexOf('.');
        return pFileName.substr(lDot);
    }
    
    /**
     * function minificate js,css and html files
     * @param pFiles_a  -   array of js, css and html file names or string, if name
     *                      single, or object if postProcessing neaded
     *                          {'client.js': function(pFinalCode){} }
     *                      or convertion images to base64 neaded
     *                          {'style.css': true}
     *                       or {'style.css':{minimize: true, func: function(){}}
     *
     * @param pOptions  -   object contain main options
     *                      if cache true files do not writes on disk, just saves
     *                      in Minify Cache
     * Example: 
     * {cache: false, gzip: true, callback: func(){}}
     */
    exports.optimize = function(pFiles_a, pOptions){ 
         /* if passed string, or object 
          * putting it to array
          */
        if ( Util.isString(pFiles_a) || !pFiles_a[0] )
            pFiles_a = [pFiles_a];
        
        var lName       = '',
            lAllCSS     = '',
            lCSS_o      = null,
            /* varible contains all readed files count */
            lReadedFilesCount = 0,
            
            /**
             * Processing of files
             * @param pFileData_o {name, data}
             */
            dataReaded_f = function(pFileData_o){
                if( !Util.isObject(pFileData_o) )
                    return -1;
                    
                ++lReadedFilesCount;
                
                var lFileName   = pFileData_o.name,
                    lData       = pFileData_o.data,
                    lLastFile_b = lReadedFilesCount === pFiles_a.length;
                
                /*
                 * if postProcessing function exist
                 * getting it from lFileName object
                 */
                var lMoreProcessing_f;
                if( Util.isObject(lFileName) ){
                    var lName;
                    for(lName in lFileName){
                        break;
                    }
                    lMoreProcessing_f = lFileName[lName];
                    lFileName = lName;
                }
                console.log('minify: file ' + path.basename(lFileName) + ' readed');
                
                var lExt        = getExtension(lFileName),
                    minFileName = path.basename(lFileName);
                
                minFileName = minFileName.replace(lExt, '.min' + lExt);
                minFileName = MinFolder + minFileName;
                
               /* functin minimize files */
                var lProcessing_f = function(){
                    var final_code;
                        
                    /* getting optimized version */
                    switch(lExt){
                        case '.js': 
                            final_code  = Minify._uglifyJS(lData);
                            break;
                        
                        case '.html':
                            final_code  = Minify.htmlMinify(lData);
                            break;
                        
                        case '.css':
                            final_code  = Minify._cleanCSS(lData);
                            lAllCSS    += final_code;
                            
                            lCSS_o = lMoreProcessing_f;
                            
                            if ( Util.isObject(lCSS_o) )
                                lMoreProcessing_f = lCSS_o.moreProcessing;
                            break;
                        
                        default:
                            return Util.log('unknow file type '  +
                                lExt + ', only *.js, *.css, *.html');
                    }
                    /* if it's last file
                     * and base64images setted up
                     * we should convert it
                     */
                    if (lLastFile_b && lCSS_o && lCSS_o.merge){
                        if(lCSS_o.img)
                            base64_images(lAllCSS);
                        else{
                            var lPath = MinFolder + 'all.min.css';
                            writeFile(lPath, lAllCSS);
                        }
                    }
                    /* if lMoreProcessing_f seeted up 
                     * and function associated with
                     * current file name exists -
                     * run it
                     */
                    var lResult = Util.exec(lMoreProcessing_f, final_code);
                    if(lResult)
                        final_code = lResult;
                    
                    /* записываем сжатый js-скрипт
                     * в кэш если установлен pCache_b
                     * или на диск, если не установлен
                     */
                    if(pOptions && pOptions.cache){
                        exports.Cache[lFileName] = final_code;
                        console.log('file ' + minFileName + ' saved to cache...');
                    }
                    
                    /* minimized file will be in min file
                     * if it's possible if not -
                     * in root
                     */                
                    writeFile(minFileName, final_code);
                    
                    /* calling callback function if it exist */
                    if(pOptions)
                        Util.exec(pOptions.callback, final_code);
                };
                
                if((pOptions && pOptions.force) || isFileChanged(lFileName, lData, lLastFile_b))
                    lProcessing_f();
                
                /* if file was not changed */
                else
                    fs.readFile(minFileName, function(pError, pFinalCode){
                        /* if could not read file call forse minification */
                        if(pError)
                            lProcessing_f();
                        
                        /* if need to save in cache - do it */
                        else {
                            if(pOptions){
                                if(pOptions.cache){
                                    exports.Cache[minFileName] = pFinalCode;
                                    console.log('file ' + minFileName + ' saved to cache...');
                                }
                                
                                Util.exec(pOptions.callback, pFinalCode);
                            }
                            
                            if(lExt === '.css')
                                lAllCSS += pFinalCode;
                        }
                        
                         if (lLastFile_b && lCSS_o && lCSS_o.merge){
                            if(lCSS_o.img)
                                base64_images(lAllCSS);
                            else{
                                var lPath = MinFolder + 'all.min.css';
                                writeFile(lPath, lAllCSS);
                            }
                        }
                    });
            };
        
        /* moving thru all elements of js files array */
        for(var i=0; pFiles_a[i]; i++){
            /* if postProcessing function exist
             * getting file name and passet next
             */
            var lPostProcessing_o = pFiles_a[i];
            if( Util.isObject(lPostProcessing_o) )
                for(lName in lPostProcessing_o)
                    break;
            else
                lName = pFiles_a[i];
            
            Util.log('minify: reading file ' + path.basename(lName) + '...');
            
            /* if it's last file send true */
            fs.readFile(lName, fileReaded(pFiles_a[i], dataReaded_f));
        }
        /* saving the name of last readed file for hash saving function */
        
        return true;
    };
    
    /**
     * Функция переводит картинки в base64 и записывает в css-файл
     * @param pData {String}
     */
    function base64_images(pData){
        var lPath  = MinFolder + 'all.min.css',
            b64img = main.require('css-b64-images');
        
        if(!b64img){
            console.log('can\'n load clean-css \n'    +
                    'npm install -g css-b64-images\n' +
                    'https://github.com/Filirom1/css-base64-images');
            
            writeFile(lPath, pData);
                
            return pData;
        }
        else
            b64img.fromString(pData, '.', '', function(err, css){
                console.log('images converted to base64 and saved in css file');
                writeFile(lPath, css);
            });
    }
    
    /* Функция создаёт асинхроную версию 
     * для чтения файла
     * @pFileName       - имя считываемого файла
     * @pProcessFunc    - функция обработки файла
     */
    function fileReaded(pFileName, pProcessFunc){
        return function(pError, pData){
            /* функция в которую мы попадаем,
             * если данные считались
             *
             * если ошибка - показываем её
             * иначе если переданная функция -
             * функция запускаем её
             */
            if(!pError){
                pData = pData.toString();
                
                Util.exec(pProcessFunc, {
                    name: pFileName,
                    data: pData
                });
            }
            else
               Util.log(pError);
        };
    }
    
    /*
     * Функция записывает файла
     * и выводит ошибку или сообщает,
     * что файл успешно записан
     */
    function writeFile(pName, pData){
        fs.writeFile(pName, pData, function(pError){
            if(pError)
                Util.log(pError);
            else{
                pName = path.basename(pName);
                Util.log('minify: file ' + pName + ' writed...');
            }
        });
    }
    
    
    function isFileChanged(pFileName, pFileData, pLastFile_b){
        var lReadedHash;
        
        if(!Hashes){
            Util.log('trying  to read hashes.json');
            
            Hashes = main.require(HASHESNAME);
            if(!Hashes){
                Util.log('hashes.json not found... \n');
                Hashes = [];
            }
        }
        
        var i, n = Hashes.length;
        for(i = 0; i < n; i++){
            var lData = Hashes[i];
            
            /* if founded row with file name - save hash */
            if(lData.name === pFileName){
                lReadedHash = lData.hash;
                break;
            }
        }
                
        /* create hash of file data */ 
        var lFileHash = crypto.createHash('sha1');
        
        lFileHash = crypto.createHash('sha1');
        lFileHash.update(pFileData);
        lFileHash = lFileHash.digest('hex');
        
        /* boolean hashes.json changed or not */
        var lThisHashChanged_b  = lReadedHash !== lFileHash;
        
        if(lThisHashChanged_b){
            Hashes[i]           = {name: pFileName, hash: lFileHash};
            HashesChanged       = true;
        }
        
        if(pLastFile_b){
            /* if hashes file was changes - write it */
            if(HashesChanged)
                writeFile(HASHES_JSON, JSON.stringify(Hashes, null, 4));
            else
                Util.log('minify: no one file has been changed');
        }
        /* has file changed? */
        return lThisHashChanged_b;
    }
})();
