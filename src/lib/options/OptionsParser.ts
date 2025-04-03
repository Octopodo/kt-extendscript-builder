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

        // Modify arguments to include --preset if the first argument is positional
        let modifiedArgs = [...userArgs];
        if (userArgs.length > 0 && !userArgs[0].startsWith('-')) {
            const presetValue = userArgs[0];
            // Add --preset <value> at the beginning of the arguments and remove the positional argument
            modifiedArgs = ['--preset', presetValue, ...userArgs.slice(1)];
        }

        // Create yargs instance with the modified arguments
        const argv = yargs(modifiedArgs);
        for (const option of KTBuilderOptions) {
            argv.option(option.name, option);
        }

        return argv.help().parse() as Partial<BuildOptions>;
    }

    static filter(options: Record<string, any>): Record<string, any> {
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
