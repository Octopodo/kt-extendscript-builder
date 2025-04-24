import { describe, it, expect } from 'vitest';
import { OptionsResolver } from '../../src/lib/options/OptionsResolver';
import { OptionsParser } from '../../src/lib/options/OptionsParser';
import { defaultBuildOptions } from '../../src/types';

describe('OptionsResolver', () => {
    it('should use default build options when no arguments are provided', () => {
        const resolver = new OptionsResolver();

        process.argv = ['node', 'script.js'];

        const resolvedOptions = resolver.resolve();
        expect(resolvedOptions).toMatchObject(defaultBuildOptions);
    });

    it('should prioritize CLI arguments over config file arguments when priority is cli', () => {
        const resolver = new OptionsResolver();

        process.argv = ['node', 'script.js', '--input', 'cli-input.ts', '--priority', 'cli'];

        const configFileArgs = {
            input: 'config-input.ts'
        };

        const resolvedOptions = resolver.resolve();

        expect(resolvedOptions.input).toBe('cli-input.ts');
    });

    it('should prioritize config file arguments over CLI arguments when priority is config', () => {
        const resolver = new OptionsResolver();
        const command = 'my-custom-preset';
        process.argv = [
            'node',
            'script.js',
            command,
            '--input',
            'cli-input.ts',
            '--priority',
            'config',
            '--config-file',
            'tests/fixtures/basic-project/kt.config.json'
        ];
        const configFileArgs = {
            input: 'config-input.ts'
        };

        const resolvedOptions = resolver.resolve(command);

        expect(resolvedOptions.input).toBe('src/tests/fixtures/basic-project/dist/my-custom-preset/index.ts');
    });

    it('should preserve test mode from CLI arguments', () => {
        const resolver = new OptionsResolver();

        process.argv = ['node', 'script.js', '--test'];
        const resolvedOptions = resolver.resolve();

        expect(resolvedOptions.test).toBe(true);
    });

    it('should apply mode rules to the resolved options', () => {
        const resolver = new OptionsResolver();

        process.argv = ['node', 'script.js', '--mode', 'production'];

        const resolvedOptions = resolver.resolve();

        // modeRule should set watch to false for production mode
        expect(resolvedOptions.watch).toBe(false);
        expect(resolvedOptions.test).toBe(false);
    });

    it('should fallback to default preset for unknown preset names', () => {
        const resolver = new OptionsResolver();
        const defOpts = defaultBuildOptions;

        process.argv = ['node', 'script.js', '--preset', 'non-existent-preset'];

        const resolvedOptions = resolver.resolve();

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
