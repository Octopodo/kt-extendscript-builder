import { BuildOptions } from '../../types';
import path from 'path';
import fs from 'fs';
import rimraf from 'rimraf';
import { promisify } from 'util';

const rimrafAsync = promisify(rimraf);

/**
 * Class responsible for safely cleaning output directories
 */
export class Cleaner {
    // Critical folders that should not be deleted
    private static readonly PROTECTED_FOLDERS = ['src', 'node_modules'];

    /**
     * Safely cleans the output directory
     * @param options Build options
     */
    static async cleanDist(options: Partial<BuildOptions>): Promise<void> {
        if (!this.validateOptions(options)) {
            return;
        }

        if (!fs.existsSync(options.output as string)) {
            console.warn(`Output file ${options.output} does not exist. Cleaning will not be performed.`);
            return;
        }
        const stat = fs.lstatSync(options.output as string);
        const isFile = stat.isFile();
        const isDirectory = stat.isDirectory();

        const distPath = isFile
            ? path.dirname(options.output as string)
            : isDirectory
            ? path.resolve(options.output as string)
            : '';

        if (!this.validateDistPath(distPath)) {
            return;
        }

        try {
            await this.performClean(distPath, options.output as string);
        } catch (error) {
            console.error(`Error cleaning ${distPath}:`, error);
        }
    }

    /**
     * Validates that the options are correct for cleaning
     * @param options Build options
     * @returns true if options are valid, false otherwise
     */
    private static validateOptions(options: Partial<BuildOptions>): boolean {
        if (!options.output) {
            console.warn('No output file specified, cannot clean');
            return false;
        }
        return true;
    }

    /**
     * Verifies that the output directory exists and is safe to clean
     * @param distPath Path to the output directory
     * @returns true if the directory is valid and safe, false otherwise
     */
    private static validateDistPath(distPath: string): boolean {
        // Check if the directory exists
        if (!fs.existsSync(distPath)) {
            console.warn(`${distPath} does not exist. Skipping cleaning`);
            return false;
        }

        const absolutePath = path.resolve(distPath);
        const projectRoot = process.cwd();

        // Check that the directory to clean is a subdirectory of the project
        // and not the project root directory itself
        if (!absolutePath.startsWith(projectRoot) || absolutePath === projectRoot) {
            console.error(
                `Security warning! ${absolutePath} will not be cleaned as it is not a safe project subdirectory`
            );
            return false;
        }

        // Verify it's not a protected directory
        const relativePath = path.relative(projectRoot, absolutePath);
        const pathParts = relativePath.split(path.sep);

        for (const part of pathParts) {
            // We check each segment of the path to verify it's not a protected folder
            // We exclude paths like "dist.test" that contain "test" but are valid for cleaning
            if (
                this.PROTECTED_FOLDERS.some(
                    (folder) =>
                        part === folder || // It's exactly a protected folder
                        (part === 'test' && pathParts[0] !== 'dist.test') // It's 'test' but not inside 'dist.test'
                )
            ) {
                console.error(
                    `Security warning! ${absolutePath} will not be cleaned as it is a protected project directory`
                );
                return false;
            }
        }

        return true;
    }

    /**
     * Performs the cleaning of the directory or file
     * @param distPath Path to the output directory
     * @param outputPath Complete path to the output file
     */
    private static async performClean(distPath: string, outputPath: string): Promise<void> {
        const outputFilename = path.basename(outputPath);
        const outputFilePath = path.join(distPath, outputFilename);

        // If the specific file exists, delete only that file
        if (fs.existsSync(outputFilePath)) {
            await fs.promises.unlink(outputFilePath);
            console.log(`File cleaned: ${outputFilePath}`);
            return;
        }

        // If it's a directory, delete its contents but keep the directory
        const files = await fs.promises.readdir(distPath);
        if (files.length === 0) {
            console.log(`Directory ${distPath} is empty. Nothing to clean.`);
            return;
        }

        // Safe deletion file by file
        for (const file of files) {
            const filePath = path.join(distPath, file);
            await this.removeFileOrDirectory(filePath);
        }

        console.log(`Directory cleaned: ${distPath}`);
    }

    /**
     * Safely removes a file or directory
     * @param filePath Path to the file or directory to remove
     */
    private static async removeFileOrDirectory(filePath: string): Promise<void> {
        const stats = await fs.promises.lstat(filePath);

        if (stats.isDirectory()) {
            // Additional security check for subdirectories
            const dirName = path.basename(filePath);
            if (this.PROTECTED_FOLDERS.includes(dirName)) {
                console.warn(`Skipping protected folder: ${filePath}`);
                return;
            }
            await rimrafAsync(filePath);
            console.log(`Subdirectory removed: ${filePath}`);
        } else {
            await fs.promises.unlink(filePath);
            console.log(`File removed: ${filePath}`);
        }
    }
}
