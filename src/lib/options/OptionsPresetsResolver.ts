import { presets } from './optionsPresets';
import { BuildOptions } from '../types';
import path from 'path';
import fs from 'fs';
/**
 * Class responsible for resolving preset build options.
 *
 * This class maintains a collection of named preset configurations that can be
 * applied to build options. Each preset is a partial specification of BuildOptions
 * that can be retrieved by name.
 */
export class OptionsPresetsResolver {
    /**
     * Map of preset names to their corresponding partial build options
     */
    private presets: Record<string, Partial<BuildOptions>> = {};

    /**
     * Initializes a new instance of the OptionsPresetsResolver class
     * with predefined presets.
     */
    constructor() {
        this.presets = presets;
    }

    /**
     * Retrieves a preset by name
     *
     * @param presetName - The name of the preset to retrieve
     * @returns The partial build options corresponding to the requested preset
     * @throws Error if the specified preset name is not found
     */
    resolvePreset(presetName: string): Partial<BuildOptions> {
        const preset = this.presets[presetName];
        if (!preset) {
            return this.presets['default'];
        }
        return preset;
    }

    getUserPresets(userConfigPath: string): void {
        const userPresets: Record<string, Partial<BuildOptions>> = {};
        const userPresetsPath = path.resolve(process.cwd(), userConfigPath);
        if (fs.existsSync(userPresetsPath)) {
            const content = fs.readFileSync(userPresetsPath, 'utf-8');
            const config = JSON.parse(content);
            for (const [key, value] of Object.entries(config)) {
                const preset = value as Partial<BuildOptions>;
                if (preset) {
                    this.presets[key] = preset;
                }
            }
        }
    }
}
