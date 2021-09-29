import path from 'path';
import {fileURLToPath} from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import assert from 'assert';
import {promisify} from 'util';
import cssB64Images from 'css-b64-images';

const fromString = promisify(cssB64Images.fromString);

const ONE_KB = 2 ** 10;

const defaultOptions = {
    maxSize: 100 * ONE_KB,
};

/**
 * minify css data.
 * if can not minify return data
 *
 * @param name
 * @param data
 * @param userOptions - (optional) object that may contain an `img` key with an object of options
 */
export default (name, data, userOptions) => {
    const dir = __dirname(name);
    const dirRelative = dir + '/../';
    
    const options = {
        ...defaultOptions,
        ...userOptions?.img || {},
    };
    
    assert(name);
    assert(data);
    
    return fromString(data, dir, dirRelative, options);
};

