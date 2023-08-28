import {promisify} from 'node:util';

export const readStd = async (text) => {
    if (globalThis.Deno)
        return await denoReadStd();
    
    return await nodeReadStd();
};

export const nodeReadStd = promisify((callback) => {
    const {stdin} = process;
    let chunks = '';
    
    const read = () => {
        const chunk = stdin.read();
        
        if (chunk)
            return chunks += chunk;
        
        stdin.removeListener('readable', read);
        callback(null, chunks);
    };
    
    stdin.setEncoding('utf8');
    stdin.addListener('readable', read);
});

export const denoReadStd = async () => {
    console.log('zzzz');
    let chunks = '';
    
    const decoder = new TextDecoder();
    
    for await (const chunk of Deno.stdin.readable) {
        console.log(chunk);
      chunks += decoder.decode(chunk);
    }
    
    console.log('yyy');
    
    return chunks;
}

