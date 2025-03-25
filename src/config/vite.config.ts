import { defineConfig, UserConfig } from 'vite';
import path from 'path';
import { extendscriptConfig } from './vite.es.config';

export function createViteConfig(options: {
  input: string;
  outDir: string;
  watch: boolean;
  mode: 'production' | 'development';
  customPonyfills?: string;
}) {
  const { input, outDir, watch: watchMode, mode, customPonyfills } = options;

  const extensions = ['.js', '.ts', '.tsx'];
  const outPathExtendscript = path.join(outDir, 'index.js');
  const isProduction = mode === 'production';

  console.log('Configuración Vite:', {
    input,
    outDir,
    outPathExtendscript,
    extensions,
    mode
  });

  // Configurar Vite
  const config: UserConfig = {
    build: {
      minify: false,
      watch: watchMode ? {} : null,
      rollupOptions: {
        input,
        output: {
          entryFileNames: 'index.js',
          dir: outDir
        }
      }
    }
  };

  // Invocar configuración de ExtendScript
  extendscriptConfig(
    input,
    outPathExtendscript,
    extensions,
    isProduction,
    customPonyfills
  );

  return defineConfig(config);
}
