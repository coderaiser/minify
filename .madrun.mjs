import {run} from 'madrun';

export default {
    'test': () => `tape 'test/*.js' 'lib/**/*.spec.{js,mjs}'`,
    'coverage': async () => `escover ${await run('test')}`,
    'fix:lint': () => run('lint', '--fix'),
    'lint': () => 'putout .',
    'fresh:lint': () => run('lint', '--fresh'),
    'lint:fresh': () => run('lint', '--fresh'),
};
