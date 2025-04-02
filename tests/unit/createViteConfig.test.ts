import ts from 'typescript';
import { createViteConfig } from '../../src/lib/builder/createViteConfig';
import { OptionsParser } from '../../src/lib/options/OptionsParser';
import { OptionsResolver } from '../../src/lib/options/OptionsResolver';

import { describe, expect, it } from 'vitest';

describe('Vite Configuration', () => {
    it('should create a Vite configuration object', () => {
        const parser = new OptionsParser();
        const resolver = new OptionsResolver();
        process.argv = ['node', 'script.js', '--input', 'src/index.ts', '--output', 'dist/index.js'];
        const options = parser.parse();

        const viteConfig = createViteConfig(options);
        expect(viteConfig).toBeDefined();
        expect(viteConfig.build).toBeDefined();
    });

    it('should set correct input and output paths in config', () => {
        const parser = new OptionsParser();
        process.argv = ['node', 'script.js', '--input', 'custom/source.ts', '--output', 'custom/output.js'];
        const options = parser.parse();

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
        const parser = new OptionsParser();
        process.argv = ['node', 'script.js', '--input', 'src/index.ts', '--output', 'dist/index.js', '--watch'];
        const options = parser.parse();

        const viteConfig = createViteConfig(options);
        expect(viteConfig.build?.watch).toBeDefined();
    });
    it('should set minify option correctly', () => {
        const parser = new OptionsParser();
        process.argv = ['node', 'script.js', '--input', 'src/index.ts', '--output', 'dist/index.js', '--minify'];
        const options = parser.parse();

        const viteConfig = createViteConfig(options);
        expect(viteConfig.build?.minify).toBe(true);
    });
});
