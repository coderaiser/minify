/* Модуль сжатия js-скриптов, css-стилей, html-файлов и
 * конвертации картинок в css-стилях 
 * в base64 и помещения их в файл стилей
 */
(function(){
    "use strict";
        
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
        Hashes,
        HashesChanged;
        
    if(!html || !js || !css)
        console.log('One of the necessary modules is absent\n'  +
            're-install the modules\n'                          +
            'npm r minify\n'                                    +
            'npm i minify');
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
    Minify._getExtension = function(pFileName){
        /* checking for js/html/css */    
        var lDot = pFileName.lastIndexOf('.');
        
        return pFileName.substr(lDot);
    };
    
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
                
                
        var lName   = '',
            lAllCSS = '',
            lCSS_o  = null,
            lMinIMg_b = false, 
            /* varible contains all readed file names */
            lReadedFilesCount = 0,
            
            /**
             * Processing of files
             * @param pFileData_o {name, data}
             */
            dataReaded_f = function(pFileData_o){
                if( !Util.isObject(pFileData_o) )
                    return -1;
                    
                var lFileName   = pFileData_o.name,
                    lData       = pFileData_o.data,
                    lLastFile_b;
                
                ++lReadedFilesCount;
                
                /* if leng this not equal file not last */
                if (lReadedFilesCount === pFiles_a.length)
                    lLastFile_b = true;
                        
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
                console.log('file ' + lFileName + ' readed');
                
                var lExt = Minify._getExtension(lFileName),
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
                                
                                if ( Util.isObject(lCSS_o) ){
                                    lMoreProcessing_f = lCSS_o.moreProcessing;
                                }
                                break;
                            
                            default:
                                return console.log('unknow file type '  +
                                    lExt + ', only *.js, *.css, *.html');
                        }
                        /* if it's last file
                         * and base64images setted up
                         * se should convert it
                         */
                        if (lLastFile_b){
                            if(lCSS_o && lCSS_o.img || lCSS_o === true)
                                base64_images(lAllCSS);
                            else{
                                var lPath = MinFolder + 'all.min.css';
                                fs.writeFile(lPath, lAllCSS, fileWrited(lPath));
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
                        fs.writeFile(minFileName, final_code, fileWrited(minFileName));
                        
                        /* calling callback function if it exist */
                        if(pOptions)
                            Util.exec(pOptions.callback, final_code);
                    };
                
                if((pOptions && pOptions.force) || isFileChanged(lFileName, lData, lLastFile_b))
                    lProcessing_f();
              
              /* if file was not changed */
                else{
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
                            if(lExt === '.css'){
                                /* if it's css and last file */
                                lAllCSS += pFinalCode;
                                
                                if(lMoreProcessing_f.img || lMoreProcessing_f === true)
                                    lMinIMg_b = true;
                            }
                        }
                        
                         if (lLastFile_b){
                            if(lCSS_o && lCSS_o.img || lCSS_o === true)
                                base64_images(lAllCSS);
                            else{
                                var lPath = MinFolder + 'all.min.css';
                                fs.writeFile(lPath, lAllCSS, fileWrited(lPath));
                            }
                        }
                    });
                }
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
            
            console.log('reading file ' + lName + '...');
            
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
        var lPath = MinFolder + 'all.min.css',
            b64img = main.require('css-b64-images');
        
        if(!b64img){
            console.log('can\'n load clean-css \n'    +
                    'npm install -g css-b64-images\n' +
                    'https://github.com/Filirom1/css-base64-images');
            
            fs.writeFile(lPath, pData, fileWrited(lPath));
                
            return pData;
        }
        else
            b64img.fromString(pData, '.', '', function(err, css){
                console.log('images converted to base64 and saved in css file');
                fs.writeFile(lPath, css, fileWrited(lPath));
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
               console.log(pError);
        };
    }
    
    /*
     * Функция вызываеться после записи файла
     * и выводит ошибку или сообщает,
     * что файл успешно записан
     */
    function fileWrited(pFileName){
        return function(error){
            console.log(error ? error : ('file ' + pFileName + ' writed...') );
        };
    }
    
    
    function isFileChanged(pFileName, pFileData, pLastFile_b){
            var lReadedHash,
                /* boolean hashes.json changed or not */
                lThisHashChanged_b = false,
                
                lHASHES             = DIR       + 'hashes',
                lHASHES_JSON        = lHASHES   + '.json' ;
            
            if(!Hashes)
                console.log('trying  to read hashes.json');
                
                Hashes = main.require(lHASHES);
                if(!Hashes){
                    console.log('hashes.json not found... \n');
                    Hashes = {};
                }
            
            for(var lFileName in Hashes)
                /* if founded row with file name - save hash */
                if (lFileName === pFileName) {
                    lReadedHash = Hashes[pFileName];
                    break;
            }
            
            /* create hash of file data */ 
            var lFileHash = crypto.createHash('sha1');
            
            lFileHash = crypto.createHash('sha1'); 
            lFileHash.update(pFileData);
            lFileHash = lFileHash.digest('hex');
                    
            if(lReadedHash !== lFileHash){
                Hashes[pFileName]   = lFileHash;
                lThisHashChanged_b  = 
                HashesChanged       = true;
            }
            
            if(pLastFile_b){
                /* if hashes file was changes - write it */
                if(HashesChanged)
                    fs.writeFile(lHASHES_JSON,
                        JSON.stringify(Hashes),
                        fileWrited(lHASHES_JSON));
                        
                else
                    console.log('no one file has been changed');
            }
            /* has file changed? */
            return lThisHashChanged_b;
    }
})();
