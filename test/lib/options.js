'use strict';

const {stub, test} = require('supertape');
const {findOptionsFromFile} = require('../../lib/options');

const mockOptions = {
    mockOption: 'mockValue',
};

test('findOptionsFromFile: return the options from the found file', async (t) => {
    const findOptionsFile = stub().resolves('/filePathMock');
    const readFile = stub().returns(JSON.stringify(mockOptions));
    
    const {options, error} = await findOptionsFromFile({readFile, findOptionsFile});
    t.deepEqual(options, mockOptions);
    t.deepEqual(error, undefined);
    t.deepEqual(findOptionsFile.callCount, 1);
    t.deepEqual(findOptionsFile.args[0], ['.minify.json']);
    t.deepEqual(readFile.callCount, 1);
    t.deepEqual(readFile.args[0], ['/filePathMock']);
});

test('findOptionsFromFile: return options = {} if the options file is not found', async (t) => {
    const findOptionsFile = stub().resolves(undefined);
    const readFile = stub().returns(JSON.stringify(mockOptions));
    
    const {options, error} = await findOptionsFromFile({readFile, findOptionsFile});
    t.deepEqual(options, {});
    t.deepEqual(error, undefined);
    t.deepEqual(findOptionsFile.callCount, 1);
    t.deepEqual(findOptionsFile.args[0], ['.minify.json']);
    t.deepEqual(readFile.callCount, 0);
});

test('findOptionsFromFile: return a meaningfull error if the options file cannot be parsed', async (t) => {
    const findOptionsFile = stub().resolves('/filePathMock');
    const readFile = stub().returns('} Invalid JSON');
    
    const {options, error} = await findOptionsFromFile({readFile, findOptionsFile});
    
    t.deepEqual(options, undefined);
    t.deepEqual(error, Error(`Options file at /filePathMock could not be parsed with error\nUnexpected token } in JSON at position 0`));
    t.deepEqual(findOptionsFile.callCount, 1);
    t.deepEqual(findOptionsFile.args[0], ['.minify.json']);
    t.deepEqual(readFile.callCount, 1);
    t.deepEqual(readFile.args[0], ['/filePathMock']);
});

