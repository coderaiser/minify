function processOptions(cliOptions) {
    const options = {};
    const files = [];

    cliOptions.forEach((option) => {
        const [key, val] = option.split('=');
        switch (key) {
            case '--html-options':
                options['html'] = JSON.parse(val);
                break;
            case '--img-options':
                options['img'] = JSON.parse(val);
                break;
            case '--js-options':
                options['js'] = JSON.parse(val);
                break;
            case '--css-options':
                options['css'] = JSON.parse(val);
                break;
            default:
                files.push(option)
        }
    })
    return [files, options];
}

module.exports = processOptions;
