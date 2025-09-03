import { time } from 'console';
import { Builder } from '../../src/lib/builder/Builder';
import { describe, expect, it, afterEach } from 'vitest';
import path from 'path';
import fs from 'fs';

function loadFile(filePath: string) {
    const absolutePath = path.resolve(process.cwd(), filePath);
    if (fs.existsSync(absolutePath)) {
        return fs.readFileSync(absolutePath, 'utf-8');
    }
    return '';
}

const defaultPaths = [
    '--input',
    'tests/fixtures/basic-project/src/index.ts',
    '--output',
    'tests/fixtures/basic-project/dist/index.js'
];
describe('Builder', () => {
    // afterEach(() => {
    //     // Clean up the output directory after each test
    //     const outputDir = 'tests/fixtures/basic-project/dist';
    //     process.argv = ['node', 'script.js', 'clean', '--output', outputDir];
    //     const builder = new Builder();
    //     builder.run().then(() => {
    //         console.log('Output directory cleaned up.');
    //     });
    // });
    it('should create an instance of Builder', () => {
        const builder = new Builder();
        expect(builder).toBeInstanceOf(Builder);
    });

    it('should run the build process without errors', async () => {
        process.argv = ['node', 'script.js', ...defaultPaths];

        try {
            const builder = new Builder();
            process.argv = ['node', 'script.js', ...defaultPaths];
            await builder.run();
        } catch (error: any) {
            console.error('Error in build process:', error);
        }
    });

    it('should run the build process with watch mode', async () => {
        process.argv = ['node', 'script.js', ...defaultPaths, '--watch', 'true', '--mode', 'development'];
        const builder = new Builder();
        const watcher = await builder.run();
    });

    it('should run the build process with test mode', async () => {
        process.argv = ['node', 'script.js', 'test', '--input', 'tests/fixtures/basic-project/tests/index.test.ts'];
        const builder = new Builder();
        await builder.run();
    });

    it('should minimize the output', async () => {
        process.argv = [
            'node',
            'script.js',
            '--input',
            'tests/fixtures/basic-project/src/underscore.ts',
            '--minify',
            'true',
            '--output',
            'tests/fixtures/basic-project/dist/minified/index.js'
        ];
        const builder = new Builder();
        await builder.run();
        const buildFile = loadFile('tests/fixtures/basic-project/dist/minified/index.js');
        const checkFile = loadFile('tests/fixtures/outputs/index-mini.js');
        const uglyFile = loadFile('tests/fixtures/outputs/index-ugly.js');
        const miniFile = loadFile('tests/fixtures/outputs/index-mini.js');
        expect(buildFile).toBe(checkFile);
        expect(buildFile).toBe(miniFile);
        expect(buildFile).not.toBe(uglyFile);
    });
    it('should uglify the output', async () => {
        process.argv = [
            'node',
            'script.js',
            '--input',
            'tests/fixtures/basic-project/src/underscore.ts',
            '--uglify',
            'true',
            '--output',
            'tests/fixtures/basic-project/dist/uglyfied/index.js'
        ];
        const builder = new Builder();
        await builder.run();
        const buildFile = loadFile('tests/fixtures/basic-project/dist/uglyfied/index.js');
        const checkFile = loadFile('tests/fixtures/outputs/index-ugly.js');
        const miniFile = loadFile('tests/fixtures/outputs/index-mini.js');
        const uglyFile = loadFile('tests/fixtures/outputs/index-ugly.js');
        expect(buildFile).toBe(checkFile);
        expect(buildFile).toBe(uglyFile);
        expect(buildFile).not.toBe(miniFile);
    });
    it('should build with custom config', async () => {
        process.argv = [
            'node',
            'script.js',
            'my-ae-preset',
            '--config-path',
            'tests/fixtures/basic-project/kt.config.json'
        ];
        const builder = new Builder();
        try {
            await builder.run();
        } catch (error: any) {
            console.error('Error in build process:', error);
        }
        expect(fs.existsSync('tests/fixtures/basic-project/dist/my-custom-ae-output/index.js')).toBe(true);
    });
    it('should chain builds', async () => {
        process.argv = [
            'node',
            'script.js',
            'my-custom-preset',
            'my-ae-preset',
            '--config-path',
            'tests/fixtures/basic-project/kt.config.json'
        ];
        const builder = new Builder();
        try {
            await builder.run();
        } catch (error: any) {
            console.error('Error in build process:', error);
        }
        expect(fs.existsSync('tests/fixtures/basic-project/dist/my-custom-preset/index.js')).toBe(true);
        expect(fs.existsSync('tests/fixtures/basic-project/dist/my-custom-ae-output/index.js')).toBe(true);
    });

    it('should clean only the output directory', async () => {
        process.argv = ['node', 'script.js', ...defaultPaths];
        const builder = new Builder();
        await builder.run();
        const checkFile = loadFile('tests/fixtures/outputs/index.js');
        const buildFile = loadFile('tests/fixtures/basic-project/dist/index.js');
        expect(buildFile).toBe(checkFile);

        process.argv = ['node', 'script.js', 'clean', '--output', 'tests/fixtures/basic-project/dist'];
        const builder2 = new Builder();
        await builder2.run();
        const cleanFile = loadFile('tests/fixtures/basic-project/dist/index.js');
        expect(fs.existsSync(cleanFile)).toBe(false);
    });
});
