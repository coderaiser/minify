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
fs.mkdir(MinFolder,511,makeFolder);

exports.MinFolder = MinFolder;
exports.Cache    = {};

/*********************************/
/* сжимаем код через uglify-js */
Minify._uglifyJS= function(pDdata){
    
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
        console.log('can\'n load uglify-js\n'                  +
            'to use js-minification you need to install uglify-js\n'    +
                'npm install uglify-js\n'                               +
                'https://github.com/mishoo/UglifyJS');
        return false;
    }
                
    var orig_code = pDdata.toString();
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
        return false;
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
        return false;
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
}


/* function minificate js,css and html files
 * @pFiles_a                - array of js, css and html file names or string, if name
 *                            single, or object if postProcessing neaded
 *                              {'client.js': function(pFinalCode){} }
 *                            or convertion images to base64 neaded
 *                              {'style.css': true}
 *                            or {'style.css':{minimize: true, func: function(){}}
 * @pCache_b                - if true files do not writes on disk, just saves
 *                              in Minify Cache
 */
exports.optimize = function(pFiles_a, pCache_b){
    'use strict';
    
     /* if passed string, or object 
     * putting it to array
     */
    if (typeof pFiles_a === 'string' ||
        !pFiles_a[0])
            pFiles_a=[pFiles_a];      
            
            
    var lName;
        
    var dataReaded_f=function(pFileName, pData){        
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
        
        if (!isFileChanged(pFileName, pData)) {
            console.log('file: ' + pFileName + ' do not changed...');
            return;
        }
        
        var final_code;
        var minFileName;
        
        /* if it's js file - getting optimized version */
        if(Minify._checkExtension(pFileName,'js')){
            
            final_code=Minify._uglifyJS(pData);        
            minFileName=pFileName.replace('.js','.min.js');           
            
        } else if (Minify._checkExtension(pFileName,'html')) {
            
            final_code=Minify.htmlMinify(pData);                
            minFileName=pFileName.replace('.html','.min.html');
            
        }else
            return;
        
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
        if(pCache_b){
            exports.Cache[minFileName] = final_code;
            console.log('file ' + minFileName + ' saved to cache...');
        }
        else{
            /* minimized file will be in min file
             * if it's possible if not -
             * in root
             */
            minFileName = MinFolder + minFileName;
            
            fs.writeFile(minFileName, final_code, fileWrited(minFileName));
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
        }else lName = pFiles_a[i];
        console.log('reading file ' + lName + '...');        
                
        /* if it's last file send true */
        fs.readFile(lName,
            fileReaded(pFiles_a[i],
                dataReaded_f,
                (i===pFiles_a.length)?true:false));
    }
    /* saving the name of last readed file for hash saving function */
    
    return true;
}

/* функция сжимает css-стили 
 * и сохраняет их с именем .min.css
 * @pCSSFiles_a           - масив имен css файлов или строка,
 *                          если имя одно
 * @pImgConvertToBase64_b - булевый признак,
 *                          который отвечает за то, что быконвертировать
 *                          картинки в base64 и поместить в выходной css файл
 */
exports.cssStyles=function cssStyles(pCSSFiles_a, pImgConvertToBase64_b){
                
    if(typeof pCSSFiles_a === "string")
        pCSSFiles_a=[pCSSFiles_a];
    /* Varible contains information
     * about readed css file
     */
    var lCSSFiles_doneCount=0;
    
    var lAllStyle='';
    
    var dataReaded_f=function(pFileName, pData) {
        
        console.log('file ' + pFileName + ' readed');        
        var final_code=Minify._cleanCSS(pData);
        
        lAllStyle+=final_code;
        
        var minFileName=pFileName.replace('.css','.min.css');           
           
        ++lCSSFiles_doneCount;
        
        /* if all files writed we
         * save all minimized css 
         * to one file all.min.css
         */                
        if(pCSSFiles_a.length === lCSSFiles_doneCount){
            /* если включена конвертация картинок в base64
             * вызываем её
             */
            if(pImgConvertToBase64_b)
                base64_images(lAllStyle);
            else
                fs.writeFile(MinFolder + 'all.min.css', lAllStyle, fileWrited(MinFolder + 'all.min.css'));
        }
         /* в другом случае - записываем сжатый css файл*/
        else{
            minFileName = MinFolder + path.basename(minFileName); 
            fs.writeFile(minFileName, final_code, fileWrited(minFileName));
        }
    };
    
   /* moving thru all elements of css files array */
    for(var i=0;pCSSFiles_a[i];i++){
        console.log('reading file ' + pCSSFiles_a[i]+'...');
        fs.readFile(pCSSFiles_a[i],fileReaded(pCSSFiles_a[i],dataReaded_f));
    }
        
    return true;
};


/* функция переводит картинки в base64 и записывает в css-файл*/
function base64_images(pFileContent_s){
    'use strict';    
     var b64img;
     try{
        b64img = require('css-b64-images');
    }catch(error){
        console.log('can\'n load clean-css \n'                 +
            'to use images to base64 convertation you need to install css-base64-images \n'  +
                'npm install -g css-b64-images\n'                               +
                'https://github.com/Filirom1/css-base64-images');
        return false;
    }
    b64img.fromString(pFileContent_s, '.','', function(err, css){
        console.log('images converted to base64 and saved in css file');
        fs.writeFile(MinFolder + 'all.min.css', css, fileWrited(MinFolder + 'all.min.css'));
    });
}

/* Функция создаёт асинхроную версию 
 * для чтения файла
 * @pFileName - имя считываемого файла
 */
function fileReaded(pFileName,pCompressFunc){
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
            if (pCompressFunc && typeof pCompressFunc==="function")
                    pCompressFunc(pFileName,pData.toString());
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
function isFileChanged(pFileName, pFileData){
        var lReadedHash;
        
        if(!Hashes)
            try {
                /* try to read file with hashes */
                Hashes = require('hashes.json');            
                for(var lFileName in Hashes)
                    /* if founded row with file name
                     * saving hash
                     */
                    if (lFileName === pFileName) {
                        lReadedHash = Hashes[pFileName];
                        break;
                    }
            }catch(pError) {
                Hashes={};
            }
        /* create md5 hash of file data */ 
        var lFileHash = crypto.createHash('sha1');
        lFileHash.update(pFileData);
        lFileHash = lFileHash.digest('hex');
        
        console.log(pFileName + ': ' + lFileHash);
        
        if(lReadedHash && 
            lReadedHash === lFileHash){
                /* file did not change */
                return false;
        }else{
            Hashes[pFileName] = lFileHash;
            console.log(Hashes);
            
            return true;
        }        
}