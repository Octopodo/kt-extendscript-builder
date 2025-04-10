import { BuildOptions } from '../../types';
import { BaseCommand } from './BaseCommands';
import { presets } from '../options/optionsPresets';
import { ConfigLoader } from '../config/ConfigLoader';
import { CommandRegistry } from './CommandRegistry';
import path from 'path';

/**
 * Class responsible for generating commands dynamically from presets and config files
 */
export class CommandGenerator {
    /**
     * Register all commands based on presets and config file
     *
     * @param commandRegistry The registry where commands will be registered
     * @param configPath Optional path to the config file (default: kt.config.json)
     */
    static registerAllCommands(commandRegistry: CommandRegistry, configPath?: string): void {
        // Register predefined commands from presets first (they have priority)
        this.registerPresetCommands(commandRegistry);

        // Then register commands from config file
        this.registerConfigFileCommands(commandRegistry, configPath);
    }

    /**
     * Registers commands based on presets from optionsPresets.ts
     *
     * @param commandRegistry The registry where commands will be registered
     */
    private static registerPresetCommands(commandRegistry: CommandRegistry): void {
        for (const [presetName, presetOptions] of Object.entries(presets)) {
            // Skip 'default' preset as it's just an alias
            if (presetName === 'default') continue;

            // Create a command for each preset
            const command = new BaseCommand(presetName, `Build with ${presetName} preset settings`, presetOptions);

            commandRegistry.registerCommand(command);
        }
    }

    /**
     * Registers commands based on configurations in kt.config.json
     *
     * @param commandRegistry The registry where commands will be registered
     * @param configPath Optional path to the config file
     */
    private static registerConfigFileCommands(commandRegistry: CommandRegistry, configPath?: string): void {
        const configLoader = new ConfigLoader();
        const configurations = configLoader.load(configPath);

        for (const [configName, configOptions] of Object.entries(configurations)) {
            // Skip if a command with this name already exists
            if (commandRegistry.hasCommand(configName)) {
                console.log(`A command with name '${configName}' already exists. Skipping...`);
                continue;
            }

            // Create a command for this configuration
            const command = new BaseCommand(
                configName,
                `Build with '${configName}' configuration from kt.config.json`,
                configOptions
            );

            commandRegistry.registerCommand(command);
        }
    }
}
