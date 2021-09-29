import {readFileSync} from 'fs';
import findUp from 'find-up';

async function findOptionsFromFile({readFile = readFileSync, findOptionsFile = findUp} = {}) {
    const filePath = await findOptionsFile('.minify.json');
    
    if (filePath) {
        try {
            return {options: JSON.parse(readFile(filePath))};
        } catch(err) {
            return {
                error: Error(`Options file at ${filePath} could not be parsed with error\n${err.message}`),
            };
        }
    }
    
    return {options: {}};
}

export default findOptionsFromFile;
