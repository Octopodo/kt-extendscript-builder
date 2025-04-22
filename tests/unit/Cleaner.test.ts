import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Cleaner } from '../../src/lib/builder/Cleaner';
import * as fs from 'fs';
import * as path from 'path';
import { BuildOptions } from '../../src/types';
import { mkdir, writeFile, rm } from 'fs/promises';

describe('Cleaner', () => {
    // Directorio temporal para pruebas
    const tempDir = path.resolve(process.cwd(), 'tests/fixtures/temp-cleaner-tests');
    let options: Partial<BuildOptions>;

    // Guarda mensajes de consola para revisarlos después
    let consoleMessages = {
        logs: [] as string[],
        warnings: [] as string[],
        errors: [] as string[]
    };

    // Funciones originales de consola
    const originalConsole = {
        log: console.log,
        warn: console.warn,
        error: console.error
    };

    // Función auxiliar para crear archivos y directorios
    async function createTestFile(filePath: string, content: string = 'test content'): Promise<void> {
        const dir = path.dirname(filePath);
        await mkdir(dir, { recursive: true });
        await writeFile(filePath, content);
    }

    beforeEach(async () => {
        // Limpiar mensajes de consola anteriores
        consoleMessages = { logs: [], warnings: [], errors: [] };

        // Sobreescribir temporalmente console para capturar mensajes
        console.log = (message: string) => {
            consoleMessages.logs.push(message);
        };
        console.warn = (message: string) => {
            consoleMessages.warnings.push(message);
        };
        console.error = (message: string) => {
            consoleMessages.errors.push(message);
        };

        // Crear directorio temporal para pruebas
        await mkdir(tempDir, { recursive: true });

        // Crear estructura básica para pruebas
        await createTestFile(path.join(tempDir, 'index.js'));
        await createTestFile(path.join(tempDir, 'index.js.map'));
        await mkdir(path.join(tempDir, 'subfolder'), { recursive: true });
        await createTestFile(path.join(tempDir, 'subfolder', 'test.js'));

        // Opciones por defecto
        options = {
            output: path.join(tempDir, 'index.js')
        };
    });

    afterEach(async () => {
        // Restaurar funciones originales de console
        console.log = originalConsole.log;
        console.warn = originalConsole.warn;
        console.error = originalConsole.error;

        // Limpiar directorio temporal
        try {
            await rm(tempDir, { recursive: true, force: true });
        } catch (err) {
            originalConsole.error('Error limpiando el directorio temporal:', err);
        }
    });

    it('no debería limpiar cuando no se especifica output', async () => {
        // Preparar
        options.output = undefined;

        // Ejecutar
        await Cleaner.cleanDist(options);

        // Verificar
        expect(consoleMessages.warnings.some((m) => m.includes('No se especificó un archivo'))).toBe(true);
    });

    it('debería limpiar un archivo específico cuando existe', async () => {
        // Preparar
        const targetFile = path.join(tempDir, 'index.js');
        options.output = targetFile;

        // Verificar que el archivo existe antes de limpiar
        expect(fs.existsSync(targetFile)).toBe(true);

        // Ejecutar
        await Cleaner.cleanDist(options);

        // Verificar
        expect(fs.existsSync(targetFile)).toBe(false);
        expect(fs.existsSync(path.join(tempDir, 'index.js.map'))).toBe(true);
        expect(consoleMessages.logs.some((m) => m.includes('Archivo limpiado'))).toBe(true);
    });

    it('no debería limpiar directorios protegidos', async () => {
        // Preparar - crear un directorio protegido
        const srcDir = path.join(tempDir, 'src');
        await mkdir(srcDir, { recursive: true });
        await createTestFile(path.join(srcDir, 'test.js'));

        options.output = srcDir;

        // Ejecutar
        await Cleaner.cleanDist(options);

        // Verificar
        expect(fs.existsSync(srcDir)).toBe(true);
        expect(fs.existsSync(path.join(srcDir, 'test.js'))).toBe(true);
        expect(consoleMessages.errors.some((m) => m.includes('directorio protegido'))).toBe(true);
    });

    it('debería omitir carpetas protegidas durante la limpieza', async () => {
        // Preparar - crear una subcarpeta protegida
        const nodeModulesDir = path.join(tempDir, 'node_modules');
        await mkdir(nodeModulesDir, { recursive: true });
        await createTestFile(path.join(nodeModulesDir, 'package.js'));

        options.output = path.join(tempDir, 'package.js');

        // Ejecutar
        await Cleaner.cleanDist(options);

        expect(fs.existsSync(nodeModulesDir)).toBe(true);
        expect(fs.existsSync(path.join(nodeModulesDir, 'package.js'))).toBe(true);
    });
});
