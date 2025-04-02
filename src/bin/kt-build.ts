import { Builder } from '../../src/lib/builder/Builder';

const builder = new Builder();
builder.run().catch((error) => {
    console.error('Build failed:', error);
    process.exit(1);
});
