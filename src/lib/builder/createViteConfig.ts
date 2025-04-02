import { defineConfig, UserConfig } from 'vite';
import * as nodePath from 'path'; // Modified import to avoid conflicts
import { BuildOptions, ExtendedViteConfig } from '../../types';

export function createViteConfig(options: Partial<BuildOptions> = {}): ExtendedViteConfig {
    const watch = options.watch;
    const input = options.input as string;
    const output = options.output as string;
    const minify = options.minify;
    const inputFileName = nodePath.basename(input);
    const inputExt = nodePath.extname(input);
    const inputName = inputFileName.replace(inputExt, '');

    const outDir = nodePath.dirname(output);
    const config: ExtendedViteConfig = {
        build: {
            minify: minify,
            watch: watch ? {} : null,
            rollupOptions: {
                input,
                output: {
                    entryFileNames: `${inputName}.js`,
                    dir: outDir
                }
            }
        }
    };

    return config;
}
