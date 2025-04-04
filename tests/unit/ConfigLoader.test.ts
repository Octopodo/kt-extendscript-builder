import { describe, expect, it } from 'vitest';
import { ConfigLoader } from '../../src/lib/config/ConfigLoader';
import path from 'path';
import fs from 'fs';

describe('ConfigLoader', () => {
    const baseConfigPath = 'tests/fixtures/basic-project/kt.config.json';
    const configFile = path.resolve(baseConfigPath);
    const configFileContent = fs.readFileSync(configFile, 'utf-8');
    const baseConfig = JSON.parse(configFileContent);
    const loader = new ConfigLoader();
    it('should load user config file', () => {
        const config = loader.load(baseConfigPath);
        expect(config).toBeDefined();
        expect(config).toEqual(baseConfig);
    });
    it("shouldn't break with no path", () => {
        const config = loader.load();
        expect(config).toBeDefined();
        expect(config).toEqual({});
    });
});
