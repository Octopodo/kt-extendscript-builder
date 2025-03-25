import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { loadConfig } from '../../src/bin/kt-build';
import fs from 'fs-extra';
import path from 'path';

// Mock para vite incluyendo defineConfig
vi.mock('vite', () => {
  return {
    build: vi.fn().mockResolvedValue(undefined),
    defineConfig: (config) => config // Mock simple de defineConfig
  };
});

// Mock de child_process
vi.mock('child_process', () => ({
  execSync: vi.fn()
}));

describe('loadConfig', () => {
  const configDir = path.resolve(__dirname, '../fixtures/temp-config');
  const configPath = path.join(configDir, 'kt-config.json');

  beforeEach(async () => {
    await fs.ensureDir(configDir);

    // Crear un config de prueba
    const configData = {
      default: {
        input: 'src/default.ts',
        output: 'dist/default.js',
        watch: false,
        mode: 'production',
        clean: true
      },
      dev: {
        input: 'src/dev.ts',
        output: 'dist/dev.js',
        watch: true,
        mode: 'development'
      }
    };

    await fs.writeFile(configPath, JSON.stringify(configData));

    // Mockear process.cwd() para que apunte a nuestro directorio de pruebas
    process.cwd = vi.fn().mockReturnValue(configDir);
  });

  afterEach(async () => {
    await fs.remove(configDir);
    vi.restoreAllMocks();
  });

  it('debería cargar la configuración default si no se especifica nombre', () => {
    const config = loadConfig();
    expect(config).toMatchObject({
      input: 'src/default.ts',
      output: 'dist/default.js',
      mode: 'production'
    });
  });

  it('debería cargar la configuración nombrada si se especifica', () => {
    const config = loadConfig('dev');
    expect(config).toMatchObject({
      input: 'src/dev.ts',
      mode: 'development',
      watch: true
    });
  });

  // Corrección del test para esperar la config default cuando no encuentra la config solicitada
  it('debería devolver la configuración default si la configuración nombrada no existe', () => {
    const config = loadConfig('no-existe');
    expect(config).toMatchObject({
      input: 'src/default.ts',
      output: 'dist/default.js',
      mode: 'production'
    });
  });
});
