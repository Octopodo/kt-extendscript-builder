import { defineConfig, UserConfig } from 'vite';
import * as nodePath from 'path'; // Importación modificada para evitar conflictos
import { extendscriptConfig } from './vite.es.config';
interface ExtendedUserConfig extends UserConfig {
  extendScriptConfig?: any;
}
export function createViteConfig(options: {
  input: string;
  outDir: string;
  watch: boolean;
  mode: 'production' | 'development';
  customPonyfills?: string;
}) {
  const { input, outDir, watch: watchMode, mode, customPonyfills } = options;

  // Usar la importación modificada
  const inputFileName = nodePath.basename(input);
  const inputExt = nodePath.extname(input);
  const nameWithoutExt = inputFileName.replace(inputExt, '');

  const extensions = ['.js', '.ts', '.tsx'];
  // Usar el nombre del archivo de entrada para el archivo de salida
  const outPathExtendscript = nodePath.join(outDir, `${nameWithoutExt}.js`);
  const isProduction = mode === 'production';

  console.log('Configuración Vite:', {
    input,
    outDir,
    outPathExtendscript,
    extensions,
    mode
  });

  // Configurar Vite
  const config: ExtendedUserConfig = {
    build: {
      minify: false,
      watch: watchMode ? {} : null,
      rollupOptions: {
        input,
        output: {
          entryFileNames: `${nameWithoutExt}.js`,
          dir: outDir
        }
      }
    }
  };

  // Invocar configuración de ExtendScript
  const esConfig = extendscriptConfig(
    input,
    outPathExtendscript,
    extensions,
    isProduction,
    customPonyfills
  );

  config.extendScriptConfig = esConfig;

  return defineConfig(config);
}
