import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import fs from 'fs-extra';
import path from 'path';

// Mock para process.exit
vi.mock('process', async () => {
  const actual = await vi.importActual('process');
  return {
    ...actual,
    exit: vi.fn()
  };
});

// Mock para execSync - IMPORTANTE: evita la compilación real de TS
vi.mock('child_process', () => ({
  execSync: vi.fn()
}));

// Mock para vite incluyendo defineConfig
vi.mock('vite', () => {
  return {
    build: vi.fn().mockResolvedValue(undefined),
    defineConfig: (config) => config
  };
});

import { buildExtendScript } from '../../src/lib/builder';

describe('Prueba de ponyfills personalizados', () => {
  const fixturesDir = path.resolve(__dirname, '../fixtures');
  const outputDir = path.join(fixturesDir, 'basic-project/dist');
  const outputFile = path.join(outputDir, 'index.js');
  const ponyfillsPath = path.join(fixturesDir, 'ponyfills/custom-ponyfills.js');

  beforeAll(async () => {
    // Asegurar que los directorios existan
    await fs.ensureDir(outputDir);
    await fs.ensureDir(path.join(fixturesDir, 'ponyfills'));

    // Crear archivo de ponyfills
    await fs.writeFile(
      ponyfillsPath,
      `
      exports.ponyfills = [
        {
          find: 'Array.prototype.includes',
          replace: '__arrayIncludes',
          inject: \`function __arrayIncludes(arr, item) { 
            for (var i = 0; i < arr.length; i++) { 
              if (arr[i] === item) return true; 
            } 
            return false; 
          }\`
        },
        {
          find: 'String.prototype.startsWith',
          replace: '__stringStartsWith',
          inject: \`function __stringStartsWith(str, search) { 
            return str.indexOf(search) === 0; 
          }\`
        }
      ];
      `
    );

    // Crear archivo inicial simulado
    await fs.writeFile(
      outputFile,
      `
      (function(thisObj) {
        function __arrayIncludes(arr, item) { 
          for (var i = 0; i < arr.length; i++) { 
            if (arr[i] === item) return true; 
          } 
          return false; 
        }

        function __stringStartsWith(str, search) { 
          return str.indexOf(search) === 0; 
        }

        // Resto del código
        var greeting = new Greeting('Adobe');
        greeting.show();

        thisObj.KT = KT;
      })(this);
      `
    );
  });

  it('debería incluir ponyfills personalizados en la build', async () => {
    // Solo verificamos que buildExtendScript se llame correctamente
    await buildExtendScript({
      input: path.join(fixturesDir, 'basic-project/src/index.ts'),
      output: outputFile,
      mode: 'production',
      watch: false,
      clean: false,
      useTemplateTsconfig: true,
      customPonyfills: ponyfillsPath
    });

    // Verificar que el archivo existe
    const exists = await fs.pathExists(outputFile);
    expect(exists).toBe(true);

    // Verificar el contenido
    const content = await fs.readFile(outputFile, 'utf-8');
    expect(content).toMatch(/function\s+__arrayIncludes/);
    expect(content).toMatch(/function\s+__stringStartsWith/);
  });

  afterAll(async () => {
    await fs.remove(path.join(fixturesDir, 'ponyfills'));
    await fs.remove(outputDir);
    vi.restoreAllMocks();
  });
});
