import { BuildOptions, defaultBuildOptions } from '../../types';
import { OptionsRuleResolver } from './OptionsRuleResolver';
import { ConfigLoader } from '../config/ConfigLoader';
import { OptionsParser } from './OptionsParser';

/**
 * Centralizes the management and resolution of options by combining all possible sources.
 *
 * OptionsResolver determines the final configuration based on:
 * - Default options
 * - Presets (if specified)
 * - Configuration file options
 * - Command line options
 * - Specific command options
 */
export class OptionsResolver {
    private rulesResolver: OptionsRuleResolver;
    private configLoader: ConfigLoader;

    constructor() {
        this.rulesResolver = new OptionsRuleResolver();
        this.configLoader = new ConfigLoader();
    }

    /**
     * Resolves and combines all options from all possible sources
     *
     * @param cliOptions - Options passed via command line (optional)
     * @returns Final combined options with all rules applied
     */
    resolve(command?: string): Partial<BuildOptions> {
        // If CLI options are not provided, get them from the parser
        const options = OptionsParser.parse();

        // 1. Load configurations from the configuration file
        const configPath = options['config-file'] as string;

        this.configLoader.load(configPath);

        // 2. Initialize command processor

        // 3. Load preset configuration

        // 4. Extract commands from arguments

        // 5. Process command options (if they exist)
        let commandOptions = {};

        // 6. Determine which preset to use
        const presetName = options.preset || 'default';

        // 7. Resolve presets
        const userPreset = this.configLoader.getConfig(command) || {};
        const defaultPreset = this.configLoader.getConfig('default') || {};

        // 8. Start with base options
        let mergedOptions = { ...defaultBuildOptions, ...defaultPreset };

        // 9. Determine priority for combination
        const priority = ((options.priority || 'cli') as string).toLowerCase();

        // 10. Combine all options according to priority
        if (priority === 'cli') {
            // CLI has highest priority
            mergedOptions = {
                ...mergedOptions,
                ...userPreset,
                ...commandOptions,
                ...options
            };
        } else {
            // Preset or commands have highest priority
            mergedOptions = {
                ...mergedOptions,
                ...options,
                ...commandOptions,
                ...userPreset
            };
        }

        // 11. Apply transformation rules
        return this.rulesResolver.resolve(mergedOptions);
    }
}
