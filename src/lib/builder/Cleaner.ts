import { BuildOptions } from '../../types';
import path from 'path';
import fs from 'fs';
import rimraf from 'rimraf';
import { promisify } from 'util';

const rimrafAsync = promisify(rimraf);

/**
 * Clase encargada de la limpieza segura de directorios de salida
 */
export class Cleaner {
    // Carpetas críticas que no deben ser eliminadas
    private static readonly PROTECTED_FOLDERS = ['src', 'node_modules', 'tests'];

    /**
     * Limpia el directorio de salida de manera segura
     * @param options Opciones de construcción
     */
    static async cleanDist(options: Partial<BuildOptions>): Promise<void> {
        if (!this.validateOptions(options)) {
            return;
        }

        const distPath = path.dirname(options.output as string);

        if (!this.validateDistPath(distPath)) {
            return;
        }

        try {
            await this.performClean(distPath, options.output as string);
        } catch (error) {
            console.error(`Error al limpiar ${distPath}:`, error);
        }
    }

    /**
     * Valida que las opciones sean correctas para realizar la limpieza
     * @param options Opciones de construcción
     * @returns true si las opciones son válidas, false en caso contrario
     */
    private static validateOptions(options: Partial<BuildOptions>): boolean {
        if (!options.output) {
            console.warn('No se especificó un archivo de salida, no se puede limpiar');
            return false;
        }
        return true;
    }

    /**
     * Verifica que el directorio de salida exista y sea seguro para limpiar
     * @param distPath Ruta al directorio de salida
     * @returns true si el directorio es válido y seguro, false en caso contrario
     */
    private static validateDistPath(distPath: string): boolean {
        // Verificar si el directorio existe
        if (!fs.existsSync(distPath)) {
            console.warn(`${distPath} no existe. Saltando limpieza`);
            return false;
        }

        const absolutePath = path.resolve(distPath);
        const projectRoot = process.cwd();

        // Comprobar que el directorio a limpiar es un subdirectorio del proyecto
        // y que no es el mismo directorio raíz del proyecto
        if (!absolutePath.startsWith(projectRoot) || absolutePath === projectRoot) {
            console.error(
                `¡Advertencia de seguridad! No se limpiará ${absolutePath} ya que no es un subdirectorio seguro del proyecto`
            );
            return false;
        }

        // Verificar que no se trata de un directorio protegido
        const relativePath = path.relative(projectRoot, absolutePath);
        const pathParts = relativePath.split(path.sep);

        for (const part of pathParts) {
            // Verificamos cada segmento de la ruta para comprobar que no es una carpeta protegida
            // Excluimos rutas como "dist.test" que contienen "test" pero son válidas para limpiar
            if (
                this.PROTECTED_FOLDERS.some(
                    (folder) =>
                        part === folder || // Es exactamente una carpeta protegida
                        (part === 'test' && pathParts[0] !== 'dist.test') // Es 'test' pero no está dentro de 'dist.test'
                )
            ) {
                console.error(
                    `¡Advertencia de seguridad! No se limpiará ${absolutePath} ya que es un directorio protegido del proyecto`
                );
                return false;
            }
        }

        return true;
    }

    /**
     * Ejecuta la limpieza del directorio o archivo
     * @param distPath Ruta al directorio de salida
     * @param outputPath Ruta completa al archivo de salida
     */
    private static async performClean(distPath: string, outputPath: string): Promise<void> {
        const outputFilename = path.basename(outputPath);
        const outputFilePath = path.join(distPath, outputFilename);

        // Si existe el archivo específico, eliminar solo ese archivo
        if (fs.existsSync(outputFilePath)) {
            await fs.promises.unlink(outputFilePath);
            console.log(`Archivo limpiado: ${outputFilePath}`);
            return;
        }

        // Si es un directorio, eliminar su contenido pero mantener el directorio
        const files = await fs.promises.readdir(distPath);
        if (files.length === 0) {
            console.log(`Directorio ${distPath} está vacío. No hay nada que limpiar.`);
            return;
        }

        // Eliminación segura archivo por archivo
        for (const file of files) {
            const filePath = path.join(distPath, file);
            await this.removeFileOrDirectory(filePath);
        }

        console.log(`Directorio limpiado: ${distPath}`);
    }

    /**
     * Elimina un archivo o directorio de forma segura
     * @param filePath Ruta al archivo o directorio a eliminar
     */
    private static async removeFileOrDirectory(filePath: string): Promise<void> {
        const stats = await fs.promises.lstat(filePath);

        if (stats.isDirectory()) {
            // Verificación adicional de seguridad para subdirectorios
            const dirName = path.basename(filePath);
            if (this.PROTECTED_FOLDERS.includes(dirName)) {
                console.warn(`Omitiendo carpeta protegida: ${filePath}`);
                return;
            }
            await rimrafAsync(filePath);
            console.log(`Subdirectorio eliminado: ${filePath}`);
        } else {
            await fs.promises.unlink(filePath);
            console.log(`Archivo eliminado: ${filePath}`);
        }
    }
}
