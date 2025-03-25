#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { buildExtendScript } from '../lib/builder';
import { BuildOptions } from '../lib/BuildOptions';
import path from 'path';
import fs from 'fs';

// Interfaz para el archivo de configuración
interface KTConfig {
  default?: Partial<BuildOptions>;
  [configName: string]: Partial<BuildOptions> | undefined;
}

// Función para leer el archivo de configuración
export function loadConfig(configName?: string): Partial<BuildOptions> {
  const configPath = path.join(process.cwd(), 'kt-config.json');

  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(
        fs.readFileSync(configPath, 'utf-8')
      ) as KTConfig;

      // Si se especificó un nombre de configuración, usar esa configuración
      if (configName && config[configName]) {
        console.log(`Usando configuración "${configName}" de kt-config.json`);
        return config[configName];
      }

      // Si existe configuración por defecto, usarla
      if (config.default) {
        console.log('Usando configuración "default" de kt-config.json');
        return config.default;
      }
    } catch (error) {
      console.error('Error al leer el archivo kt-config.json:', error);
    }
  }

  return {};
}

// Procesar argumentos con yargs
const argv = yargs(hideBin(process.argv))
  .option('input', {
    alias: 'i',
    type: 'string',
    description: 'Archivo de entrada',
    default: 'src/index.ts'
  })
  .option('output', {
    alias: 'o',
    type: 'string',
    description: 'Ruta de salida del archivo',
    default: 'dist/index.js'
  })
  .option('test', {
    alias: 't',
    type: 'boolean',
    description: 'Construir tests',
    default: false
  })
  .option('watch', {
    alias: 'w',
    type: 'boolean',
    description: 'Modo watch',
    default: false
  })
  .option('mode', {
    alias: 'm',
    type: 'string',
    description: 'Modo de construcción',
    default: 'production',
    choices: ['production', 'development'] as const
  })
  .option('tsconfig', {
    type: 'string',
    description: 'Ruta al archivo tsconfig'
  })
  .option('use-template', {
    type: 'boolean',
    description: 'Usar plantilla de tsconfig incluida en el paquete',
    default: false
  })
  .option('clean', {
    alias: 'c',
    type: 'boolean',
    description: 'Limpiar directorio de salida',
    default: true
  })
  .option('custom-ponyfills', {
    type: 'string',
    description: 'Ruta a un archivo de ponyfills personalizados'
  })
  .help()
  .parseSync();

// Revisar si el primer argumento es un nombre de configuración
const possibleConfigName = process.argv[2];
const isConfigName = possibleConfigName && !possibleConfigName.startsWith('-');

// Cargar configuración del archivo
const fileConfig = loadConfig(isConfigName ? possibleConfigName : undefined);

// Determinar tsconfig (prioridad: CLI > config file > default test)
let tsconfigPath = argv.tsconfig as string;
if (!tsconfigPath && fileConfig.tsconfig) {
  tsconfigPath = fileConfig.tsconfig;
} else if (argv.test && !tsconfigPath) {
  tsconfigPath = 'tsconfig.tests.json';
}

// Combinar configuraciones (CLI tiene prioridad sobre archivo)
const buildOptions: BuildOptions = {
  input: (argv.input as string) || fileConfig.input || 'src/index.ts',
  output: (argv.output as string) || fileConfig.output || 'dist/index.js',
  tsconfig: tsconfigPath,
  watch:
    (typeof argv.watch === 'boolean' ? argv.watch : fileConfig.watch) || false,
  mode:
    (argv.mode as 'production' | 'development') ||
    fileConfig.mode ||
    'production',
  clean:
    (typeof argv.clean === 'boolean' ? argv.clean : fileConfig.clean) || true,
  useTemplateTsconfig:
    (typeof argv['use-template'] === 'boolean'
      ? argv['use-template']
      : fileConfig.useTemplateTsconfig) || false,
  customPonyfills:
    (argv['custom-ponyfills'] as string) || fileConfig.customPonyfills
};

// Construir
buildExtendScript(buildOptions);
