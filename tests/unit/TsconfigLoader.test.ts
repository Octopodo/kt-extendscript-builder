import { TsconfigLoader } from '../../src/lib/config/TsconfigLoader';
import { OptionsParser } from '../../src/lib/options/OptionsParser';
import { describe, expect, it, beforeEach } from 'vitest';

describe('TsconfigLoader', () => {
    let loader: TsconfigLoader;
    let parser: OptionsParser;

    beforeEach(() => {
        loader = new TsconfigLoader();
        parser = new OptionsParser();
        process.argv = ['node', 'script.js', '--tsconfig', 'tests/fixtures/basic-project/tsconfig.json'];
    });
    it('should always load tsconfig', () => {
        const options = parser.parse();
        const tsconfig = loader.load(options);
        expect(tsconfig).toBeDefined();
    });
    it('should prioritize template', () => {
        process.argv.push('--tsconfig-template', 'true', '--test', 'true');
        const includes = ['src/**/*', 'src/tests/**/*'];
        const options = parser.parse();
        const tsconfig = loader.load(options);
        expect(tsconfig).toBeDefined();
        expect(tsconfig.include).toBeDefined();
        expect(tsconfig.include).toEqual(includes);
    });

    it('should load tsconfig with custom path', () => {
        process.argv = ['node', 'script.js', '--tsconfig', 'tests/fixtures/basic-project/tsconfig.custom.json'];

        const options = parser.parse();
        const tsconfig = loader.load(options);
        expect(tsconfig).toBeDefined();
        expect(tsconfig.compilerOptions).toBeDefined();
        expect(tsconfig.compilerOptions.outDir).toBe('./customDir');
        expect(tsconfig.compilerOptions.rootDir).toBe('./customRoot');
        expect(tsconfig.compilerOptions.types).toEqual(['custom-types']);
    });
});
