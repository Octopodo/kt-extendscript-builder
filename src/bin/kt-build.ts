#!/usr/bin/env node
import { Builder } from '../lib/builder/Builder';

try {
    const builder = new Builder();

    // Run the builder with parsed commands and options
    builder.run().catch((error) => {
        console.error('Build failed:', error);
        process.exit(1);
    });
} catch (error) {
    console.error('Error in build process:', error);
    process.exit(1);
}
