import { describe, expect, it } from 'vitest';
import { ConfigLoader } from '../../src/lib/config/ConfigLoader';
import path from 'path';
import fs from 'fs';
import baseConfigs from '../../src/lib/config/configs.json';
describe('ConfigLoader', () => {
    const userConfigPath = 'tests/fixtures/basic-project/kt.config.json';

    const configFile = path.resolve(userConfigPath);
    const configFileContent = fs.readFileSync(configFile, 'utf-8');
    const userConfig = { ...baseConfigs, ...JSON.parse(configFileContent) };
    const loader = new ConfigLoader();
    it('should load user config file', () => {
        const config = loader.load(userConfigPath);
        expect(config).toBeDefined();
        expect(config).toEqual(userConfig);
    });
    it("shouldn't break with no path", () => {
        const config = loader.load();
        expect(config).toBeDefined();
        expect(config).toEqual({});
    });
});
