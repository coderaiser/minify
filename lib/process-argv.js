const SIZE_OF_FILE = 'file://'.length;
const fromFileUrl = (a) => a.slice(SIZE_OF_FILE);
const {assing} = Object;


processArgv();

export function processArgv() {
    if (!globalThis || !globalThis.process?.argv) {
        globalThis.process = globalThis.process || {}
        
        assign(globalThis.process, {
            argv: [
                Deno.execPath(),
                fromFileUrl(Deno.mainModule),
                ...Deno.args,
            ]
        });
    }
}

