/* Модуль сжатия js-скриптов, css-стилей, html-файлов и
 * конвертации картинок в css-стилях 
 * в base64 и помещения их в файл стилей
 */
var Minify = {};
console.log('minify.js loaded...');

/* функция сжимает js-скрипты 
 * и сохраняет их с именем .min.js
 */
 
var fs = require('fs');
var path=require('path');
var crypto = require('crypto');

try{
    var html = require('./lib/html');
    var js = require('./lib/js');
    var css = require('./lib/css');
    var img = require('./lib/img');
    
    Minify._uglifyJS = js._uglifyJS;
    Minify._cleanCSS = css._cleanCSS;
    Minify.htmlMinify = html.htmlMinify;
/*********************************/
}
catch(pError){
    console.log(pError);    
    console.log('One of the necessary modules is absent\n'  +
        're-install the module\n'                           +
        'npm r minify\n'                                    +
        'npm i minify');
}


/* object contains hashes of files*/
var Hashes;

var MinFolder='min/';
/* function clear MinFolder
 * if we could not create
 * directory and it is
 * not exist
 */
var folderExist = function(pError, pStat){
    "use strict";
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
    "use strict";
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

/*
 * Функция ищет в имени файла расширение
 * и если находит возвращает true
 * @pName - получает имя файла
 * @pExt - расширение
 */
Minify._checkExtension=function(pName,pExt)
{
    /* если длина имени больше
     * длинны расширения - 
     * имеет смысл продолжать
     */
    if(pName.length>pExt.length){
        var lLength=pName.length;           /* длина имени*/
        var lExtNum=pName.lastIndexOf(pExt);/* последнее вхождение расширения*/
        var lExtSub=lLength-lExtNum;        /* длина расширения*/
        /* если pExt - расширение pName */
        if(lExtSub===pExt.length)
            return true;
        else
            return false;
    }
    else return false;
};

/* function gets file extension
 * @pFileName
 * return Ext
 */
Minify._getExtension = function(pFileName){
    /* checking for js/html/css */
    
    var lExt;
    var lCheck_f = Minify._checkExtension;
    
    if (lCheck_f(pFileName, 'css'))
        lExt = '.css';
    else if(lCheck_f(pFileName, 'html'))
        lExt = '.html';
    else if (lCheck_f(pFileName,'js'))
        lExt = '.js';
    
    return lExt;       
};

/* function minificate js,css and html files
 * @pFiles_a                - array of js, css and html file names or string, if name
 *                            single, or object if postProcessing neaded
 *                              {'client.js': function(pFinalCode){} }
 *                            or convertion images to base64 neaded
 *                              {'style.css': true}
 *                            or {'style.css':{minimize: true, func: function(){}}
 *
 * @pOptions                - object contain main options
 *                          if cache true files do not writes on disk, just saves
 *                              in Minify Cache
 * Example: 
 * {cache: false, gzip: true, callback: func(){}}
 */
exports.optimize = function(pFiles_a, pOptions){
    'use strict';
    
     /* if passed string, or object 
      * putting it to array
      */
    if (typeof pFiles_a === 'string' ||
        !pFiles_a[0])
            pFiles_a=[pFiles_a];      
            
            
    var lName;
    
    var lAllCSS = '';
    var lCSS_o;
    
    /* varible contains all readed file names */
    var lReadedFilesCount=0;
    /*
     * Processing of files
     * @pFileName       - name of file
     * @pData           - data of file
     * @pForce          - minify file anyway
     */
    var dataReaded_f = function(pFileName, pData){
        ++lReadedFilesCount;
        var lLastFile_b;
        /* if leng this not equal
         * file not last
         */            
        if (lReadedFilesCount === pFiles_a.length)
            lLastFile_b = true;
                
        /*
         * if postProcessing function exist
         * getting it from pFileName object
         */
        var lMoreProcessing_f;
        if(typeof pFileName === 'object'){
            var lName;
            for(lName in pFileName){
                break;
            }
            lMoreProcessing_f = pFileName[lName];            
            pFileName = lName;
        }
        console.log('file ' + pFileName + ' readed');
        
        var lExt = Minify._getExtension(pFileName);
        var minFileName = pFileName.replace(lExt, '.min' + lExt);
        
        minFileName = path.basename(minFileName);
        minFileName = MinFolder + minFileName;
        
       /* functin minimize files */
        var lProcessing_f = function(){
        var final_code;        
            
            /* getting optimized version */
            switch(lExt){
                case '.js': 
                    final_code  = Minify._uglifyJS(pData);
                    break;
                
                case '.html':
                    final_code  = Minify.htmlMinify(pData);
                    break;
                
                case '.css':
                    final_code  = Minify._cleanCSS(pData);
                    lAllCSS    += final_code;
                    
                    lCSS_o = lMoreProcessing_f;
                    if (typeof lCSS_o === 'object'){
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
            if (lLastFile_b && (lCSS_o && lCSS_o.img ||
                lCSS_o === true)){
                    base64_images(lAllCSS);
            }
            
            
            /* if lMoreProcessing_f seeted up 
             * and function associated with
             * current file name exists -
             * run it
             */
            if(lMoreProcessing_f                    &&    
                typeof lMoreProcessing_f === "function"){
                    final_code = lMoreProcessing_f(final_code);
            }                   
            
            /* записываем сжатый js-скрипт
             * в кэш если установлен pCache_b
             * или на диск, если не установлен
             */
            if(pOptions && pOptions.cache){
                exports.Cache[minFileName] = final_code;
                console.log('file ' + minFileName + ' saved to cache...');
            }

            /* minimized file will be in min file
             * if it's possible if not -
             * in root
             */                
            fs.writeFile(minFileName, final_code, fileWrited(minFileName));
            
            /* calling callback function if it exist */
            if(pOptions && 
                pOptions.callback &&
                typeof pOptions.callback === 'function')
                    pOptions.callback(final_code);
        };
        
        if(isFileChanged(pFileName, pData, lLastFile_b)){
            lProcessing_f();        
          /* if file was not changed */
        } else{
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
                        
                        if(pOptions.callback &&
                            typeof pOptions.callback === 'function')
                                pOptions.callback(pFinalCode);                        
                    }
                    else if(lExt === '.css'){
                            /* if it's css and last file */
                            lAllCSS += pFinalCode;
                            if(lLastFile_b &&
                                (lMoreProcessing_f.img || lMoreProcessing_f === true)){
                                    base64_images(lAllCSS);
                            }
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
        if(typeof lPostProcessing_o === 'object'){
            for(lName in lPostProcessing_o){
            }
        } else lName = pFiles_a[i];
        console.log('reading file ' + lName + '...');        
                
        /* if it's last file send true */
        fs.readFile(lName,
            fileReaded(pFiles_a[i],
                dataReaded_f));
    }
    /* saving the name of last readed file for hash saving function */
    
    return true;
};


/* функция переводит картинки в base64 и записывает в css-файл*/
function base64_images(pFileContent_s){
    'use strict';    
     var b64img;
     try{
        b64img = require('css-b64-images');
    }catch(error){
        console.log('can\'n load clean-css \n'    +
                'npm install -g css-b64-images\n' +
                'https://github.com/Filirom1/css-base64-images');
                
        fs.writeFile(MinFolder + 'all.min.css',
            pFileContent_s,
            fileWrited(MinFolder + 'all.min.css'));        
            
        return pFileContent_s;
    }
    b64img.fromString(pFileContent_s, '.','', function(err, css){
        console.log('images converted to base64 and saved in css file');
        fs.writeFile(MinFolder + 'all.min.css', css, fileWrited(MinFolder + 'all.min.css'));
    });
}

/* Функция создаёт асинхроную версию 
 * для чтения файла
 * @pFileName       - имя считываемого файла
 * @pProcessFunc    - функция обработки файла
 * @pLastFile_b     - последний файл?
 */
function fileReaded(pFileName,pProcessFunc, pLastFile_b){
    "use strict";
    return function(pError,pData){
        /* функция в которую мы попадаем,
         * если данные считались
         *
         * если ошибка - показываем её
         * иначе если переданная функция -
         * функция запускаем её
         */        
        if(!pError)
            if (pProcessFunc && typeof pProcessFunc==="function")
                    pProcessFunc(pFileName,pData.toString(), pLastFile_b);
        else console.log(pError);
    };
}

/*
 * Функция вызываеться после записи файла
 * и выводит ошибку или сообщает,
 * что файл успешно записан
 */
function fileWrited(pFileName){
    "use strict";
    return function(error){
        console.log(error?error:('file '+pFileName+' writed...'));
    };
}

/*
 * Function reads hash table of files
 * checks is file changed or not
 * and return result.
 * @pFileName - name of file
 * @pFileData - data of file
 * result: boolean
 */
function isFileChanged(pFileName, pFileData, pLastFile_b){
        var lReadedHash;
        /* boolean hashes.json changed or not */
        var lHashesChanged_b = false;
        
        if(!Hashes)
            try {
                /* try to read file with hashes */
                console.log('trying  to read hashes.json');
                Hashes = require(process.cwd()+'/hashes');                
            }catch(pError) {
                console.log('hashes.json not found... \n');
                Hashes = {};
            }
        
        for(var lFileName in Hashes)
            /* if founded row with
             * file name - save hash
             */
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
            Hashes[pFileName] = lFileHash;
            lHashesChanged_b = true;
        }
                                
        if(pLastFile_b){                                    
            /* if hashes file was changes - write it */
            if(lHashesChanged_b)
                fs.writeFile('./hashes.json',
                    JSON.stringify(Hashes),
                    fileWrited('./hashes.json'));
            else console.log('no one file has been changed');
        }
        /* has file changed? */
        return lHashesChanged_b;
}