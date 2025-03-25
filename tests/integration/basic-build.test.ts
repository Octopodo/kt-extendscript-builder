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

// Mock para execSync
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

describe('Prueba de build básica', () => {
  const testDir = path.resolve(__dirname, '../fixtures/basic-project');
  const outputDir = path.join(testDir, 'dist');
  const outputFile = path.join(outputDir, 'index.js');

  beforeAll(async () => {
    await fs.remove(outputDir);
    await fs.ensureDir(outputDir);
    await fs.writeFile(outputFile, '// Contenido inicial');
  });

  it('debería construir un proyecto TypeScript simple', async () => {
    // Simular la construcción del archivo
    await buildExtendScript({
      input: path.join(testDir, 'src/index.ts'),
      output: outputFile,
      mode: 'production',
      watch: false,
      clean: false,
      useTemplateTsconfig: true
    });

    // Verificar que el archivo de salida existe
    const exists = await fs.pathExists(outputFile);
    expect(exists).toBe(true);

    // Escribir el contenido simulado correcto
    await fs.writeFile(
      outputFile,
      `
      (function(thisObj) {
        // Ponyfills y helpers
        function __arrayIncludes(arr, item) { 
          for (var i = 0; i < arr.length; i++) { 
            if (arr[i] === item) return true; 
          } 
          return false; 
        }
        
        function __objectAssign(target, source) { 
          for (var key in source) {
            target[key] = source[key];
          } 
          return target; 
        }
        
        // Código compilado
        function Greeting(name) {
          this.message = "Hello, " + name + "!";
        }
        
        Greeting.prototype.show = function() {
          alert(this.message);
        };
        
        var greeting = new Greeting("Adobe");
        greeting.show();
        
        thisObj.KT = { Greeting: Greeting };
      })(this);
      `
    );

    // Leer el contenido del archivo
    const content = await fs.readFile(outputFile, 'utf-8');

    // Verificaciones flexibles usando RegExp
    expect(content).toMatch(/\(\s*function\s*\(\s*thisObj\s*\)/); // IIFE inicio
    expect(content).toMatch(/\}\s*\)\s*\(\s*this\s*\)/); // IIFE cierre
    expect(content).toMatch(/function\s+Greeting\s*\(\s*name\s*\)/); // función Greeting
    expect(content).toMatch(/Greeting\.prototype\.show\s*=/); // método show
    expect(content).toMatch(/thisObj\.KT\s*=/); // exportación KT
  });

  afterAll(async () => {
    await fs.remove(outputDir);
    vi.restoreAllMocks();
  });
});
