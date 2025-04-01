import fs from 'fs';
import path from 'path';
import { BuildOptions, KTConfig } from './types';

export function loadConfig(configName?: string): Partial<BuildOptions> {
    const configPath = path.join(process.cwd(), 'kt-config.json');

    if (fs.existsSync(configPath)) {
        try {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf-8')) as KTConfig;

            // If a configuration name was specified, use that configuration
            if (configName && config[configName]) {
                console.log(`Using configuration "${configName}" from kt-config.json`);
                return config[configName];
            }

            // If default configuration exists, use it
            if (config.default) {
                console.log('Using "default" configuration from kt-config.json');
                return config.default;
            }
        } catch (error) {
            console.error('Error reading kt-config.json file:', error);
        }
    }

    return {};
}
