import {minify} from '@putout/minify';
import assert from 'node:assert';

/**
 * minify js data.
 *
 * @param data
 * @param userOptions - (optional) object that may contain a `js` key with an object of options
 */
export default async (data, userOptions) => {
    assert(data);
    
    const options = userOptions?.js || {};
    
    return await minify(data, options);
};
