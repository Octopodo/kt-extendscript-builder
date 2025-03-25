import { describe, it, expect, afterAll } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import { buildExtendScript } from '../../src/lib/builder';
import { execSync } from 'child_process';

describe('Build E2E', () => {
  const testDir = path.resolve(__dirname, '../fixtures/basic-project');
  const outputDir = path.join(testDir, 'dist');
  const outputFile = path.join(outputDir, 'index.js');

  it('debería compilar un proyecto TypeScript real', async () => {
    // Crear un proyecto TypeScript de prueba real
    await fs.ensureDir(path.join(testDir, 'src'));
    await fs.writeFile(
      path.join(testDir, 'src/index.ts'),
      `
      class Greeting {
        private message: string;
        
        constructor(name: string) {
          this.message = \`Hello, \${name}!\`;
        }
        
        show(): void {
          alert(this.message);
        }
      }
      
      const greeting = new Greeting("Adobe");
      greeting.show();
      
      export { Greeting };
      `
    );

    // Ejecutar build real
    await buildExtendScript({
      input: path.join(testDir, 'src/index.ts'),
      output: outputFile,
      mode: 'production',
      watch: false,
      clean: true,
      useTemplateTsconfig: true
    });

    // Verificar que el archivo existe
    const exists = await fs.pathExists(outputFile);
    expect(exists).toBe(true);

    // Verificar que el código es válido
    const content = await fs.readFile(outputFile, 'utf-8');

    // Verificar estructura básica
    expect(content).toMatch(/\(\s*function\s*\(\s*thisObj\s*\)/);
    expect(content).toMatch(/\}\s*\)\s*\(\s*this\s*\)/);

    // Verificar que la clase se compiló correctamente
    expect(content).toMatch(/function\s+Greeting\s*\(\s*name\s*\)/);
    expect(content).toMatch(/Greeting\.prototype\.show\s*=/);

    // Verificar exportación
    expect(content).toMatch(/thisObj\.KT\s*=/);

    // OPCIONAL: Intentar ejecutar en ExtendScript
    // Esto requeriría tener Adobe instalado y configurado
    if (process.env.RUN_EXTENDSCRIPT_TESTS) {
      try {
        execSync(`estk -run "${outputFile}"`);
      } catch (error) {
        throw new Error(`Error ejecutando ExtendScript: ${error}`);
      }
    }
  });

  afterAll(async () => {
    await fs.remove(outputDir);
  });
});
