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

/* object contains hashes of files*/
var Hashes;
/* hash of hashes.json*/
var HashesHash;

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
fs.mkdir(MinFolder,511,makeFolder);

exports.MinFolder = MinFolder;
exports.Cache    = {};

/*********************************/
/* сжимаем код через uglify-js */
Minify._uglifyJS= function(pData){
    
    /* подключаем модуль uglify-js
     * если его нет - дальнейшая 
     * работа функции не имеет смысла
     */
    var jsp;
    var pro;
    try{
        jsp = require("uglify-js").parser;
        pro = require("uglify-js").uglify;
    }catch(error){
        console.log('can\'n load uglify-js\n'       +
                'npm install uglify-js\n'           +
                'https://github.com/mishoo/UglifyJS');
        return pData;
    }
                
    var orig_code = pData.toString();
    var ast = jsp.parse(orig_code); // parse code and get the initial AST
    ast = pro.ast_mangle(ast); // get a new AST with mangled names
    ast = pro.ast_squeeze(ast); // get an AST with compression optimizations
    var result_code = pro.gen_code(ast); // compressed code here
    return result_code;
};

/* сжимаем код через clean-css */
Minify._cleanCSS=function(pData){
    'use strict';
     /* connecting cleanCSS,
      * if we can't find it -
      * return false
      */
     var cleanCSS;
     try{
        cleanCSS = require('clean-css');
    }catch(error){
        console.log('can\'n load clean-css \n'                          +
            'to use css-minification you need to install clean-css \n'  +
                'npm install clean-css\n'                               +
                'https://github.com/GoalSmashers/clean-css');
        return pData;
    }
        /* Сохраняем весь стиль в одну переменную*/            
    return cleanCSS.process(pData);
};

/* сжимаем код через htmlMinify */
Minify.htmlMinify=function(pData){        
    /* Сохраняем весь стиль в одну переменную*/            
     
     /* connecting cleanCSS,
      * if we can't find it -
      * return false
      */
     var htmlMinifier;
     try{
        htmlMinifier = require('html-minifier');
    }catch(error){
        console.log('can\'n load html-minifier \n'                 +
            'to use html-minification you need to install html-minifier\n'  +
                'npm install html-minifier\n'                               +
                'https://github.com/kangax/html-minifier');
        return pData;
    }
    
    var lOptions={
        removeComments:                 true,
        removeCommentsFromCDATA:        true,
        removeCDATASectionsFromCDATA:   true,
        collapseWhitespace:             true,
        collapseBooleanAttributes:      true,
        removeAttributeQuotes:          true,
        removeRedundantAttributes:      true,
        useShortDoctype:                true,
        removeEmptyAttributes:          true,
        /* оставляем, поскольку у нас
         * в элемент fm генерируеться
         * таблица файлов
         */
        removeEmptyElements:            false,
        removeOptionalTags:             true,
        removeScriptTypeAttributes:     true,
        removeStyleLinkTypeAttributes:  true
    };
    
    
    return htmlMinifier.minify(pData,lOptions);
};
/*********************************/


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
    var dataReaded_f=function(pFileName, pData){                
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
                
        var final_code;
        var minFileName;
        
        /* if it's js file - getting optimized version */
        if(Minify._checkExtension(pFileName,'js')){
            
            final_code=Minify._uglifyJS(pData);        
            minFileName=pFileName.replace('.js', '.min.js');           
            
        } else if (Minify._checkExtension(pFileName, 'html')) {
            
            final_code=Minify.htmlMinify(pData);                
            minFileName=pFileName.replace('.html', '.min.html');
            
        } else if (Minify._checkExtension(pFileName, 'css')) {
            
            final_code  = Minify._cleanCSS(pData);

            lAllCSS    += final_code;
            minFileName = pFileName.replace('.css','.min.css');           
            
            /* in css could be lCSS_o 
             * {img: true, moreProcessing: function(){}}
             */
            if(!lCSS_o){
                lCSS_o = lMoreProcessing_f;
                if (typeof lCSS_o === 'object'){
                        lMoreProcessing_f = lCSS_o.moreProcessing;
                }
            }
        } else
            return;
                                
            /* if it's last file
             * and base64images setted up
             * se should convert it
             */
        if (lLastFile_b && (lCSS_o && lCSS_o.img ||
            lCSS_o === true)){
                if(isFileChanged('all.min.css', lAllCSS))
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
        
        minFileName = path.basename(minFileName);
                
        /* записываем сжатый js-скрипт
         * в кэш если установлен pCache_b
         * или на диск, если не установлен
         */
        if(pOptions && pOptions.cache){
            exports.Cache[minFileName] = final_code;            
            console.log('file ' + minFileName + ' saved to cache...');
        }
        else{
            /* minimized file will be in min file
             * if it's possible if not -
             * in root
             */
            
            if (isFileChanged(pFileName, pData, lLastFile_b)) {
                minFileName = MinFolder + minFileName;            
                fs.writeFile(minFileName, final_code, fileWrited(minFileName));
            }
        }
        /* calling callback function if it exist
         */
        if(pOptions && 
            pOptions.callback &&
            typeof pOptions.callback === 'function')
                pOptions.callback();
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
        
        /* create hash of file data */ 
        var lFileHash = crypto.createHash('sha1');
        if(!Hashes)
            try {
                /* try to read file with hashes */
                console.log('trying  to read hashes.json');
                Hashes = require(process.cwd()+'/hashes');
                
                /* getting hash of hash file */
                lFileHash.update(JSON.stringify(Hashes));
                HashesHash = lFileHash.digest('hex');
                
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
        
        lFileHash = crypto.createHash('sha1'); 
        lFileHash.update(pFileData);
        lFileHash = lFileHash.digest('hex');
                
        Hashes[pFileName] = lFileHash;
                                
        if(pLastFile_b){
            
            lFileHash = crypto.createHash('sha1');
            lFileHash.update(JSON.stringify(Hashes));
            lFileHash = lFileHash.digest('hex');
            
            /* if hashes file was changes - write it */
            if(lFileHash !== HashesHash)
                fs.writeFile('./hashes.json',
                    JSON.stringify(Hashes),
                    fileWrited('./hashes.json'));
            else console.log('no one file has been changed');
        }
        /* has file changed? */
        return lReadedHash !== lFileHash;
}