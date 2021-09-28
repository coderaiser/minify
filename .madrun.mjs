import {run} from 'madrun';

export default {
    'test': () => `tape --check-assertions-count 'test/*.js' 'lib/**/*.spec.{js,mjs}'`,
    'coverage': () => 'c8 npm test',
    'report': () => 'c8 report --reporter=lcov',
    'fix:lint': () => run('lint', '--fix'),
    'lint': () => 'putout .',
    'fresh:lint': () => run('lint', '--fresh'),
    'lint:fresh': () => run('lint', '--fresh'),
};

