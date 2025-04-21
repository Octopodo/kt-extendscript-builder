import path from 'path';
import fs from 'fs';
import baseConfigs from './configs.json';
import { BuildOptions } from '../../types';
import { OptionsParser } from '../options';
export class ConfigLoader {
    private _configurations: Record<string, Partial<BuildOptions>> = {};

    constructor() {
        this._configurations = this.parseConfig(baseConfigs);
    }
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
        this.parseConfig(JSON.parse(fileContent));
        return this._configurations;
    }

    private parseConfig(config: Record<string, any>): Record<string, Partial<BuildOptions>> {
        try {
            const parsedConfig: Partial<BuildOptions> = JSON.parse(JSON.stringify(config));
            this._configurations = { ...this._configurations, ...ConfigLoader.filter(parsedConfig) };
            return this._configurations;
        } catch (error: any) {
            console.warn(`Error parsing config: ${error.message}`);
            return {};
        }
    }

    getConfig(name: string = 'default'): Partial<BuildOptions> {
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
