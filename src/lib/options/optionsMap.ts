import { Options } from 'yargs';

export const buildOptions = [
    {
        name: 'input',
        alias: 'i',
        type: 'string',
        description: 'Input file'
        // default: 'src/index.ts'
    },
    {
        name: 'output',
        alias: 'o',
        type: 'string',
        description: 'Output file path'
        // default: 'dist/index.js'
    }
] as const;

export const typescriptOptions = [
    {
        name: 'tsconfig',
        alias: 'ts',
        type: 'string',
        description: 'Path to tsconfig file'
    },
    {
        name: 'tsconfig-test-path',
        alias: ['tt', 'tsconfigTestPath'],
        type: 'string',
        description: 'Path to tsconfig test file'
    },
    {
        name: 'tsconfig-template',
        alias: ['u', 'tsconfigTemplate'],
        type: 'boolean',
        description: 'Use template tsconfig instead of custom'
        // default: false
    }
] as const;

export const processorOptions = [
    {
        name: 'test',
        alias: 't',
        type: 'boolean',
        description: 'Build test files'
    },
    {
        name: 'watch',
        alias: 'w',
        type: 'boolean',
        description: 'Enable watch mode'
        // default: false
    },
    {
        name: 'mode',
        alias: 'm',
        type: 'string',
        description: 'Build mode (production or development)',
        default: 'production',
        choices: ['production', 'development']
    },
    {
        name: 'minify',
        alias: 'min',
        type: 'boolean',
        description: 'Enable minification',
        default: false
    }
] as const;

export const preprocessorOptions = [
    {
        name: 'ponyfills',
        alias: 'p',
        type: 'array',
        description: 'Custom ponyfills file paths'
    }
] as const;

export const postprocessorOptions = [
    {
        name: 'clean',
        alias: 'c',
        type: 'boolean',
        description: 'Clean output directory before build'
        // default: true
    },
    {
        name: 'uglify',
        alias: 'ug',
        type: 'boolean',
        description: 'Enable uglification of the output file'
    }
] as const;

export const configOptions = [
    {
        name: 'config-file',
        alias: ['f', 'configFile', 'config-path'],
        type: 'string',
        description: 'Path to config file',
        default: 'kt.config.json'
    },
    {
        name: 'priority',
        alias: 'pr',
        type: 'string',
        description: 'Priority of the configuration source',
        choices: ['CLI', 'cli', 'config'],
        default: 'cli'
    },
    {
        name: 'preset',
        alias: 's',
        type: 'string',
        description: 'Configuration preset'
    }
] as const;

export const adobeOptions = [
    {
        name: 'dest-app',
        alias: ['d', 'destApp'],
        type: 'string',
        description: 'Adobe application for deployment'
    },
    {
        name: 'app-version',
        alias: ['v', 'appVersion'],
        type: 'string',
        description: 'Adobe application version'
    }
] as const;
