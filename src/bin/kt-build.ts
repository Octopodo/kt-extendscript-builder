#!/usr/bin/env node
import { Builder } from '../lib/builder/Builder';

try {
    const builder = new Builder();

    // Check if help was requested specifically for commands
    if (process.argv.includes('--help') && (process.argv.includes('commands') || process.argv.includes('--commands'))) {
        // Show available commands
        console.log('KT ExtendScript Builder - Available Commands\n');

        const commands = builder.listCommands();
        commands.forEach((cmd) => {
            console.log(`  ${cmd.name.padEnd(15)} - ${cmd.description}`);
        });

        console.log('\nUsage: kt-build [command1 command2 ...] [options]');
        console.log('\nCommands can be chained. Example: kt-build default test');
        console.log('This will first apply the default preset, then the test preset.');
        console.log('\nFor more options, use: kt-build --help');
        process.exit(0);
    }

    // Run the builder with parsed commands and options
    builder.run().catch((error) => {
        console.error('Build failed:', error);
        process.exit(1);
    });
} catch (error) {
    console.error('Error in build process:', error);
    process.exit(1);
}
