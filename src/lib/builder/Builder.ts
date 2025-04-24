import { BuildOptions } from '../../types';
import { OptionsResolver } from '../options';
import { createViteConfig } from '../config/createViteConfig';
import { createRollupConfig } from '../config/createRollupConfig';
import { ExtendedViteConfig } from '../../types';
import { defineConfig } from 'vite';
import { Cleaner } from './Cleaner';
import { OptionsParser } from '../options/OptionsParser';
/**
 * Main class of the build system.
 * Coordinates the build process with a simple and clear structure.
 */
export class Builder {
    private options: Partial<BuildOptions> = {};
    private viteConfig: ExtendedViteConfig = {} as ExtendedViteConfig;
    private optionsResolver: OptionsResolver;

    constructor() {
        this.optionsResolver = new OptionsResolver();
    }

    /**
     * Executes the build process with the configured options
     * This method executes the complete clean-build-clean process
     */
    async build(command?: string): Promise<void> {
        // If no options have been configured, we do it automatically
        if (Object.keys(this.options).length === 0) {
            this.options = this.optionsResolver.resolve(command);
        }

        try {
            // 1. Initial cleanup if needed
            await this.cleanIfNeeded('before');

            // 2. Build only if it's not an exclusive cleaning command
            const isCleanOnly = process.argv.includes('clean-only');
            if (!isCleanOnly) {
                // Configure Vite and Rollup
                const viteConfig = createViteConfig(this.options);
                viteConfig.extendScriptConfig = createRollupConfig(this.options);
                this.viteConfig = defineConfig(viteConfig);

                // Run build or watch according to configuration
                if (this.options.watch) {
                    await this.viteConfig.extendScriptConfig.watch();
                } else {
                    await this.viteConfig.extendScriptConfig.build();
                }
            }

            // 3. Final cleanup if needed
            await this.cleanIfNeeded('after');
        } catch (error) {
            console.error('Error during build process:', error);
            throw error;
        }
    }

    /**
     * Convenience method that combines configuration and build
     * To maintain compatibility with existing code
     */
    async run(): Promise<void> {
        const commands = OptionsParser.extractCommands();
        if (commands.length === 0) {
            await this.build();
        }
        for (const command of commands) {
            await this.build(command);
            this.resetOptions();
        }
    }

    /**
     * Determines if the directory should be cleaned based on the options
     */
    private shouldClean(stage: 'before' | 'after'): boolean {
        if (!this.options.clean) return false;

        // If it's a string, convert to array for uniform processing
        const cleanOption =
            typeof this.options.clean === 'string'
                ? [this.options.clean]
                : Array.isArray(this.options.clean)
                ? this.options.clean
                : [];

        // If 'false' was specified, don't clean anything
        if (cleanOption.includes('false')) return false;

        // Clean if 'both' or the specific stage was specified
        return cleanOption.includes('both') || cleanOption.includes(stage);
    }

    /**
     * Cleans the output directory if necessary according to the configuration
     */
    private async cleanIfNeeded(stage: 'before' | 'after'): Promise<void> {
        if (this.shouldClean(stage)) {
            console.log(`Starting cleanup (${stage})...`);
            await Cleaner.cleanDist(this.options);
        }
    }

    private resetOptions(): void {
        this.options = {};
        this.viteConfig = {} as ExtendedViteConfig;
        this.optionsResolver = new OptionsResolver();
    }
}
