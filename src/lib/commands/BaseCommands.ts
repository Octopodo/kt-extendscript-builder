import { BuildOptions } from '../../types';
import { Command } from './Command';
import { presets } from '../options/optionsPresets';

/**
 * Base class for simple commands that just apply options
 */
export abstract class BaseCommand implements Command {
    constructor(
        public readonly name: string,
        public readonly description: string,
        public readonly options: Partial<BuildOptions>
    ) {}

    execute(currentOptions: Partial<BuildOptions>): Partial<BuildOptions> {
        // Combine current options with this command's options
        return {
            ...currentOptions,
            ...this.options
        };
    }
}

/**
 * Command for building with default settings
 */
class DefaultCommand extends BaseCommand {
    constructor() {
        super('default', 'Build with default production settings', presets.default);
    }
}

class BuildCommand extends BaseCommand {
    constructor() {
        super('build', 'Build with production settings', presets.build);
    }
}

/**
 * Command for building in development mode with watch
 */
class DevCommand extends BaseCommand {
    constructor() {
        super('dev', 'Build in development mode with watch enabled', presets.dev);
    }
}

/**
 * Command for building tests
 */
class TestCommand extends BaseCommand {
    constructor() {
        super('test', 'Build and run tests', presets.test);
    }
}

/**
 * Command for building with minification
 */
class MinifyCommand extends BaseCommand {
    constructor() {
        super('minify', 'Build with minification enabled', {
            ...presets.build,
            minify: true
        });
    }
}

/**
 * Command for building with uglification
 */
class UglifyCommand extends BaseCommand {
    constructor() {
        super('uglify', 'Build with uglification enabled', {
            ...presets.build,
            uglify: true
        });
    }
}

export class TestsBuildCommand extends BaseCommand {
    constructor() {
        super('tests-build', 'Build for testing the extendscript builder', {
            ...presets.build,
            input: 'tests/fixtures/basic-project/src/index.ts',
            output: 'tests/fixtures/basic-project/dist/index.js',
            test: true
        });
    }
}

export class TestsBuildTestsCommand extends BaseCommand {
    constructor() {
        super('tests-build-tests', 'Build for testing the tests builds of extendscript builder', {
            ...presets.build,
            input: 'tests/fixtures/basic-project/tests/index.test.ts',
            output: 'tests/fixtures/basic-project/dist.test/index.test.js',
            test: true
        });
    }
}

/**
 * Command to build for a specific Adobe application
 */
export class AdobeAppCommand extends BaseCommand {
    constructor(appName: string, version: string) {
        super(`${appName.toLowerCase()}-${version}`, `Build for ${appName} version ${version}`, {
            ...presets.build,
            'dest-app': appName,
            'app-version': version
        });
    }
}

export const baseCommands = [DefaultCommand, BuildCommand, DevCommand, TestCommand, MinifyCommand, UglifyCommand];
