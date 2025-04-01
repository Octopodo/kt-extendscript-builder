#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { buildExtendScript } from '../lib/builder';
import { BuildOptions } from '../lib/BuildOptions';
import path from 'path';
import fs from 'fs';
import { loadConfig } from '../lib/loadConfig';

// Interface for the configuration file
interface KTConfig {
    default?: Partial<BuildOptions>;
    [configName: string]: Partial<BuildOptions> | undefined;
}

// Process arguments with yargs
const argv = yargs(hideBin(process.argv))
    .option('input', {
        alias: 'i',
        type: 'string',
        description: 'Input file',
        default: 'src/index.ts'
    })
    .option('output', {
        alias: 'o',
        type: 'string',
        description: 'Output file path',
        default: 'dist/index.js'
    })
    .option('test', {
        alias: 't',
        type: 'boolean',
        description: 'Build tests',
        default: false
    })
    .option('watch', {
        alias: 'w',
        type: 'boolean',
        description: 'Watch mode',
        default: false
    })
    .option('mode', {
        alias: 'm',
        type: 'string',
        description: 'Build mode',
        default: 'production',
        choices: ['production', 'development'] as const
    })
    .option('tsconfig', {
        type: 'string',
        description: 'Path to tsconfig file'
    })
    .option('use-template', {
        type: 'boolean',
        description: 'Use tsconfig template included in the package',
        default: false
    })
    .option('clean', {
        alias: 'c',
        type: 'boolean',
        description: 'Clean output directory',
        default: true
    })
    .option('custom-ponyfills', {
        type: 'string',
        description: 'Path to a custom ponyfills file'
    })
    .option('dest-app', {
        type: 'string',
        description: 'Adobe app destination'
    })
    .option('app-version', {
        type: 'string',
        description: 'Adobe app version'
    })

    .help()
    .parseSync();

// Check if the first argument is a configuration name
const possibleConfigName = process.argv[2];
const isConfigName = possibleConfigName && !possibleConfigName.startsWith('-');

// Load configuration from file
const fileConfig = loadConfig(isConfigName ? possibleConfigName : undefined);

// Determine tsconfig (priority: CLI > config file > default test)
let tsconfigPath = fileConfig.tsconfig as string;
if (!tsconfigPath) {
    tsconfigPath = argv.tsconfig as string;
}
const isTestMode = argv.test === true;

// Modifica las rutas predeterminadas para tests
const defaultInput = isTestMode ? 'src/tests/index.test.ts' : 'src/index.ts';
const defaultOutput = isTestMode ? 'dist.test/index.test.js' : 'dist/index.js';

// Ajusta la prioridad en la sección de configuración
const buildOptions: BuildOptions = {
    // Cambia la prioridad - test tiene prioridad ABSOLUTA
    input: isTestMode
        ? defaultInput
        : fileConfig.input ?? (argv.input as string) ?? defaultInput,
    output: isTestMode
        ? defaultOutput
        : fileConfig.output ?? (argv.output as string) ?? defaultOutput,
    tsconfig: tsconfigPath,
    watch:
        fileConfig.watch ??
        (typeof argv.watch === 'boolean' ? argv.watch : false),
    mode:
        fileConfig.mode ??
        (argv.mode as 'production' | 'development') ??
        'production',
    clean:
        fileConfig.clean ??
        (typeof argv.clean === 'boolean' ? argv.clean : true),

    // Test tiene prioridad para la plantilla
    useTemplateTsconfig: isTestMode
        ? true
        : fileConfig.useTemplateTsconfig ??
          (typeof argv['use-template'] === 'boolean'
              ? argv['use-template']
              : false),

    customPonyfills:
        fileConfig.customPonyfills ?? (argv['custom-ponyfills'] as string),
    destApp: fileConfig.destApp ?? (argv['dest-app'] as string),
    appVersion: fileConfig.appVersion ?? (argv['app-version'] as string),
    test: isTestMode
};

console.log('Build configuration:', buildOptions);

// Build
buildExtendScript(buildOptions);
