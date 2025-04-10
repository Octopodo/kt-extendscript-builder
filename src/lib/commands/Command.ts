import { BuildOptions } from '../../types';

/**
 * Interface for command pattern implementation in KT-ExtendScript-Builder
 * Each command encapsulates a specific build operation
 */
export interface Command {
    /**
     * Unique name to identify this command
     */
    readonly name: string;

    /**
     * Description of what this command does
     */
    readonly description: string;

    /**
     * Options that this command will apply when executed
     */
    readonly options: Partial<BuildOptions>;

    /**
     * Execute any additional actions before build
     * @param options Current build options being used
     * @returns Modified build options
     */
    execute(options: Partial<BuildOptions>): Partial<BuildOptions>;
}

/**
 * Interface for a command manager that handles command registration and execution
 */
export interface CommandManager {
    /**
     * Register a new command
     * @param command Command to register
     */
    registerCommand(command: Command): void;

    /**
     * Execute a specific command
     * @param commandName Name of the command to execute
     * @param options Current options to apply the command to
     * @returns Modified options
     */
    executeCommand(commandName: string, options: Partial<BuildOptions>): Partial<BuildOptions>;

    /**
     * Check if a command exists by name
     * @param name Command name to check
     */
    hasCommand(name: string): boolean;

    /**
     * Get all available commands
     */
    getAllCommands(): Command[];
}
