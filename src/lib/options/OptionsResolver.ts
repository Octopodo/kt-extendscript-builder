import { BuildOptions, defaultBuildOptions } from '../../types';
import { OptionsRuleResolver } from './OptionsRuleResolver';
import { OptionsPresetsResolver } from './OptionsPresetsResolver';
import { ConfigLoader } from '../config/ConfigLoader';
/**
 * Manages the resolution of build options by merging defaults, presets, config files, and CLI arguments.
 *
 * The OptionsResolver determines the final build configuration based on:
 * - Default build options
 * - Named presets (if specified)
 * - Configuration file arguments
 * - Command-line arguments
 *
 * The priority of these sources can be controlled with the 'priority' flag. This flag only applies to the CLI arguments.
 */
export class OptionsResolver {
    /**
     * Collection of predefined option configurations that can be referenced by name
     * @private
     */
    private presets: Record<string, Partial<BuildOptions>> = {};

    /**
     * Resolves the final build options by merging various sources
     *
     * @param cliArgs - Command line arguments provided when running the build
     * @param configFileArgs - Arguments loaded from a configuration file
     * @returns Merged build options with all rules applied
     */
    resolve(cliArgs: Record<string, any>): Partial<BuildOptions> {
        const presetResolver = new OptionsPresetsResolver();
        presetResolver.getUserPresets(cliArgs['config-file']);
        const defaultPreset = presetResolver.resolvePreset('default');
        const userPreset = presetResolver.resolvePreset(cliArgs.preset || 'default');
        let options = { ...defaultBuildOptions, ...defaultPreset };

        // let testMode;
        // if (cliArgs.test) {
        //     testMode = true;
        // }

        const priority = cliArgs.priority.toLowerCase() || 'cli';

        if (priority === 'cli') {
            options = { ...defaultPreset, ...options, ...userPreset, ...cliArgs };
        } else {
            options = { ...defaultPreset, ...options, ...cliArgs, ...userPreset };
        }

        // options.test = testMode;

        options = this.resolveRules(options);
        return options;
    }

    /**
     * Applies additional transformation rules to the resolved options
     *
     * @param options - Partially resolved build options
     * @returns Build options after applying all transformation rules
     */
    resolveRules(options: Partial<BuildOptions>): Partial<BuildOptions> {
        const resolver = new OptionsRuleResolver();
        const preset = resolver.resolve({ ...options });
        return preset;
    }
}
