Minify v0.2.6 [![NPM version][NPMIMGURL]][NPMURL] [![Dependency Status][DependencyStatusIMGURL]][DependencyStatusURL] [![Build Status][BuildStatusIMGURL]][BuildStatusURL]
===============
[NPMIMGURL]:                https://badge.fury.io/js/minify.png
[BuildStatusIMGURL]:        https://secure.travis-ci.org/coderaiser/minify.png?branch=dev
[DependencyStatusIMGURL]:   https://gemnasium.com/coderaiser/minify.png
[FlattrIMGURL]:             http://api.flattr.com/button/flattr-badge-large.png
[NPM_INFO_IMG]:             https://nodei.co/npm/minify.png?stars
[NPMURL]:                   //npmjs.org/package/minify
[BuildStatusURL]:           //travis-ci.org/coderaiser/minify  "Build Status"
[DependencyStatusURL]:      //gemnasium.com/coderaiser/minify "Dependency Status"
[FlattrURL]:                https://flattr.com/submit/auto?user_id=coderaiser&url=github.com/coderaiser/minify&title=minify&language=&tags=github&category=software

[Minify](http://coderaiser.github.io/minify "Minify") - a minifier of js, css, html and img files,
used in [Cloud Commander](http://cloudcmd.io "Cloud Commander") project.

[![Flattr][FlattrIMGURL]][FlattrURL]

Install
---------------
[![NPM_INFO][NPM_INFO_IMG]][NPMURL]

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

**optimize**(*files*) - function which minificate js, html and
css-files.
 - **files**                     - varible, wich contain array of file
names or string, if name single.
 - **options**(optional)           - object contain main options.

**Examples**:

```js
minify.optimize('client.js');
```

```js
minify.optimize('client.js', {
    callback: func(minData) {
    }
});
```

if a couple files:

```js
minify.optimize([
    'client.js',
    'style.css'
]);
```

if post processing needed 

```js
minify.optimize({
    'client.js' : function(minData) {
    }
});
```

if post image converting needed (works with css only)

```js
minify.optimize([{
    'style.css': {
        img: true,
        merge: true
        }
    }, 'index.html']);
```    

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
