import { describe, expect, it, beforeEach } from 'vitest';
import { CommandRegistry } from '../../src/lib/commands/CommandRegistry';
import { Command } from '../../src/lib/commands/Command';
import { baseCommands as commands } from '../../src/lib/commands/BaseCommands';
import path from 'path';
import fs from 'fs';

function loadFile(filePath: string) {
    const absolutePath = path.resolve(process.cwd(), filePath);
    if (fs.existsSync(absolutePath)) {
        return fs.readFileSync(absolutePath, 'utf-8');
    }
    return '';
}

describe('Command Pattern Integration', () => {
    let registry: CommandRegistry;

    beforeEach(() => {
        registry = new CommandRegistry();
        // Register predefined commands from the imported base commands
        for (const command of commands) {
            registry.registerCommand(new command());
        }
    });

    it('should register and retrieve commands correctly', () => {
        expect(registry.getAllCommands().length).toBe(6);
        expect(registry.hasCommand('default')).toBe(true);
        expect(registry.hasCommand('dev')).toBe(true);
        expect(registry.hasCommand('test')).toBe(true);
        expect(registry.hasCommand('minify')).toBe(true);
        expect(registry.hasCommand('uglify')).toBe(true);
        expect(registry.hasCommand('non-existent')).toBe(false);
    });

    it('should execute default command correctly', () => {
        const initialOptions = {};
        const modifiedOptions = registry.executeCommand('default', initialOptions);

        // Verify that default options have been applied
        expect(modifiedOptions).toHaveProperty('input');
        expect(modifiedOptions).toHaveProperty('output');
        expect(modifiedOptions).toHaveProperty('mode', 'production');
    });

    it('should execute dev command correctly', () => {
        const initialOptions = {};
        const modifiedOptions = registry.executeCommand('dev', initialOptions);

        // Verify that dev options have been applied
        expect(modifiedOptions).toHaveProperty('watch', false);
        expect(modifiedOptions).toHaveProperty('mode', 'development');
    });

    it('should execute test command correctly', () => {
        const initialOptions = {};
        const modifiedOptions = registry.executeCommand('test', initialOptions);

        // Verify that test options have been applied
        expect(modifiedOptions).toHaveProperty('test', true);
    });

    it('should execute minify command correctly', () => {
        const initialOptions = {};
        const modifiedOptions = registry.executeCommand('minify', initialOptions);

        // Verify that minify option has been applied
        expect(modifiedOptions).toHaveProperty('minify', true);
    });

    it('should execute uglify command correctly', () => {
        const initialOptions = {};
        const modifiedOptions = registry.executeCommand('uglify', initialOptions);

        // Verify that uglify option has been applied
        expect(modifiedOptions).toHaveProperty('uglify', true);
    });

    it('should return original options when trying to execute a non-existent command', () => {
        const initialOptions = { input: 'test-file.ts' };
        const modifiedOptions = registry.executeCommand('non-existent', initialOptions);

        // Verify that original options are returned unchanged
        expect(modifiedOptions).toEqual(initialOptions);
    });

    it('should allow command chaining', () => {
        // Simulate command chaining as would be done on command line
        let options = {};

        options = registry.executeCommand('default', options);
        options = registry.executeCommand('test', options);

        // Verify that we have a combination of options from both commands
        expect(options).toHaveProperty('mode', 'development');
        expect(options).toHaveProperty('test', true);
    });

    it('should create custom commands', () => {
        // Create a custom command for a specific case
        class CustomCommand implements Command {
            readonly name = 'custom';
            readonly description = 'Custom command for testing';
            readonly options = {
                input: 'tests/fixtures/basic-project/src/index.ts',
                output: 'tests/fixtures/basic-project/dist/custom/index.js',
                customFlag: true
            };

            execute(currentOptions: any) {
                return { ...currentOptions, ...this.options };
            }
        }

        registry.registerCommand(new CustomCommand());
        expect(registry.hasCommand('custom')).toBe(true);

        const result = registry.executeCommand('custom', {});
        expect(result).toHaveProperty('customFlag', true);
        expect(result.input).toBe('tests/fixtures/basic-project/src/index.ts');
    });

    it('should respect option priority when commands are chained', () => {
        // The second command should overwrite options from the first
        const options1 = registry.executeCommand('default', {}); // mode: 'production'
        const options2 = registry.executeCommand('dev', options1); // mode: 'development'

        // Verify that the second command overwrote the mode
        expect(options2.mode).toBe('development');
    });
});
