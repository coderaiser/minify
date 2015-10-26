(function() {
    'use strict';
    
    let minify  = require('..'),
        test    = require('tape');
    
    test('arguments: no', t => {
        t.throws(minify, /name could not be empty!/, 'name empty check');
        t.end();
    });
})();
