#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { buildExtendScript } from '../lib/builder';
import { BuildOptions } from '../lib/BuildOptions';
import path from 'path';
import fs from 'fs';

// Interface for the configuration file
interface KTConfig {
  default?: Partial<BuildOptions>;
  [configName: string]: Partial<BuildOptions> | undefined;
}

// Function to read the configuration file
export function loadConfig(configName?: string): Partial<BuildOptions> {
  const configPath = path.join(process.cwd(), 'kt-config.json');

  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(
        fs.readFileSync(configPath, 'utf-8')
      ) as KTConfig;

      // If a configuration name was specified, use that configuration
      if (configName && config[configName]) {
        console.log(`Using configuration "${configName}" from kt-config.json`);
        return config[configName];
      }

      // If default configuration exists, use it
      if (config.default) {
        console.log('Using "default" configuration from kt-config.json');
        return config.default;
      }
    } catch (error) {
      console.error('Error reading kt-config.json file:', error);
    }
  }

  return {};
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
let tsconfigPath = argv.tsconfig as string;
if (!tsconfigPath && fileConfig.tsconfig) {
  tsconfigPath = fileConfig.tsconfig;
} else if (argv.test && !tsconfigPath) {
  tsconfigPath = 'tsconfig.tests.json';
}

// Combine configurations prioritizing configuration file over CLI
const buildOptions: BuildOptions = {
  input: fileConfig.input ?? (argv.input as string) ?? 'src/index.ts',
  output: fileConfig.output ?? (argv.output as string) ?? 'dist/index.js',
  tsconfig: tsconfigPath,
  watch:
    fileConfig.watch ?? (typeof argv.watch === 'boolean' ? argv.watch : false),
  mode:
    fileConfig.mode ??
    (argv.mode as 'production' | 'development') ??
    'production',
  clean:
    fileConfig.clean ?? (typeof argv.clean === 'boolean' ? argv.clean : true),
  useTemplateTsconfig:
    fileConfig.useTemplateTsconfig ??
    (typeof argv['use-template'] === 'boolean' ? argv['use-template'] : false),
  customPonyfills:
    fileConfig.customPonyfills ?? (argv['custom-ponyfills'] as string),
  destApp: fileConfig.destApp ?? (argv['dest-app'] as string),
  appVersion: fileConfig.appVersion ?? (argv['app-version'] as string)
};

console.log('Build configuration:', buildOptions);

// Build
buildExtendScript(buildOptions);
