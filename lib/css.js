/* сжимаем код через clean-css */
import assert from 'node:assert';
import Clean from 'clean-css';

/**
 * minify css data.
 *
 * @param data
 * @param userOptions - (optional) object that may contain a `css` key with an object of options
 */
export default async (data, userOptions) => {
    assert(data);
    
    const allOptions = userOptions?.css || {};
    const {type} = allOptions;
    
    if (type === 'clean-css') {
        const {styles, errors} = new Clean(allOptions['clean-css']).minify(data);
        const [error] = errors;
        
        if (error)
            throw error;
        
        return styles;
    }
    
    const {transform} = await import('lightningcss');
    
    const {code} = transform({
        code: Buffer.from(data),
        minify: true,
    });
    
    return String(code);
};
