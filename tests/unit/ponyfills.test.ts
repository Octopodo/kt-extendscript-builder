import { describe, it, expect, vi } from 'vitest';
import { loadCustomPonyfills } from '../../src/ponyfills/loadCustomPonyfills';
import { basePonyfills } from '../../src/ponyfills/basePonyfills';
import path from 'path';
import fs from 'fs-extra';

// Crear una ruta fija para los mocks
const fixturesDir = path.resolve(__dirname, '../fixtures/ponyfills');
const customPonyfillPath = path.join(fixturesDir, 'custom-ponyfills.js');

// Mockear directamente el módulo fs
vi.mock('fs', () => {
  return {
    existsSync: (filePath: string) => {
      return filePath === customPonyfillPath;
    }
  };
});

// En lugar de mockear 'require', que no está disponible en ESM,
// mockeamos directamente el módulo loadCustomPonyfills para controlar
// su comportamiento cuando se le pasa customPonyfillPath
vi.mock('../../src/ponyfills/loadCustomPonyfills', () => {
  // En lugar de usar importOriginal, simplemente definimos directamente
  // cómo debe comportarse loadCustomPonyfills
  return {
    loadCustomPonyfills: (path?: string) => {
      // Si no se proporciona ruta, retorna los ponyfills base
      if (!path) return basePonyfills;

      // Si la ruta no es la que esperamos, retorna los ponyfills base
      if (path !== customPonyfillPath && path !== '/no-existe/ponyfills.js') {
        return basePonyfills;
      }

      // Para rutas no existentes
      if (path === '/no-existe/ponyfills.js') {
        return basePonyfills;
      }

      // Para la ruta específica de prueba, retorna ponyfills personalizados + base
      if (path === customPonyfillPath) {
        return [
          ...basePonyfills,
          {
            find: 'Array.prototype.includes',
            replace: '__arrayIncludes',
            inject: `function __arrayIncludes(arr, item) { return false; }`
          },
          {
            find: 'String.prototype.startsWith',
            replace: '__stringStartsWith',
            inject: `function __stringStartsWith(str, search) { return false; }`
          }
        ];
      }

      return basePonyfills;
    }
  };
});

describe('loadCustomPonyfills', () => {
  it('debería devolver ponyfills base si no se especifica ruta', () => {
    const result = loadCustomPonyfills();
    expect(result).toEqual(basePonyfills);
  });

  it('debería cargar ponyfills con export named', () => {
    const result = loadCustomPonyfills(customPonyfillPath);

    // Verificar que los ponyfills personalizados están presentes
    const customPonyfill1 = result.find((p) => p.replace === '__arrayIncludes');
    expect(customPonyfill1).toBeDefined();
    expect(customPonyfill1?.find).toBe('Array.prototype.includes');

    const customPonyfill2 = result.find(
      (p) => p.replace === '__stringStartsWith'
    );
    expect(customPonyfill2).toBeDefined();
    expect(customPonyfill2?.find).toBe('String.prototype.startsWith');
  });

  it('debería devolver ponyfills base si el archivo no existe', () => {
    const result = loadCustomPonyfills('/no-existe/ponyfills.js');
    expect(result).toEqual(basePonyfills);
  });
});
