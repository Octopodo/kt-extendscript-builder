import fs from 'fs';
import path from 'path';
import { basePonyfills } from '../ponyfills/basePonyfills';
import { PonyfillItem } from '../../types';

export class PonyfillCollector {
    /**
     * Collects ponyfills from specified paths and search locations
     * @param userPonyfillsPaths Path(s) to custom ponyfill files
     * @param searchPaths Path(s) to search for ponyfill files
     * @returns Combined list of base and custom ponyfills
     * @throws Error if loading or searching fails
     */
    public collect(userPonyfillsPaths?: string[] | string, searchPaths?: string[] | string): PonyfillItem[] {
        let collectedPonyfills: PonyfillItem[] = [...basePonyfills];

        if (userPonyfillsPaths) {
            const paths = Array.isArray(userPonyfillsPaths) ? userPonyfillsPaths : [userPonyfillsPaths];
            for (const ponyfillsPath of paths) {
                collectedPonyfills = this.mergePonyfills(collectedPonyfills, this.loadPonyfills(ponyfillsPath));
            }
        }

        if (searchPaths && searchPaths.length > 0) {
            const paths = Array.isArray(searchPaths) ? searchPaths : [searchPaths];
            const foundPaths = this.searchPonyfillFiles(paths);
            for (const ponyfillPath of foundPaths) {
                collectedPonyfills = this.mergePonyfills(collectedPonyfills, this.loadPonyfills(ponyfillPath));
            }
        }

        return collectedPonyfills;
    }

    /**
     * Loads ponyfills from a file
     * @param ponyfillsPath Path to ponyfills file
     * @returns Array of ponyfill items
     * @throws Error if file cannot be loaded or parsed
     */
    private loadPonyfills(ponyfillsPath: string): PonyfillItem[] {
        if (!ponyfillsPath) return [];
        const absolutePath = path.resolve(process.cwd(), ponyfillsPath); // Siempre relativo a cwd
        try {
            const ponyfillModule = import(absolutePath); // Puede lanzar error si falla
            return this.selectPonyfills(ponyfillModule);
        } catch (error) {
            throw new Error(`Error loading ponyfills from ${ponyfillsPath}: ${error}`);
        }
    }

    /**
     * Searches recursively for ponyfill files in multiple paths
     * @param searchPaths Directories to search
     * @returns Array of ponyfill file paths
     * @throws Error if directory cannot be read
     */
    private searchPonyfillFiles(searchPaths: string[]): string[] {
        const collectedPaths: string[] = [];
        for (const searchPath of searchPaths) {
            this.searchDirectory(searchPath, collectedPaths);
        }
        return collectedPaths;
    }

    private searchDirectory(currentPath: string, store: string[]): void {
        const files = fs.readdirSync(currentPath);
        for (const file of files) {
            const filePath = path.join(currentPath, file);
            const stat = fs.statSync(filePath);
            const isPonyfill = file.toLowerCase().includes('ponyfill');
            const isTypeScript = file.endsWith('.ts');

            if (stat.isDirectory()) {
                this.searchDirectory(filePath, store);
            } else if (stat.isFile() && isPonyfill && isTypeScript) {
                store.push(filePath);
            }
        }
    }

    /**
     * Selects valid ponyfills from a module
     * @param ponyfills Module containing ponyfills
     * @returns Array of valid ponyfill items
     */
    private selectPonyfills(ponyfills: any): PonyfillItem[] {
        if (Array.isArray(ponyfills)) return this.validatePonyfills(ponyfills);
        if (ponyfills?.default && Array.isArray(ponyfills.default)) return this.validatePonyfills(ponyfills.default);

        const foundPonyfills: PonyfillItem[] = [];
        for (const key in ponyfills) {
            if (key.toLowerCase().includes('ponyfills') && Array.isArray(ponyfills[key])) {
                foundPonyfills.push(...this.validatePonyfills(ponyfills[key]));
            }
        }
        return foundPonyfills;
    }

    /**
     * Validates ponyfill items
     * @param ponyfills Array of potential ponyfill items
     * @returns Array of valid ponyfill items
     */
    private validatePonyfills(ponyfills: any[]): PonyfillItem[] {
        return ponyfills.filter(
            (ponyfill) => ponyfill?.find && ponyfill?.replace && ponyfill?.inject
        ) as PonyfillItem[];
    }

    /**
     * Merges ponyfills, avoiding duplicates based on find property
     * @param existing Existing ponyfills
     * @param newPonyfills New ponyfills to add
     * @returns Merged array of ponyfills
     */
    private mergePonyfills(existing: PonyfillItem[], newPonyfills: PonyfillItem[]): PonyfillItem[] {
        const seen = new Set(existing.map((p) => p.find));
        const uniqueNew = newPonyfills.filter((p) => !seen.has(p.find));
        return [...existing, ...uniqueNew];
    }
}
