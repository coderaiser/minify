import {run} from 'madrun';

export default {
    'test': () => 'tape test/*.js',
    'coverage': () => 'c8 npm test',
    'report': () => 'c8 report --reporter=lcov',
    'fix:lint': () => run('lint', '--fix'),
    'lint': () => 'putout .',
    'fresh:lint': () => run('lint', '--fresh'),
    'lint:fresh': () => run('lint', '--fresh'),
};

