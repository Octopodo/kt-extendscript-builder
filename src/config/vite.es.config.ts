import { rollup, watch, RollupOptions, OutputOptions } from 'rollup';
import nodeResolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import { jsxInclude, jsxPonyfill } from 'vite-cep-plugin';
import path from 'path';
import json from '@rollup/plugin-json';
import { basePonyfills } from '../ponyfills/basePonyfills';

const GLOBAL_THIS = 'thisObj';

export function extendscriptConfig(
  extendscriptEntry: string,
  outPath: string,
  extensions: string[],
  isProduction: boolean
) {
  console.log(
    `Configurando Rollup para ExtendScript: ${extendscriptEntry} -> ${outPath}`
  );

  const config: RollupOptions = {
    input: extendscriptEntry,
    treeshake: true,
    output: {
      file: outPath,
      sourcemap: true,
      footer: `thisObj.KT = KT;`
    },
    external: [],
    plugins: [
      json(),
      nodeResolve({
        extensions
      }),
      babel({
        extensions,
        babelrc: false,
        babelHelpers: 'bundled',
        presets: [
          [
            '@babel/preset-env',
            {
              targets: {
                esmodules: 'commonjs',
                ie: '9'
              }
            }
          ],
          '@babel/preset-typescript'
        ],
        plugins: [
          '@babel/plugin-proposal-class-properties',
          '@babel/plugin-syntax-dynamic-import',
          ['@babel/plugin-transform-classes', { loose: true }]
        ]
      }),
      jsxPonyfill(basePonyfills),
      jsxInclude({
        iife: true,
        globalThis: GLOBAL_THIS
      }),
      {
        name: 'modify-final-bundle',
        generateBundle(options, bundle) {
          for (const fileName of Object.keys(bundle)) {
            const chunk = bundle[fileName];
            if (chunk.type === 'chunk') {
              // Modifica el código del archivo final
              chunk.code = chunk.code.replace(
                /(^|\n)\s*export\s+(default\s+)?({[^}]+}|\w+\s*(=|\([^)]*\))?.*?(;|\n|$)|class\s+\w+\s*{[\s\S]*?}|\s*function\s+\w+\s*\([^)]*\)\s*{[\s\S]*?});/g,
                '$1'
              );
            }
          }
        }
      }
    ]
  };

  async function build() {
    try {
      const bundle = await rollup(config);
      await bundle.write(config.output as OutputOptions);
      await bundle.close();
      console.log(`ExtendScript build completada: ${outPath}`);
    } catch (error) {
      console.error('Error en build ExtendScript:', error);
      process.exit(1);
    }
  }

  function watchRollup() {
    const watcher = watch(config);
    watcher.on('event', (event) => {
      switch (event.code) {
        case 'START':
          console.log('Watcher iniciado...');
          break;
        case 'BUNDLE_START':
          console.log('Reconstruyendo...');
          break;
        case 'BUNDLE_END':
          event.result.write(config.output as OutputOptions).then(() => {
            console.log('Archivo actualizado:', outPath);
            event.result.close();
          });
          break;
        case 'END':
          console.log('Watch ciclo completo');
          break;
        case 'ERROR':
          console.error('Error en watch:', event.error);
          break;
      }
    });
  }

  if (isProduction) {
    build();
  } else {
    watchRollup();
  }
}
