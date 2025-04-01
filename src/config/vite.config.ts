import { defineConfig, UserConfig } from 'vite';
import * as nodePath from 'path'; // Modified import to avoid conflicts
import { extendscriptConfig } from './vite.es.config';
import { BuildOptions } from '../types';
interface ExtendedUserConfig extends UserConfig {
  extendScriptConfig?: any;
}
export function createViteConfig(options: Partial<BuildOptions> = {}) {
 {
  const { input, ['outDir'], watch: watchMode, mode, customPonyfills } = options;

  // Use the modified import
  const inputFileName = nodePath.basename(input);
  const inputExt = nodePath.extname(input);
  const nameWithoutExt = inputFileName.replace(inputExt, '');

  const extensions = ['.js', '.ts', '.tsx'];
  // Use the input filename for the output file
  const outPathExtendscript = nodePath.join(outDir, `${nameWithoutExt}.js`);
  const isProduction = mode === 'production';

  console.log('Vite Configuration:', {
    input,
    outDir,
    outPathExtendscript,
    extensions,
    mode
  });

  // Configure Vite
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

  // Invoke ExtendScript configuration
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
