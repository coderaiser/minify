(function(){
    "use strict";
    
    var DIR         = __dirname + '/../',
        LIBDIR      = DIR + 'lib/',
        main        = require(LIBDIR + 'main'),
        
        fs          = main.fs,
        filename    = DIR + 'test/test.js',
        
        minify      = main.rootrequire('minify'),
        uglify      = main.require('uglify-js'),
        
        ErrorMsg    =   'can\'n load uglify-js          \n' +
                        'npm install uglify-js          \n' +
                        'https://github.com/mishoo/UglifyJS';
    
    jsTesting();
    
    function jsTesting(){
        fs.readFile(filename, fileReaded);
        
        var lData;
        
        function fileReaded(pError, pData) {
            if(pError)
                return result(pError);
                
            lData = pData;
            
            minify.optimize(filename,{
                callback : jsCompare
            });
            
        }
        
        
        function jsCompare(pData){
            fs.rmdir('min', function(){
                var lUglify = _uglifyJS(lData),
                    lResult = lUglify === pData;
                
               return result('uglify-js: ' + lResult);
            });
        }
        
        function result(pResult){
            console.log(pResult);
        }
    }
    
    function _uglifyJS(pData){
        var lRet;
        
        if(uglify){
            var lResult = uglify.minify(pData, {fromString: true});
            lRet = lResult.code;
        }
        else{
            lRet = pData;
            console.log(ErrorMsg);
        }
        
        return lRet;
    }
})();
