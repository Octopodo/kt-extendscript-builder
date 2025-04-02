// src/loaders/TsconfigLoader.ts
import { BuildOptions } from '../../types'; // Ajusta la ruta según tu estructura
import path from 'path';
import fs from 'fs';
import { tsconfigES3, tsconfigTestsES3 } from './tsconfigTemplates'; // Ajusta la ruta a tus templates
import { option } from 'yargs';

export class TsconfigLoader {
    constructor() {}

    load(options: Partial<BuildOptions>) {
        let tsconfigPath: string = 'tsconfig.json';
        if (options.test && options['tsconfig-test-path']) {
            tsconfigPath = options['tsconfig-test-path'] as string;
        } else if (options.tsconfig) {
            tsconfigPath = options['tsconfig'] as string;
        }

        if (options['tsconfig-template']) {
            return this.loadFromTemplate(options.test);
        } else {
            return this.loadFromFile(tsconfigPath);
        }
    }

    private loadFromTemplate(test: boolean = false) {
        if (test) {
            return tsconfigTestsES3;
        }
        return tsconfigES3;
    }

    private loadFromFile(configPath: string) {
        const absolutePath = path.resolve(process.cwd(), configPath);
        if (!fs.existsSync(absolutePath)) {
            throw new Error(`El archivo tsconfig en ${absolutePath} no existe`);
        }

        const fileContent = fs.readFileSync(absolutePath, 'utf-8');
        try {
            return JSON.parse(fileContent);
        } catch (error: any) {
            throw new Error(`Error al parsear el archivo tsconfig en ${absolutePath}: ${error.message}`);
        }
    }
}
