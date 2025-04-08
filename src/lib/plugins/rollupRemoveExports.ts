export const rollupRemoveExports = () => ({
    name: 'remove-exports',

    generateBundle(options: any, bundle: any) {
        for (const fileName of Object.keys(bundle)) {
            const chunk = bundle[fileName];

            if (chunk.type === 'chunk') {
                // Modify the final file code

                chunk.code = chunk.code.replace(
                    /(^|\n)\s*export\s+(default\s+)?({[^}]+}|\w+\s*(=|\([^)]*\))?.*?(;|\n|$)|class\s+\w+\s*{[\s\S]*?}|\s*function\s+\w+\s*\([^)]*\)\s*{[\s\S]*?});/g,

                    '$1'
                );
            }
        }
    }
});
