'use strict';

const {run} = require('madrun');

module.exports = {
    'test': () => 'tape test/minify.js',
    'coverage': () => 'nyc npm test',
    'report': () => 'nyc report --reporter=text-lcov | coveralls',
    'fix:lint': () => run('lint', '--fix'),
    'lint': () => 'putout .',
    'fresh:lint': () => run('lint', '--fresh'),
    'lint:fresh': () => run('lint', '--fresh'),
};

