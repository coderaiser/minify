Minify [![Build Status](https://secure.travis-ci.org/coderaiser/cloudcmd.png?branch=master)](http://travis-ci.org/coderaiser/cloudcmd)
======

**Minify** - a minifier of js, css, html and img files,
used in [Cloud Commander](http://github.com/coderaiser/cloudcmd "Cloud Commander")
project.

API
---------------
**Minify** module contains some api for interacting from another js files.

To use **Minify** functions it sould be connected first. It's doing like always.

    minify=require('minify');

All of minification functions save files in **./min** directory with extension **.min**
(*.min.js, *.min.css, *.min.html). If directory could be created **minify.MinFolder**
would countain stirng 'min/', in any other case - '/'.

**jsScripts**(*pJSFiles_a*, *pMoreProcessing_o*) - function which minificate js-files
 - **pJSFiles_a**                   - varible, wich contain array of js file
names or string, if name single
 - **pMoreProcessing_o**(optional)  - object, thet contain function thet will
be executed after js-file processed and file name

**Examples**:

    minify.jsScripts('client.js');
if a couple files:

    minify.jsScripts(['client.js',
        'keyBinding.js']);

if post processing needed 

    minify.jsScripts('client.js', {
        Name:'1.js',
        Func: function(pFinalCode){}
    });

**cssStyles****(***pCSSFiles_a*,*pImgConvertToBase64_b***)** - function
which minificate css-files.
 - **pJSFiles_a**                   - varible, wich contain array of js file
names or string, if name single
 - **pImgConvertToBase64_b**(optional)  - boolean varible wich is responsible
for converting images to base64 and save them in outer css-files.

**Examples**:

    minify.cssStyles('style.css');
if a couple files:

    minify.cssStyles(['style.css',
        'reset.css']);

if post image converting needed

    minify.cssStyles('client.js', true);
    
**html****(***pHTMLFiles_a***)** - function which minificate html-files.
 - **pJSFiles_a**                   - varible, wich contain array of html-file names or string, if name single

**Examples**:

    minify.html('index.html');
if a couple files:

    minify.html(['index.html','about.htm']);

**MinFolder** - varible thet contains folder name, where minimized files stored.
                (could not be changed for now).
                
Easy examples of using
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