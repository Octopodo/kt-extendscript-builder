import ts from 'typescript';
import { createViteConfig } from '../../src/lib/config/createViteConfig';
import { OptionsParser } from '../../src/lib/options/OptionsParser';

import { describe, expect, it } from 'vitest';

describe('Vite Configuration', () => {
    it('should create a Vite configuration object', () => {
        process.argv = ['node', 'script.js', '--input', 'src/index.ts', '--output', 'dist/index.js'];
        const options = OptionsParser.parse();

        const viteConfig = createViteConfig(options);
        expect(viteConfig).toBeDefined();
        expect(viteConfig.build).toBeDefined();
    });

    it('should set correct input and output paths in config', () => {
        process.argv = ['node', 'script.js', '--input', 'custom/source.ts', '--output', 'custom/output.js'];
        const options = OptionsParser.parse();

        const viteConfig = createViteConfig(options);
        expect(viteConfig.build?.minify).toBe(false);
        expect(viteConfig.build?.watch).toBe(null);
        expect(viteConfig.build?.rollupOptions?.input).toBe('custom/source.ts');
        //@ts-ignore
        expect(viteConfig.build?.rollupOptions?.output?.entryFileNames).toBe('source.js');
        //@ts-ignore
        expect(viteConfig.build?.rollupOptions?.output?.dir).toBe('custom');
    });

    it('should set watch mode correctly', () => {
        process.argv = ['node', 'script.js', '--input', 'src/index.ts', '--output', 'dist/index.js', '--watch'];
        const options = OptionsParser.parse();

        const viteConfig = createViteConfig(options);
        expect(viteConfig.build?.watch).toBeDefined();
    });
    it('should set minify option correctly', () => {
        process.argv = ['node', 'script.js', '--input', 'src/index.ts', '--output', 'dist/index.js', '--minify'];
        const options = OptionsParser.parse();

        const viteConfig = createViteConfig(options);
        expect(viteConfig.build?.minify).toBe(true);
    });
});
