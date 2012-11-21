(function(){
    "strict mode";
    
    var DIR,
        LIBDIR,
        Util;
    
    /* Constants */    
    exports.LIBDIR      = LIBDIR    = __dirname + '/',
    exports.DIR         = DIR       = LIBDIR + '../',
    
    /* Functions */
    exports.require                 = mrequire,
    exports.librequire              = librequire,
    exports.rootrequire             = rootrequire,
    
    /* Native Modules*/
    exports.crypto                  = require('crypto'),
    exports.fs                      = require('fs'),
    exports.path                    = require('path'),
    
    /* Needed Modules */
    exports.util    = Util          = require(LIBDIR + 'util');
    
    
    /**
     * function do safe require of needed module
     * @param {Strin} pSrc
     */
    function mrequire(pSrc){
        var lModule,        
        lError = Util.tryCatch(function(){
            lModule = require(pSrc);
        });
        
        if(lError)
            console.log(lError);
        
        return lModule;
    }
    
    function rootrequire(pSrc){ return mrequire(DIR + pSrc); }
    
    function librequire(pSrc){ return mrequire(LIBDIR + pSrc); }
    
})();
