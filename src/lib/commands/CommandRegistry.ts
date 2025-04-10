import { BuildOptions } from '../../types';
import { Command, CommandManager } from './Command';

/**
 * Registry for managing available commands
 * Implements CommandManager interface
 */
export class CommandRegistry implements CommandManager {
    private commands = new Map<string, Command>();

    /**
     * Register a new command
     * @param command Command to register
     */
    registerCommand(command: Command): void {
        this.commands.set(command.name, command);
        console.log(`Command registered: ${command.name}`);
    }

    /**
     * Execute a specific command
     * @param commandName Name of the command to execute
     * @param options Current options to apply the command to
     * @returns Modified options after command execution
     */
    executeCommand(commandName: string, options: Partial<BuildOptions>): Partial<BuildOptions> {
        const command = this.commands.get(commandName);
        if (!command) {
            console.warn(`Command "${commandName}" not found`);
            return options;
        }

        console.log(`Executing command: ${command.name} - ${command.description}`);
        return command.execute(options);
    }

    /**
     * Get a command by name
     * @param name Name of the command to retrieve
     * @returns The requested command or undefined if not found
     */
    getCommand(name: string): Command | undefined {
        return this.commands.get(name);
    }

    /**
     * Check if a command exists by name
     * @param name Command name to check
     * @returns True if command exists, false otherwise
     */
    hasCommand(name: string): boolean {
        return this.commands.has(name);
    }

    /**
     * Get all registered commands
     * @returns Array of all commands
     */
    getAllCommands(): Command[] {
        return Array.from(this.commands.values());
    }
}
