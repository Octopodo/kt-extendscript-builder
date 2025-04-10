import { BuildOptions } from '../../types';
import { OptionsResolver, OptionsParser } from '../options';
import { createViteConfig } from '../config/createViteConfig';
import { createRollupConfig } from '../config/createRollupConfig';
import { ExtendedViteConfig } from '../../types';
import { defineConfig, build as viteBuild } from 'vite';
import { CommandRegistry } from '../commands/CommandRegistry';
import { baseCommands, type BaseCommand } from '../commands/BaseCommands';

export class Builder {
    private options: Partial<BuildOptions> = {};
    private viteConfig: ExtendedViteConfig = {} as ExtendedViteConfig;
    private commandRegistry: CommandRegistry;

    constructor(commandRegistry?: CommandRegistry) {
        // Initialize command registry with predefined commands
        this.commandRegistry = commandRegistry || new CommandRegistry();
        this.registerPredefinedCommands();
    }

    /**
     * Register all predefined commands
     */
    private registerPredefinedCommands(): void {
        for (const command of baseCommands) {
            this.commandRegistry.registerCommand(new command());
        }
    }

    /**
     * Runs the build process with the current configuration
     * Supports command chaining when commands are passed as positional arguments
     */
    async run(): Promise<void> {
        // Parse all CLI arguments, including commands and options
        const initialOptions = OptionsParser.parse();

        // Check if there are any commands in the positional arguments
        const commands = this.extractCommandsFromArgs();

        if (commands.length > 0) {
            console.log(`Found commands to execute: ${commands.join(', ')}`);

            // Execute each command sequentially
            for (const commandName of commands) {
                if (this.commandRegistry.hasCommand(commandName)) {
                    console.log(`Executing command: ${commandName}`);

                    // Get options for this specific command
                    const commandOptions = this.commandRegistry.executeCommand(commandName, {});

                    // Merge command options with CLI options
                    this.options = this.mergeOptionsWithPriority(commandOptions, initialOptions);

                    // Configure and run this specific build
                    await this.configureBuild();

                    if (this.options.watch) {
                        await this.watch();
                    } else {
                        await this.build();
                    }

                    console.log(`Command ${commandName} completed.`);
                } else {
                    console.warn(`Unknown command: ${commandName}, skipping`);
                }
            }

            return;
        } else {
            // No commands found, use traditional option resolution
            this.options = this.resolveOptionsTraditionally(initialOptions);

            // Configure and build
            await this.configureBuild();

            if (this.options.watch) {
                return this.watch();
            } else {
                return this.build();
            }
        }
    }

    /**
     * Extract command names from CLI arguments
     */
    private extractCommandsFromArgs(): string[] {
        const args = process.argv.slice(2);
        const commands: string[] = [];

        // Consider all arguments that don't start with '-' as potential commands
        for (const arg of args) {
            if (!arg.startsWith('-') && this.commandRegistry.hasCommand(arg)) {
                commands.push(arg);
            }
        }

        return commands;
    }

    /**
     * Merge options with priority handling
     */
    private mergeOptionsWithPriority(
        commandOptions: Partial<BuildOptions>,
        cliOptions: Partial<BuildOptions>
    ): Partial<BuildOptions> {
        // Remove command names from CLI options
        const cleanCliOptions = { ...cliOptions };
        const commands = this.extractCommandsFromArgs();

        // Resolve priority
        const priority = (cleanCliOptions.priority || 'cli').toLowerCase();

        if (priority === 'cli') {
            // CLI options override command options
            return { ...commandOptions, ...cleanCliOptions };
        } else {
            // Command options override CLI options except for explicit CLI flags
            return { ...cleanCliOptions, ...commandOptions };
        }
    }

    /**
     * Traditional option resolution for backward compatibility
     */
    private resolveOptionsTraditionally(initialOptions: Partial<BuildOptions>): Partial<BuildOptions> {
        const resolver = new OptionsResolver();
        return resolver.resolve(initialOptions);
    }

    /**
     * Configure the build based on resolved options
     */
    private async configureBuild(): Promise<void> {
        const viteConfig = createViteConfig(this.options);
        viteConfig.extendScriptConfig = createRollupConfig(this.options);

        this.viteConfig = defineConfig(viteConfig);
    }

    /**
     * Run the build process
     */
    build() {
        return this.viteConfig.extendScriptConfig.build();
    }

    /**
     * Run in watch mode
     */
    watch() {
        return this.viteConfig.extendScriptConfig.watch();
    }

    /**
     * Lists all available commands
     */
    listCommands() {
        return this.commandRegistry.getAllCommands();
    }
}
