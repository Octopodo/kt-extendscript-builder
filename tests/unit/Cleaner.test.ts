import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Cleaner } from '../../src/lib/builder/Cleaner';
import fs from 'fs';
import path from 'path';
import { BuildOptions } from '../../src/types';
import rimraf from 'rimraf';
import { promisify } from 'util';

// Mock de módulos
vi.mock('fs', () => ({
    default: {
        existsSync: vi.fn(),
        promises: {
            unlink: vi.fn(),
            readdir: vi.fn(),
            lstat: vi.fn()
        }
    }
}));

vi.mock('rimraf', () => {
    return {
        default: vi.fn()
    };
});

vi.mock('path', () => {
    return {
        default: {
            dirname: vi.fn(),
            resolve: vi.fn(),
            relative: vi.fn(),
            basename: vi.fn(),
            join: vi.fn(),
            sep: '/'
        }
    };
});

vi.mock('util', () => ({
    promisify: vi.fn().mockImplementation((fn) => fn)
}));

describe('Cleaner', () => {
    let options: Partial<BuildOptions>;
    const mockCwd = '/mock/project';

    beforeEach(() => {
        options = {
            output: '/mock/project/dist/index.js'
        };

        // Reset mocks
        vi.resetAllMocks();

        // Setup default mock implementations
        vi.spyOn(process, 'cwd').mockReturnValue(mockCwd);
        path.dirname = vi.fn().mockReturnValue('/mock/project/dist');
        path.resolve = vi.fn().mockReturnValue('/mock/project/dist');
        path.relative = vi.fn().mockReturnValue('dist');
        path.basename = vi.fn().mockReturnValue('index.js');
        path.join = vi.fn().mockImplementation((dir, file) => `${dir}/${file}`);
        fs.existsSync = vi.fn().mockReturnValue(true);
        fs.promises.readdir = vi.fn().mockResolvedValue(['index.js', 'index.js.map']);
        fs.promises.lstat = vi.fn().mockResolvedValue({
            isDirectory: () => false
        });
        fs.promises.unlink = vi.fn().mockResolvedValue(undefined);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should not clean when output is not specified', async () => {
        // Arrange
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        options.output = undefined;

        // Act
        await Cleaner.cleanDist(options);

        // Assert
        expect(warnSpy).toHaveBeenCalledWith('No se especificó un archivo de salida, no se puede limpiar');
        expect(fs.promises.unlink).not.toHaveBeenCalled();
    });

    it('should not clean when directory does not exist', async () => {
        // Arrange
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        fs.existsSync = vi.fn().mockReturnValue(false);

        // Act
        await Cleaner.cleanDist(options);

        // Assert
        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('no existe'));
        expect(fs.promises.unlink).not.toHaveBeenCalled();
    });

    it('should not clean project root directory', async () => {
        // Arrange
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        path.resolve = vi.fn().mockReturnValue('/mock/project');

        // Act
        await Cleaner.cleanDist(options);

        // Assert
        expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('¡Advertencia de seguridad!'));
        expect(fs.promises.unlink).not.toHaveBeenCalled();
    });

    it('should not clean directories outside of project root', async () => {
        // Arrange
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        path.resolve = vi.fn().mockReturnValue('/other/location');

        // Act
        await Cleaner.cleanDist(options);

        // Assert
        expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('¡Advertencia de seguridad!'));
        expect(fs.promises.unlink).not.toHaveBeenCalled();
    });

    it('should not clean protected directories', async () => {
        // Arrange
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        path.relative = vi.fn().mockReturnValue('src/dist');

        // Act
        await Cleaner.cleanDist(options);

        // Assert
        expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('directorio protegido'));
        expect(fs.promises.unlink).not.toHaveBeenCalled();
    });

    it('should clean a specific file when it exists', async () => {
        // Arrange
        const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        const filePath = '/mock/project/dist/index.js';

        path.join = vi.fn().mockReturnValue(filePath);
        fs.existsSync = vi.fn().mockImplementation((p) => true);

        // Act
        await Cleaner.cleanDist(options);

        // Assert
        expect(fs.promises.unlink).toHaveBeenCalledWith(filePath);
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Archivo limpiado'));
    });

    it('should clean all files in directory when specific file does not exist', async () => {
        // Arrange
        const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        // Configurar para que el archivo específico no exista
        const dirPath = '/mock/project/dist';
        const filePath = `${dirPath}/index.js`;
        path.join = vi.fn().mockImplementation((dir, file) => {
            if (dir === dirPath && file === 'index.js') return filePath;
            if (dir === dirPath && file === 'index.js') return `${dir}/index.js`;
            if (dir === dirPath && file === 'index.js.map') return `${dir}/index.js.map`;
            return `${dir}/${file}`;
        });

        fs.existsSync = vi.fn().mockImplementation((p) => {
            // El directorio existe pero el archivo específico no
            if (p === dirPath) return true;
            if (p === filePath) return false;
            return true;
        });

        // Act
        await Cleaner.cleanDist(options);

        // Assert
        // Debe llamar a unlink para cada archivo en el directorio
        expect(fs.promises.unlink).toHaveBeenCalledTimes(2);
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Directorio limpiado'));
    });

    it('should skip protected subdirectories during directory clean', async () => {
        // Arrange
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        // Configurar para que el archivo específico no exista y haya un directorio protegido
        const dirPath = '/mock/project/dist';
        const filePath = `${dirPath}/index.js`;
        const protectedPath = `${dirPath}/node_modules`;

        // Mock de existsSync para el escenario
        fs.existsSync = vi.fn().mockImplementation((p) => {
            if (p === dirPath) return true; // El directorio existe
            if (p === filePath) return false; // El archivo específico no existe
            return true;
        });

        // Configurar readdir para devolver archivos y un directorio protegido
        fs.promises.readdir = vi.fn().mockResolvedValue(['index.js', 'node_modules']);

        // Mock de path.join según los argumentos
        path.join = vi.fn().mockImplementation((dir, file) => {
            if (file === 'index.js') return `${dir}/index.js`;
            if (file === 'node_modules') return `${dir}/node_modules`;
            return `${dir}/${file}`;
        });

        // Mock de path.basename
        path.basename = vi.fn().mockImplementation((p) => {
            if (p === protectedPath) return 'node_modules';
            if (p === filePath) return 'index.js';
            return p.split('/').pop() || '';
        });

        // Mock de lstat para que node_modules sea un directorio
        fs.promises.lstat = vi.fn().mockImplementation((p) => {
            if (p === protectedPath) {
                return { isDirectory: () => true };
            }
            return { isDirectory: () => false };
        });

        // Act
        await Cleaner.cleanDist(options);

        // Assert
        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Omitiendo carpeta protegida'));
        // Solo se debe eliminar el archivo, no el directorio protegido
        expect(fs.promises.unlink).toHaveBeenCalledTimes(1);
    });

    it('should handle errors during cleaning', async () => {
        // Arrange
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        fs.promises.unlink = vi.fn().mockRejectedValue(new Error('Error al eliminar archivo'));

        // Act
        await Cleaner.cleanDist(options);

        // Assert
        expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Error al limpiar'), expect.any(Error));
    });

    it('should log when directory is empty', async () => {
        // Arrange
        const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        // Configurar para que el archivo específico no exista y el directorio esté vacío
        const dirPath = '/mock/project/dist';
        const filePath = `${dirPath}/index.js`;

        fs.existsSync = vi.fn().mockImplementation((p) => {
            if (p === dirPath) return true; // El directorio existe
            if (p === filePath) return false; // El archivo específico no existe
            return false;
        });

        fs.promises.readdir = vi.fn().mockResolvedValue([]);

        // Act
        await Cleaner.cleanDist(options);

        // Assert
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('está vacío'));
    });
});
