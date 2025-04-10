import { time } from 'console';
import { Builder } from '../../src/lib/builder/Builder';
import { describe, expect, it } from 'vitest';
import path from 'path';
import fs from 'fs';
import { CommandRegistry } from '../../src/lib/commands/CommandRegistry';
import { TestsBuildCommand, TestsBuildTestsCommand } from '../../src/lib/commands/BaseCommands';
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
            'tests/fixtures/basic-project/src/index.ts',
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
        expect(buildFile).toBe(checkFile);
        expect(buildFile).not.toBe(uglyFile);
    });
    it('should uglify the output', async () => {
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
        const builder = new Builder();
        await builder.run();
        const buildFile = loadFile('tests/fixtures/basic-project/dist/uglyfied/index.js');
        const checkFile = loadFile('tests/fixtures/outputs/index-ugly.js');
        const miniFile = loadFile('tests/fixtures/outputs/index-mini.js');
        expect(buildFile).toBe(checkFile);
        expect(buildFile).not.toBe(miniFile);
    });
    it('should build with custom config', async () => {
        process.argv = [
            'node',
            'script.js',
            '--config-path',
            'tests/fixtures/basic-project/kt.config.json',
            '--preset',
            'my-ae-preset'
        ];
        const builder = new Builder();
        await builder.run();
        expect(fs.existsSync('tests/fixtures/basic-project/dist/my-custom-ae-output/index.js')).toBe(true);
    });
    it('should chain builds', async () => {
        process.argv = [
            'node',
            'script.js',
            'tests-build',
            'tests-build-tests',
            '--config-file',
            'tests/fixtures/basic-project/kt.config.json'
        ];
        const commandRegistry = new CommandRegistry();
        commandRegistry.registerCommand(new TestsBuildCommand());
        commandRegistry.registerCommand(new TestsBuildTestsCommand());
        const builder = new Builder(commandRegistry);
        await builder.run();
        const buildFile = loadFile('tests/fixtures/basic-project/dist/index.js');
        const testFile = loadFile('dist.test/index.test.js');
    });
});
