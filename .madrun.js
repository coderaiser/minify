'use strict';

const {run} = require('madrun');

module.exports = {
    'test': () => 'tape test/minify.js',
    'coverage': () => 'nyc npm test',
    'report': () => 'nyc report --reporter=text-lcov | coveralls',
    'fix:lint': () => run('lint', '--fix'),
    'lint': () => 'eslint bin lib test madrun.js',
    'putout': () => 'putout bin lib test',
};

