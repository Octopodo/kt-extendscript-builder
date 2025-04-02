import { describe, it, expect } from 'vitest';
import { OptionsResolver } from '../../src/lib/options/OptionsResolver';
import { OptionsParser } from '../../src/lib/options/OptionsParser';
import { defaultBuildOptions } from '../../src/types';

describe('OptionsResolver', () => {
    it('should use default build options when no arguments are provided', () => {
        const resolver = new OptionsResolver();
        const parser = new OptionsParser();
        process.argv = ['node', 'script.js'];

        const options = parser.parse();
        const resolvedOptions = resolver.resolve(options, {});
        expect(resolvedOptions).toMatchObject(defaultBuildOptions);
    });

    it('should apply preset options when preset is specified', () => {
        const resolver = new OptionsResolver();
        const parser = new OptionsParser();
        process.argv = ['node', 'script.js', '--preset', 'test'];

        const options = parser.parse();
        const resolvedOptions = resolver.resolve(options, {});

        expect(resolvedOptions.test).toBe(true);
        // expect(resolvedOptions.input).toContain('test');
        expect(resolvedOptions.output).toContain('test');
    });

    it('should prioritize CLI arguments over config file arguments when priority is cli', () => {
        const resolver = new OptionsResolver();
        const parser = new OptionsParser();
        process.argv = ['node', 'script.js', '--input', 'cli-input.ts', '--priority', 'cli'];

        const options = parser.parse();
        const configFileArgs = {
            input: 'config-input.ts'
        };

        const resolvedOptions = resolver.resolve(options, configFileArgs);

        expect(resolvedOptions.input).toBe('cli-input.ts');
    });

    it('should prioritize config file arguments over CLI arguments when priority is config', () => {
        const resolver = new OptionsResolver();
        const parser = new OptionsParser();
        process.argv = ['node', 'script.js', '--input', 'cli-input.ts', '--priority', 'config'];

        const options = parser.parse();
        const configFileArgs = {
            input: 'config-input.ts'
        };

        const resolvedOptions = resolver.resolve(options, configFileArgs);

        expect(resolvedOptions.input).toBe('config-input.ts');
    });

    it('should preserve test mode from CLI arguments', () => {
        const resolver = new OptionsResolver();
        const parser = new OptionsParser();
        process.argv = ['node', 'script.js', '--test'];

        const options = parser.parse();
        const configFileArgs = { test: false };

        const resolvedOptions = resolver.resolve(options, configFileArgs);

        expect(resolvedOptions.test).toBe(true);
    });

    it('should apply mode rules to the resolved options', () => {
        const resolver = new OptionsResolver();
        const parser = new OptionsParser();
        process.argv = ['node', 'script.js', '--mode', 'production'];

        const options = parser.parse();
        const resolvedOptions = resolver.resolve(options, {});

        // modeRule should set watch to false for production mode
        expect(resolvedOptions.watch).toBe(false);
        expect(resolvedOptions.test).toBe(false);
    });

    it('should merge options from multiple sources', () => {
        const resolver = new OptionsResolver();
        const parser = new OptionsParser();
        process.argv = ['node', 'script.js', '--input', 'cli-input.ts', '--preset', 'test', '--mode', 'development'];

        const options = parser.parse();
        const configFileArgs = {
            output: 'config-output.js',
            'dest-app': 'Photoshop'
        };

        const resolvedOptions = resolver.resolve(options, configFileArgs);

        expect(resolvedOptions.input).toBe('cli-input.ts');
        expect(resolvedOptions.output).toBe('config-output.js');
        expect(resolvedOptions['dest-app']).toBe('Photoshop');
        expect(resolvedOptions.mode).toBe('development');
        expect(resolvedOptions.test).toBe(true);
        expect(resolvedOptions.watch).toBe(true);
    });

    it('should fallback to default preset for unknown preset names', () => {
        const resolver = new OptionsResolver();
        const defOpts = defaultBuildOptions;
        const parser = new OptionsParser();
        process.argv = ['node', 'script.js', '--preset', 'non-existent-preset'];

        const options = parser.parse();
        const resolvedOptions = resolver.resolve(options, {});

        // Should use default preset values
        expect(resolvedOptions.input).toBe('src/index.ts');
        expect(resolvedOptions.output).toBe('dist/index.js');
        expect(resolvedOptions.test).toBe(false);
        expect(resolvedOptions.watch).toBe(false);
        expect(resolvedOptions.mode).toBe('production');
        expect(resolvedOptions['dest-app']).toBeUndefined();
        expect(resolvedOptions['app-version']).toBeUndefined();
        expect(resolvedOptions['ponyfills']).toBeUndefined();
    });
});
