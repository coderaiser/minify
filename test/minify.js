(function() {
    'use strict';
    
    let minify  = require('..'),
        test    = require('tape');
    
    test('arguments: no', t => {
        t.throws(minify, /name could not be empty!/, 'name empty check');
        t.end();
    });
    
    test('arguments: no callback', t => {
        let fn = name => () => minify(name);
        
        t.throws(fn('hello.css'), /callback should be function!/, 'callback check');
        t.end();
    });
})();
