import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Cleaner } from '../../src/lib/builder/Cleaner';
import * as fs from 'fs';
import * as path from 'path';
import { BuildOptions } from '../../src/types';
import { mkdir, writeFile, rm } from 'fs/promises';

describe('Cleaner', () => {
    // Temporary directory for tests
    const tempDir = path.resolve(process.cwd(), 'tests/fixtures/temp-cleaner-tests');
    let options: Partial<BuildOptions>;

    // Save console messages for later review
    let consoleMessages = {
        logs: [] as string[],
        warnings: [] as string[],
        errors: [] as string[]
    };

    // Original console functions
    const originalConsole = {
        log: console.log,
        warn: console.warn,
        error: console.error
    };

    // Helper function to create files and directories
    async function createTestFile(filePath: string, content: string = 'test content'): Promise<void> {
        const dir = path.dirname(filePath);
        await mkdir(dir, { recursive: true });
        await writeFile(filePath, content);
    }

    beforeEach(async () => {
        // Clear previous console messages
        consoleMessages = { logs: [], warnings: [], errors: [] };

        // Temporarily override console to capture messages
        console.log = (message: string) => {
            consoleMessages.logs.push(message);
        };
        console.warn = (message: string) => {
            consoleMessages.warnings.push(message);
        };
        console.error = (message: string) => {
            consoleMessages.errors.push(message);
        };

        // Create temporary directory for tests
        await mkdir(tempDir, { recursive: true });

        // Create basic structure for tests
        await createTestFile(path.join(tempDir, 'index.js'));
        await createTestFile(path.join(tempDir, 'index.js.map'));
        await mkdir(path.join(tempDir, 'subfolder'), { recursive: true });
        await createTestFile(path.join(tempDir, 'subfolder', 'test.js'));

        // Default options
        options = {
            output: path.join(tempDir, 'index.js')
        };
    });

    afterEach(async () => {
        // Restore original console functions
        console.log = originalConsole.log;
        console.warn = originalConsole.warn;
        console.error = originalConsole.error;

        // Clean temporary directory
        try {
            await rm(tempDir, { recursive: true, force: true });
        } catch (err) {
            originalConsole.error('Error cleaning temporary directory:', err);
        }
    });

    it('should not clean when output is not specified', async () => {
        // Prepare
        options.output = undefined;

        // Execute
        await Cleaner.cleanDist(options);

        // Verify
        expect(consoleMessages.warnings.some((m) => m.includes('No output file specified'))).toBe(true);
    });

    it('should clean a specific file when it exists', async () => {
        // Prepare
        const targetFile = path.join(tempDir, 'index.js');
        options.output = targetFile;

        // Verify that the file exists before cleaning
        expect(fs.existsSync(targetFile)).toBe(true);

        // Execute
        await Cleaner.cleanDist(options);

        // Verify
        expect(fs.existsSync(targetFile)).toBe(false);
        expect(fs.existsSync(path.join(tempDir, 'index.js.map'))).toBe(true);
        expect(consoleMessages.logs.some((m) => m.includes('File cleaned'))).toBe(true);
    });

    it('should  not clean all files in the directory when the specific file does not exist', async () => {
        // Prepare
        options.output = path.join(tempDir, 'non-existent-file.js');

        // Execute
        await Cleaner.cleanDist(options);

        // Verify
        expect(fs.existsSync(tempDir)).toBe(true);
        const remainingFiles = await fs.promises.readdir(tempDir);
        expect(remainingFiles.length).toBe(3);
        expect(consoleMessages.logs.some((m) => m.includes('Directory cleaned'))).toBe(false);
    });

    it('should not clean protected directories', async () => {
        // Prepare - create a protected directory
        const srcDir = path.join(tempDir, 'src');
        await mkdir(srcDir, { recursive: true });
        await createTestFile(path.join(srcDir, 'test.js'));

        options.output = srcDir;

        // Execute
        await Cleaner.cleanDist(options);

        // Verify
        expect(fs.existsSync(srcDir)).toBe(true);
        expect(fs.existsSync(path.join(srcDir, 'test.js'))).toBe(true);
        expect(consoleMessages.errors.some((m) => m.includes('protected project directory'))).toBe(true);
    });

    it('should skip protected folders during cleaning', async () => {
        // Prepare - create a protected subfolder
        const nodeModulesDir = path.join(tempDir, 'node_modules');
        await mkdir(nodeModulesDir, { recursive: true });
        await createTestFile(path.join(nodeModulesDir, 'package.js'));

        options.output = path.join(tempDir, 'non-existent-file.js');

        // Execute
        await Cleaner.cleanDist(options);

        // Verify
        expect(fs.existsSync(nodeModulesDir)).toBe(true);
        expect(fs.existsSync(path.join(nodeModulesDir, 'package.js'))).toBe(true);
    });
});
