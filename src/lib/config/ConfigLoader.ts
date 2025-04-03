import path from 'path';
import fs from 'fs';

import { BuildOptions } from '../../types';

export class ConfigLoader {
    constructor() {}

    load(options: Partial<Record<string, any>>) {
        let configPath = options.configPath;
        const absolutePath = path.resolve(process.cwd(), configPath);

        if (!fs.existsSync(absolutePath)) {
            throw new Error(`Config file not found: ${configPath}`);
        }

        const fileContent = fs.readFileSync(absolutePath, 'utf-8');
        try {
            return JSON.parse(fileContent);
        } catch (error: any) {
            throw new Error(`Error al parsear el archivo de configuración en ${absolutePath}: ${error.message}`);
        }
    }
}
