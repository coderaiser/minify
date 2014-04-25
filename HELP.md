Minify v0.4.1 [![NPM version][NPMIMGURL]][NPMURL] [![Dependency Status][DependencyStatusIMGURL]][DependencyStatusURL] [![Build Status][BuildStatusIMGURL]][BuildStatusURL] [![License][LicenseIMGURL]][LicenseURL] [![Flattr][FlattrIMGURL]][FlattrURL]
===============
[NPMIMGURL]:                https://badge.fury.io/js/minify.png
[BuildStatusIMGURL]:        https://secure.travis-ci.org/coderaiser/minify.png?branch=dev
[DependencyStatusIMGURL]:   https://gemnasium.com/coderaiser/minify.png
[FlattrIMGURL]:             https://img.shields.io/badge/flattr-donate-317BF9.svg
[LicenseIMGURL]:            https://img.shields.io/badge/license-MIT-317BF9.svg
[NPM_INFO_IMG]:             https://nodei.co/npm/minify.png?stars
[NPMURL]:                   //npmjs.org/package/minify
[LicenseURL]:               https://tldrlegal.com/license/mit-license "MIT License"
[BuildStatusURL]:           //travis-ci.org/coderaiser/minify  "Build Status"
[DependencyStatusURL]:      //gemnasium.com/coderaiser/minify "Dependency Status"
[FlattrURL]:                https://flattr.com/submit/auto?user_id=coderaiser&url=github.com/coderaiser/minify&title=minify&language=&tags=github&category=software

[Minify](http://coderaiser.github.io/minify "Minify") - a minifier of js, css, html and img files,
used in [Cloud Commander](http://cloudcmd.io "Cloud Commander") project.

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
After minification file would be saved in temporary directory.

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
    'client.js' : function(minData) {
    }
});
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
