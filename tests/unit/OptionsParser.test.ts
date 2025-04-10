import { describe, it, expect } from 'vitest';
import { OptionsParser } from '../../src/lib/options/OptionsParser';

describe('OptionsParser', () => {
    describe('Parse method', () => {
        // Test 2: Verify that custom options are parsed correctly
        it('should correctly parse options passed as arguments', () => {
            process.argv = [
                'node',
                'script.js',
                '--input',
                'custom/input.ts',
                '--output',
                'custom/output.js',
                '--tsconfig',
                'tsconfig.custom.json',
                '--tsconfig-template',
                '--test',
                '--watch',
                '--mode',
                'development',
                '--ponyfills',
                'pony1.js',
                'pony2.js',
                '--clean',
                'false',
                '--config-file',
                'custom.config.json',
                '--priority',
                'config',
                '--preset',
                'custom',
                '--dest-app',
                'Photoshop',
                '--app-version',
                '2023'
            ];
            const options = OptionsParser.parse();
            // Verify that custom options have been parsed correctly
            expect(options.input).toBe('custom/input.ts');
            expect(options.output).toBe('custom/output.js');
            expect(options.tsconfig).toBe('tsconfig.custom.json');
            expect(options['tsconfig-template']).toBe(true);
            expect(options.test).toBe(true);
            expect(options.watch).toBe(true);
            expect(options.mode).toBe('development');
            expect(options.ponyfills).toEqual(['pony1.js', 'pony2.js']);
            expect(options.clean).toBe(false);
            expect(options['config-file']).toBe('custom.config.json');
            expect(options.priority).toBe('config');
            expect(options.preset).toBe('custom');
            expect(options['dest-app']).toBe('Photoshop');
            expect(options['app-version']).toBe('2023');
        });
    });
    describe('Filter method', () => {
        it('should filter out options that are not in the options map', () => {
            const options = {
                input: 'input.ts',
                output: 'output.js',
                extraOption: 'extraValue'
            };
            const filteredOptions = OptionsParser.filter(options);
            expect(filteredOptions).toEqual({
                input: 'input.ts',
                output: 'output.js'
            });
        });
    });
});
