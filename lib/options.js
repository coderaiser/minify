'use strict';

const { readFileSync } = require('fs');
const findUp = require('find-up');

const {parse} = JSON;

async function findOptionsFromFile({ readFileSync = readFileSync, findOptionsFile = findUp } = {}) {
    const filePath = await findOptionsFile('.minify.json');
    
    if (!filePath)
        return {};
    
    const data = readFileSync(filePath, 'utf8');
    
    return parse(data);
}

module.exports = {
    findOptionsFromFile,
};
