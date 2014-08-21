---
layout: default
---

Minify v0.9.0
===============
[NPM_INFO_IMG]:             https://nodei.co/npm/minify.png?stars

[Minify](http://coderaiser.github.io/minify "Minify") - a minifier of js, css, html and img files,
used in [Cloud Commander](http://cloudcmd.io "Cloud Commander") project.

Install
---------------
![NPM_INFO][NPM_INFO_IMG]

You can install minify via [npm](https://www.npmjs.org/):

    npm i minify -g
or
    
    git clone git://github.com/coderaiser/minify

Command Line
---------------
Command line syntax:

```
minify <input-file1> <input-file2> <input-fileN> > output
stdout | minify -flag
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
The **Minify** module contains an api for interacting with other js files.

To use the **Minify** functions it sould be connected first.

```js
minify = require('minify');
```
After minification, a file will be saved in the temporary directory.

## optimize
**optimize**(*file*) - function to minificate js, html and css-files.

 - **file**                 - path to file.
 - **options**(optional)    - object contains main options.

Possible options:
 - callback
 - notLog
 - returnName

**Examples**:

```js
minify.optimize('client.js', {
    returnName: true
}, function(error, name) {
    console.log(error || name);
});
```

```js
minify.optimize('client.js', {
    notLog  : true,
}, func(error, minData) {

});
```

if post processing is needed: 

```js
minify.optimize('client.js', function(error, minData) {

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

Additional modules:
---------------
- [UglifyJS] (https://github.com/mishoo/UglifyJS)
- [clean-css] (https://github.com/GoalSmashers/clean-css)
- [html-minifier] (https://github.com/kangax/html-minifier)
- [css-b64-images] (https://github.com/Filirom1/css-base64-images)
- [util-io] (http://coderaiser.github.io/util-io)
