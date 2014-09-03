Minify v1.0.2
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
stdout | minify -<flag>
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


```js
minify = require('minify');
```
After minification, a file will be saved in the temporary directory.

minify - function to minificate js, html and css-files.

 - **file**                 - path to file.
 - **options**(optional)    - object contains options.
 - **callback**

Possible options:
 - log
 - returnName

**Examples**:

## Optimize file
```js
var minify = require('minify');

minify('client.js', {
    returnName  : true,
    log         : true
}, function(error, name) {
    console.log(error || name);
});
```

if post processing is needed: 

```js
minify('client.js', function(error, data) {

});
```

## Optimize data
Gets data on input.
Parameters:
- Object with data and extensions (`.js`, `.css`, `img`)
- Callback

**Example**:

```js
minify({
    ext: '.js',
    data: 'function hello() { if (2 > 3) console.log('for real')}'
}, function(error, data) {
    console.log(error, data);
});
```

## Express middleware

```js
var join        = require('minify'),
    http        = require('http'),
    express     = require('express'),
    
    app         = express(),
    server      = http.createServer(app),
    
    port        = 1337,
    ip          = '0.0.0.0';
    
app.use(minify({
    dir: __dirname
}));

app.use(express.static(__dirname));

server.listen(port, ip);
```

Additional modules:
---------------
- [UglifyJS] (https://github.com/mishoo/UglifyJS)
- [clean-css] (https://github.com/GoalSmashers/clean-css)
- [html-minifier] (https://github.com/kangax/html-minifier)
- [css-b64-images] (https://github.com/Filirom1/css-base64-images)
- [util-io] (http://coderaiser.github.io/util-io)
