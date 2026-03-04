import {run} from 'madrun';

export default {
    'test': () => `tape 'test/*.js' 'lib/**/*.spec.js'`,
    'coverage': async () => `c8 ${await run('test')}`,
    'coverage:escover': async () => `escover ${await run('test')}`,
    'fix:lint': () => run('lint', '--fix'),
    'lint': () => 'putout .',
    'fresh:lint': () => run('lint', '--fresh'),
    'lint:fresh': () => run('lint', '--fresh'),
};
