Minify [![License][LicenseIMGURL]][LicenseURL] [![Dependency Status][DependencyStatusIMGURL]][DependencyStatusURL] [![Build Status][BuildStatusIMGURL]][BuildStatusURL] [![NPM version][NPMIMGURL]][NPMURL]
===============
[NPMIMGURL]:                https://img.shields.io/npm/v/minify.svg?style=flat
[BuildStatusIMGURL]:        https://img.shields.io/travis/coderaiser/minify/master.svg?style=flat
[DependencyStatusIMGURL]:   https://img.shields.io/gemnasium/coderaiser/minify.svg?style=flat
[LicenseIMGURL]:            https://img.shields.io/badge/license-MIT-317BF9.svg?style=flat
[NPM_INFO_IMG]:             https://nodei.co/npm/minify.png?stars
[NPMURL]:                   http://npmjs.org/package/minify
[LicenseURL]:               https://tldrlegal.com/license/mit-license "MIT License"
[BuildStatusURL]:           http://travis-ci.org/coderaiser/minify  "Build Status"
[DependencyStatusURL]:      https://gemnasium.com/coderaiser/minify "Dependency Status"

[Minify](http://coderaiser.github.io/minify "Minify") - a minifier of js, css, html and img files.
To use `minify` as middleware try [Mollify](https://github.com/coderaiser/node-mollify "Mollify").

## Install

```
npm i minify --save
```

## How to use?

```js
minify('client.js', function(error, data) {
    if (error)
        console.error(error.message);
    else
        console.log(data);
});
```

## License

MIT
