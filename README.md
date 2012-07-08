Minify [![Build Status](https://secure.travis-ci.org/coderaiser/cloudcmd.png?branch=master)](http://travis-ci.org/coderaiser/cloudcmd)
======

**Minify** - a minifier of js, css, html and img files,
used in [Cloud Commander](http://github.com/coderaiser/cloudcmd "Cloud Commander")
project.

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