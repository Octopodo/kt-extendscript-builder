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
        alias: 't',
        type: 'string',
        description: 'Path to tsconfig file'
    },
    {
        name: 'tsconfig-test-path',
        alias: 'tt',
        type: 'string',
        description: 'Path to tsconfig test file'
    },
    {
        name: 'tsconfig-template',
        alias: 'u',
        type: 'boolean',
        description: 'Use template tsconfig instead of custom'
        // default: false
    }
] as const;

export const processorOptions = [
    {
        name: 'test',
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
    }
] as const;

export const configOptions = [
    {
        name: 'config-file',
        alias: 'f',
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
        alias: 'd',
        type: 'string',
        description: 'Adobe application for deployment'
    },
    {
        name: 'app-version',
        alias: 'v',
        type: 'string',
        description: 'Adobe application version'
    }
] as const;
