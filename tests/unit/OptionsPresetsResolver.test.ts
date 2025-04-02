import { describe, it, expect } from 'vitest';
import { OptionsPresetsResolver } from '../../src/lib/options/OptionsPresetsResolver';
import { presets } from '../../src/lib/options/optionsPresets';

import fs from 'fs';
import path from 'path';

describe('OptionsPresetsResolver', () => {
    it('should resolve a preset by name', () => {
        const resolver = new OptionsPresetsResolver();
        const presetName = 'build';
        const preset = resolver.resolvePreset(presetName);

        expect(preset).toEqual(presets[presetName]);
    });
    it('should resolve default preset as build preset', () => {
        const resolver = new OptionsPresetsResolver();
        const presetName = 'default';
        const preset = resolver.resolvePreset(presetName);

        const buildPreset = resolver.resolvePreset('build');
        expect(preset).toEqual(buildPreset);
    });

    it('should resolve default preset when an unknown preset name is provided', () => {
        const resolver = new OptionsPresetsResolver();
        const presetName = 'unknownPreset';
        const preset = resolver.resolvePreset(presetName);

        expect(preset).toEqual(presets['default']);
    });

    it('should load user presets from a JSON file', () => {
        const resolver = new OptionsPresetsResolver();
        const userConfigPath = path.resolve(__dirname, '..', 'fixtures', 'configs', 'kt.config.json');
        const userPresets = fs.readFileSync(userConfigPath, 'utf-8');
        const userConfig = JSON.parse(userPresets);

        resolver.getUserPresets(userConfigPath);

        const aePreset = resolver.resolvePreset('my-ae-preset');
        expect(aePreset).toEqual(userConfig['my-ae-preset']);

        const psPreset = resolver.resolvePreset('my-ps-preset');
        expect(psPreset).toEqual(userConfig['my-ps-preset']);
    });
});
