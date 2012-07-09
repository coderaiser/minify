Minify [![Build Status](https://secure.travis-ci.org/coderaiser/cloudcmd.png?branch=master)](http://travis-ci.org/coderaiser/cloudcmd)
======

**Minify** - a minifier of js, css, html and img files,
used in [Cloud Commander](http://github.com/coderaiser/cloudcmd "Cloud Commander")
project.

API
---------------
**Minify** module contains some api for interacting from another js files.
    jsScripts(pJSFiles_a, pMoreProcessing_o)
    /* function which minificate js-files
     * @pJSFiles_a              - varible, wich contain array
     *                            of js file names or string, if name
     *                            single
     * @pMoreProcessing_o - object, thet contain function thet will be executed
     *                            after js-file processed and file name
     * pMoreProcessing_o Example: { Name:'1.js', Func: function(pFinalCode){} }
     */

Examples of using
---------------
    var minify=require('minify');
    minify.jsScripts('client.js');
    minify.cssStyles('style.css');
    minify.html('index.html');

Additional modules:
---------------
- [UglifyJS] (https://github.com/mishoo/UglifyJS)
- [clean-css] (https://github.com/GoalSmashers/clean-css)
- [html-minifier] (https://github.com/kangax/html-minifier)
- [css-b64-images] (https://github.com/Filirom1/css-base64-images)

Install addtitional modules:

    npm i uglify-js clean-css html-minifier css-b64-images