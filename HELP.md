Minify v0.5.1
===============
[NPM_INFO_IMG]:             https://nodei.co/npm/minify.png?stars

[Minify](http://coderaiser.github.io/minify "Minify") - a minifier of js, css, html and img files,
used in [Cloud Commander](http://cloudcmd.io "Cloud Commander") project.

Install
---------------
![NPM_INFO][NPM_INFO_IMG]

You can install minify just like that:

    npm i minify -g
or
    
    git clone git://github.com/coderaiser/minify

Command Line
---------------
For use in command line just write something like:

```
minify <input-file1> <input-file2> <input-fileN> > output
```
For example:

```
minify client.js util.js > all.js
minify screen.css reset.css > all.css

cat client.js | minify -js
cat *.css | minify -css
```

API
---------------
**Minify** module contains some api for interacting from another js files.

To use **Minify** functions it sould be connected first. It's doing like always.

```js
minify = require('minify');
```
After minification file would be saved in temporary directory.

## optimize
**optimize**(*file*) - function which minificate js, html and
css-files.

 - **file**                 - path to file
 - **options**(optional)    - object contain main options.

Possible options:
 - callback
 - notLog
 - returnName

**Examples**:

```js
minify.optimize('client.js');
```

```js
minify.optimize('client.js', {
    notLog  : true,
    callback: func(error, minData) {
    }
});
```

if post processing needed 

```js
minify.optimize({
    'client.js' : function(error, minData) {
    }
});
```

## optimizeData
Gets data on input.
Parameters:
- Object with data and extensions (`.js`, `.css`, `img`)
- Callback

**Example**:

```js
    minify.optimizeData({
        ext: '.js',
        data: 'function hello() { if (2 > 3) console.log('for real')}'
    }, function(error, data) {
        console.log(error, data);
    });
```

## getName
if only need the name of minified file (from min directory)

```js
var hashName = minify.getName('client.js');
console.log(hashName);
```

**MinFolder** - variable that contains folder name, where minimized files stored.
                (could not be changed for now).
                
Additional modules:
---------------
- [UglifyJS] (https://github.com/mishoo/UglifyJS)
- [clean-css] (https://github.com/GoalSmashers/clean-css)
- [html-minifier] (https://github.com/kangax/html-minifier)
- [css-b64-images] (https://github.com/Filirom1/css-base64-images)
- [util.io] (https://github.com/coderaiser/util.io)

Install additional modules (in minify folder):

    npm install

Contributing
---------------
If you would like to contribute - send pull request to dev branch.
Getting dev version of **Minify**:

    git clone git://github.com/coderaiser/minify.git
    git checkout dev
