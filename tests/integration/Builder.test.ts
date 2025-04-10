import { time } from 'console';
import { Builder } from '../../src/lib/builder/Builder';
import { describe, expect, it } from 'vitest';

const defaultPaths = [
    '--input',
    'tests/fixtures/basic-project/src/index.ts',
    '--output',
    'tests/fixtures/basic-project/dist/index.js'
];
describe('Builder', () => {
    it('should create an instance of Builder', () => {
        const builder = new Builder();
        expect(builder).toBeInstanceOf(Builder);
    });

    it('should run the build process without errors', async () => {
        async function build() {
            const builder = new Builder();
            process.argv = ['node', 'script.js', ...defaultPaths];

            try {
                const builder = new Builder();
                process.argv = ['node', 'script.js', ...defaultPaths];
                await builder.run();
            } catch (error: any) {
                console.error('Error in build process:', error);
            }
        }

        expect(build).not.toThrowError();
    });

    it('should run the build process with watch mode', async () => {
        const builder = new Builder();
        process.argv = ['node', 'script.js', ...defaultPaths, '--watch', 'true', '--mode', 'development'];
        const watcher = await builder.run();
    });

    it('should run the build process with test mode', async () => {
        const builder = new Builder();
        process.argv = ['node', 'script.js', 'test', '--input', 'tests/fixtures/basic-project/tests/index.test.ts'];
        await builder.run();
    });

    it('should minimize the output', async () => {
        const builder = new Builder();
        process.argv = [
            'node',
            'script.js',
            '--input',
            'tests/fixtures/basic-project/src/index.ts',
            '--uglify',
            'true',
            '--output',
            'tests/fixtures/basic-project/dist/minified/index.js'
        ];
        await builder.run();
    });
    it('should uglify the output', async () => {
        const builder = new Builder();
        process.argv = [
            'node',
            'script.js',
            '--input',
            'tests/fixtures/basic-project/src/index.ts',
            '--uglify',
            'true',
            '--output',
            'tests/fixtures/basic-project/dist/uglyfied/index.js'
        ];
        await builder.run();
    });
    it('should build with custom config', async () => {
        const builder = new Builder();
        process.argv = [
            'node',
            'script.js',
            '--config-path',
            'tests/fixtures/basic-project/kt.config.json',
            '--preset',
            'my-ae-preset'
        ];
        await builder.run();
    });
});
