import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { BuildOptions } from '../../types';
import { KTBuilderOptions } from './KTBuilderOptions';
/**
 * A class responsible for collecting build options from command line arguments.
 * It uses the yargs library to parse command line arguments based on predefined KTBuilderOptions.
 */
export class OptionsParser {
    /**
     * Parses build options from the command line arguments.
     *
     * This method:
     * 1. Creates a yargs instance with the process arguments (excluding the first two)
     * 2. Registers all KTBuilderOptions with the yargs instance
     * 3. Enables the help command and parses the arguments
     *
     * @returns A partial BuildOptions object containing the parsed command line options
     */
    static parse(): Partial<BuildOptions> {
        const userArgs = hideBin(process.argv);

        // Filter out command arguments (non-flag arguments)
        // These will be handled by the CommandRegistry
        const flagArgs = userArgs.filter((arg, index) => {
            if (arg.startsWith('-')) return true;

            // If previous arg is a flag param that expects a value, keep this arg
            if (index > 0 && userArgs[index - 1].startsWith('-') && !userArgs[index - 1].includes('=')) return true;

            // Check if this is a subsequent value for an array option
            // Look for the parameter name in KTBuilderOptions to check if it's an array type
            if (index > 1) {
                const prevArg = userArgs[index - 1];
                const prevArgIsValue = !prevArg.startsWith('-');
                const paramNameIndex = prevArgIsValue ? index - 2 : index - 1;

                if (paramNameIndex >= 0) {
                    const paramName = userArgs[paramNameIndex].replace(/^--?/, '');
                    const option = KTBuilderOptions.find((opt) => opt.name === paramName || opt.alias === paramName);
                    if (option && option.type === 'array' && prevArgIsValue) return true;
                }
            }

            // Otherwise it's potentially a command
            return false;
        });

        // Create yargs instance with filtered arguments
        const argv = yargs(flagArgs);
        for (const option of KTBuilderOptions) {
            argv.option(option.name, option);
        }

        return argv.help().parse() as Partial<BuildOptions>;
    }

    /**
     * Filter an object to only include properties that are valid BuildOptions
     * @param options An object with potential additional properties
     * @returns An object containing only valid BuildOptions properties
     */
    static filter(options: Record<string, any>): Partial<BuildOptions> {
        const validOptions = KTBuilderOptions.map((option) => option.name);
        const filteredOptions: Partial<BuildOptions> = {};
        for (const key in options) {
            const option = key as keyof BuildOptions;
            if (validOptions.includes(option)) {
                filteredOptions[option] = options[key];
            }
        }

        return filteredOptions;
    }
}
