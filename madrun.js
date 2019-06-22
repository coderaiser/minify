'use strict';

const {
    run,
    series,
    parallel,
} = require('madrun');

module.exports = {
    "test": () => 'tape test/minify.js',
    "coverage": () => 'nyc npm test',
    "report": () => 'nyc report --reporter=text-lcov | coveralls',
    "lint": () => run(['putout', 'lint:*']),
    "fix:lint": () => run(['putout', 'lint:*'], '--fix'),
    "lint:bin": () => 'eslint --rule no-console:0 bin',
    "lint:lib": () => 'eslint lib test',
    "putout": () => 'putout bin lib test'
};

