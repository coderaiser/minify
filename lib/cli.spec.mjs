import {test} from 'supertape';
import {hasArg} from './cli.mjs';

test('hasArg: return true if the arg is present, and true', (t) => {
    const result = hasArg(['argMock'], {argMock: true});
    
    t.deepEqual(result, true);
    t.end();
});

test('hasArg: return false if the arg is present, and false', (t) => {
    const result = hasArg(['argMock'], {argMock: false});
    
    t.deepEqual(result, false);
    t.end();
});

test('hasArg: return false if the arg is not present', (t) => {
    const result = hasArg(['argMock'], {otherArgMock: true});
    
    t.deepEqual(result, false);
    t.end();
});
