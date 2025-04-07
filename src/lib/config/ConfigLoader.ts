import path from 'path';
import fs from 'fs';

import { BuildOptions } from '../../types';
import { OptionsParser } from '../options';
export class ConfigLoader {
    private _configurations: Record<string, Partial<BuildOptions>> = {};
    load(configPath?: string): Record<string, Partial<BuildOptions>> {
        if (!configPath) {
            configPath = 'kt.config.json';
        }
        const absolutePath = path.resolve(process.cwd(), configPath);
        let config: Record<string, any> = {};
        if (!fs.existsSync(absolutePath)) {
            console.warn(`${absolutePath} config file does not exist. Skiping...`);
            return {};
        }

        const fileContent = fs.readFileSync(absolutePath, 'utf-8');
        try {
            config = JSON.parse(fileContent);
            this._configurations = { ...this._configurations, ...ConfigLoader.filter(config) };
            return this._configurations;
        } catch (error: any) {
            console.warn(`Error al parsear el archivo de configuración en ${absolutePath}: ${error.message}`);
            return {};
        }
    }

    getConfig(name: string): Partial<BuildOptions> {
        const config = this._configurations[name];
        if (!config) {
            console.warn(`No se encontró la configuración "${name}" en el archivo de configuración.`);
            return {};
        }
        return config;
    }

    private static filter(configurations: Record<string, any>): Record<string, Partial<BuildOptions>> {
        const filteredConfig: Record<string, Partial<BuildOptions>> = {};

        for (const key in configurations) {
            const config = OptionsParser.filter(configurations[key]);
            if (config) {
                const configName = key;
                filteredConfig[configName] = config;
            }
        }

        return filteredConfig;
    }
}
