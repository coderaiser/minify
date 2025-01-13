import assert from 'node:assert';
/**
 * minify js source.
 *
 * @param source
 * @param userOptions - (optional) object that may contain a `js` key with an object of options
 */
import {minify} from '@putout/minify';

/**
 * minify js source.
 *
 * @param source
 * @param userOptions - (optional) object that may contain a `js` key with an object of options
 */
export default async (source, userOptions) => {
    assert(source);
    
    const options = userOptions?.js || {};
    
    if (options.type === 'terser') {
        const {terser} = options;
        const {minify} = await import('terser');
        const {code} = await minify(source, terser);
        
        return code;
    }
    
    if (options.type === 'esbuild') {
        const {esbuild} = options;
        const {transform} = await import('esbuild');
        const {code} = await transform(source, {
            minifyWhitespace: true,
            minifyIdentifiers: true,
            minifySyntax: true,
            ...esbuild,
        });
        
        return code;
    }
    
    if (options.type === 'swc') {
        const {minify} = await import('@swc/core');
        const {code} = await minify(source, {
            mangle: true,
            module: true,
            ...options.swc,
        });
        
        return code;
    }
    
    return await minify(source, options.putout);
};
