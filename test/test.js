var filename    = './test/test.js';

var fs          = require('fs');
var minify      = require('../minify');

jsTesting();

function jsTesting(){
    fs.readFile(filename, fileReaded);
    
    var lData;
    
    function fileReaded(pError, pData) {
        if(pError)
            return result(false);
            
        lData = pData;
        
        minify.optimize(filename,{
            cache    : true,
            callback : jsCompare
        });
        
    }
    
    
    function jsCompare(){        
        fs.rmdir('min', function(){
            var lUglify = _uglifyJS(lData);
            var lMinify = minify.Cache['test.min.js'];
            
            return result(lUglify === lMinify);
        });
    }
    
    function result(pResult){
        console.log(pResult);
    }
}

function _uglifyJS(pData){
    
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
}