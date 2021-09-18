'use strict';

const { readFileSync } = require('fs');
const findUp = require('find-up');

async function findOptionsFromFile({ readFile = readFileSync, findOptionsFile = findUp } = {}) {
    const filePath = await findOptionsFile('.minify.json');

    const tryCatch = require('try-catch');
    const [error, options] = tryCatch(JSON.parse, readFile(filePath)); 
    if(error){
        return {error: new Error(`Options file at ${filePath} could not be parsed with error\n${err.message}`)};
    }
    return options;
}

module.exports = {
    findOptionsFromFile,
};
