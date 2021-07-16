const processOptions = require('../lib/processOptions');
const test = require('supertape');

test('processOptions', (t) => {
    const testOptions = [
        'hello.js',
        'src/public/index.html',
        '--html-options={\"htmlOptionMock\": \"htmlValueMock\"}',
        '--js-options={\"jsOptionMock\": \"jsValueMock\"}',
        '--css-options={\"cssOptionMock\": \"cssValueMock\"}',
        '--img-options={\"imgOptionMock\": \"imgValueMock\"}',
    ]
    const [files, options] = processOptions(testOptions);
    t.deepEqual(files, ['hello.js',
        'src/public/index.html']);
    t.deepEqual(options,  {
        "css":  {
            "cssOptionMock": "cssValueMock",
        },
        "html":  {
            "htmlOptionMock": "htmlValueMock",
        },
        "img":  {
            "imgOptionMock": "imgValueMock",
        },
        "js":  {
            "jsOptionMock": "jsValueMock",
        },
    })
})

test('processOptions doesnt fail with empty input', (t) => {
    const testOptions = []
    const [files, options] = processOptions(testOptions);
    t.deepEqual(files, []);
    t.deepEqual(options, {})
})
