Minify [![Build Status](https://secure.travis-ci.org/coderaiser/minify.png?branch=master)](http://travis-ci.org/coderaiser/minify)
======

**Minify** - a minifier of js, css, html and img files,
used in [Cloud Commander](http://coderaiser.github.com/cloudcmd "Cloud Commander")
project.

Install
---------------
You can install minify just like that:

    npm i minify
or
    
    git clone git://github.com/coderaiser/minify

Command Line
---------------
For use in command line just write something like:
```
minify <input-file> <output-file>
```
or just 
```
minify <input-file>>
```
to see output in screen.

API
---------------
**Minify** module contains some api for interacting from another js files.

To use **Minify** functions it sould be connected first. It's doing like always.
```js
minify = require('minify');
```
All of minification functions save files in **./min** directory with
extension **.min** (*.min.js, *.min.css, *.min.html).
If directory could be created **minify.MinFolder** would countain stirng 'min/',
in any other case - '/'.

**optimize**(*pFiles_a*) - function which minificate js, html and
css-files.
 - **pFiles_a**                     - varible, wich contain array of file
names or string, if name single.
 - **pOptions**(optional)           - object contain main options.

```js
pOptions = {callback: func(pFinalCode){}};
```

**Examples**:

```js
minify.optimize('client.js');
```

```js
minify.optimize('client.js', {
    callback: func(pMinData){}
});
```

if a couple files:
```js
minify.optimize(['client.js',
    'style.css']);
```

if post processing needed 
```js
minify.optimize({
    'client.js' : function(pFinalCode){}
});
```

if post image converting needed (works with css only)
```js
minify.optimize([{'style.css': {img: true, merge: true} },
    'index.html']);
```    

if only need the name of minified file (from min directory)
```js
minify.optimize('client.js', {
    returnName  : true
    callback    : function(pParams){
        var lName = pParams && pParams.name;
        console.log(lName)
    }
});
```

**MinFolder** - varible thet contains folder name, where minimized files stored.
                (could not be changed for now).
                
Additional modules:
---------------
- [UglifyJS] (https://github.com/mishoo/UglifyJS)
- [clean-css] (https://github.com/GoalSmashers/clean-css)
- [html-minifier] (https://github.com/kangax/html-minifier)
- [css-b64-images] (https://github.com/Filirom1/css-base64-images)

Install addtitional modules:

    npm i uglify-js clean-css html-minifier css-b64-images