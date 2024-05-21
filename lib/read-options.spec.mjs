import tryToCatch from 'try-to-catch';
import {stub, test} from 'supertape';
import {readOptions} from './read-options.mjs';

test('minify: readOptions', async (t) => {
    const fixture = {
        js: true,
    };
    
    const readjson = stub().resolves(fixture);
    const find = stub().resolves('/hello');
    
    const options = await readOptions({
        readjson,
        find,
    });
    
    t.deepEqual(options, fixture);
    t.end();
});

test('minify: readOptions: cannot readFile', async (t) => {
    const find = stub().resolves('/hello');
    
    const [error] = await tryToCatch(readOptions, {
        find,
    });
    
    t.equal(error.message, `ENOENT: no such file or directory, open '/hello'`);
    t.end();
});

test('minify: readOptions: no', async (t) => {
    const result = await readOptions();
    
    t.deepEqual(result, {});
    t.end();
});
