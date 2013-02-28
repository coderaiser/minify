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
        
        Hashes      = main.require(HASHESNAME) || [],
        HashesChanged;
        
    if(!html || !js || !css)
        Util.log('One of the necessary modules is absent\n'     +
            're-install the modules\n'                          +
            'npm r\n'                                           +
            'npm i');
    else{
        Minify._uglifyJS    = js._uglifyJS;
        Minify._cleanCSS    = css._cleanCSS;
        Minify.htmlMinify   = html.htmlMinify;
    }
    
    var MinFolder   = DIR + 'min/';

    function makeFolder(pExist){
        /* Trying to create folder min
         * where woud be minifyed versions
         * of files 511(10)=777(8)
         * rwxrwxrwx
         */
        if(!pExist)
            fs.mkdir(MinFolder, 511, function(pError){
                if(pError){
                    Util.log(pError);
                    MinFolder = '/';
                }
            });
    }
    
    fs.exists(MinFolder, makeFolder);
    
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
     *
     * Example: 
     * {callback: func(pData){}}
     */
    function optimize(pFiles_a, pOptions){
        
        if(pOptions && pOptions.cache)
            Util.log('minify: warning. cache parameter is deprecated ' + 
            'and have no sense anymore!');
        
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
                Util.log('minify: file ' + path.basename(lFileName) + ' readed');
                
                var lExt = Util.getExtension(lFileName),
                    lMinFileName = getName(lFileName, lExt);
                
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
                        
                        /* minimized file will be in min file
                         * if it's possible if not -
                         * in root
                         */
                        writeFile(lMinFileName, final_code, function(){
                            /* calling callback function if it exist */
                            if(pOptions)
                                if(pOptions.returnName)
                                    Util.exec(pOptions.callback, {
                                        name: lMinFileName
                                    });
                                else
                                    Util.exec(pOptions.callback, final_code);
                            });
                        
                    };
                    
                if((pOptions && pOptions.force) || isFileChanged(lFileName, lData, lLastFile_b))
                    lProcessing_f();
                
                /* if file was not changed */
                else
                    fs.readFile(lMinFileName, function(pError, pFinalCode){
                        /* if could not read file call forse minification */
                        if(pError)
                            lProcessing_f();
                        
                        else {
                            if(pOptions)
                                if(pOptions.returnName)
                                    Util.exec(pOptions.callback, {
                                        name: lMinFileName
                                    });
                                else
                                    Util.exec(pOptions.callback, pFinalCode);
                            
                            if(lExt === '.css')
                                lAllCSS += pFinalCode;
                        }
                        
                         if (lLastFile_b && lCSS_o && lCSS_o.merge){
                            if(lCSS_o.img)
                                base64_images(lAllCSS);
                            else
                                writeFile(MinFolder + 'all.min.css', lAllCSS);
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
    }
    
    /**
     * function get name of file in min folder
     * @param pName
     */
    function getName(pName, pExt){
        var lRet;
        
        if( Util.isString(pName) ){
        
            var lExt        = pExt || Util.getExtension(pName),
                lMinFileName = crypto.createHash('sha1')
                    .update(pName)
                    .digest('hex') + lExt;
            
            lRet = MinFolder + lMinFileName;
        }
        
        return lRet;
    }
    
    /**
     * Функция переводит картинки в base64 и записывает в css-файл
     * @param pData {String}
     */
    function base64_images(pData){
        var lPath  = MinFolder + 'all.min.css',
            b64img = main.require('css-b64-images');
        
        if(!b64img){
            Util.log('can\'n load clean-css \n'                 +
                    'npm install -g css-b64-images\n'           +
                    'https://github.com/Filirom1/css-base64-images');
            
            writeFile(lPath, pData);
            
            return pData;
        }
        else
            b64img.fromString(pData, '.', '', function(pError, pCSS){
                Util.log('minify: images converted to base64 and saved in css file');
                Util.log(pError);
                writeFile(lPath, pCSS);
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
    function writeFile(pName, pData, pCallBack){
        fs.writeFile(pName, pData, function(pError){
            if(pError)
                Util.log(pError);
            else{
                pName = path.basename(pName);
                Util.log('minify: file ' + pName + ' writed...');
            }
            
            Util.exec(pCallBack);
        });
    }
    
    
    function isFileChanged(pFileName, pFileData, pLastFile_b){
        var lReadedHash,
            i, n = Hashes.length;
        
        for(i = 0; i < n; i++){
            var lData = Hashes[i];
            
            /* if founded row with file name - save hash */
            if(lData.name === pFileName){
                lReadedHash = lData.hash;
                break;
            }
        }
        
        /* create hash of file data */ 
        var lFileHash   = crypto.createHash('sha1')
            .update(pFileData)
            .digest('hex');
        
        /* boolean hashes.json changed or not */
        if(lReadedHash !== lFileHash){
            Hashes[i]       = {
                name: pFileName,
                hash: lFileHash
            };
            
            HashesChanged   = true;
        }
        
        if(pLastFile_b){
            /* if hashes file was changes - write it */
            if(HashesChanged)
                writeFile(HASHES_JSON, Util.stringifyJSON(Hashes));
            else
                Util.log('minify: no one file has been changed');
        }
        /* has file changed? */
        return lFileHash;
    }
        
    exports.getName     = getName;
    exports.optimize    = optimize;
    exports.MinFolder   = MinFolder;
    
})();
