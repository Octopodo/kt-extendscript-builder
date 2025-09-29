# Usage

## Command Line Interface

KT ExtendScript Builder can be used directly from the command line:

```bash
npx kt-build [options]
```

### Basic Examples

```bash
# Build with default settings
npx kt-build

# Build in development mode with watch
npx kt-build --mode development --watch

# Build test files
npx kt-build --test

# Build with custom input and output
npx kt-build --input src/main.ts --output build/script.js
```

## Package.json Integration

Integrate KT ExtendScript Builder into your npm scripts for easier project management:

```json
{
  "name": "your-extendscript-project",
  "scripts": {
    "build": "kt-build",
    "dev": "kt-build dev",
    "test": "kt-build test",
    "clean": "kt-build --clean"
  },
  "devDependencies": {
    "kt-extendscript-builder": "^1.4.10"
  }
}
```

Then use npm commands:

```bash
npm run build        # Production build
npm run dev          # Development mode with watching
npm run test         # Build tests
```

## Programmatic Usage

You can also use KT ExtendScript Builder programmatically in your Node.js scripts:

```typescript
import { buildExtendScript } from "kt-extendscript-builder";

buildExtendScript({
  input: "src/index.ts",
  output: "dist/index.js",
  mode: "production",
  watch: false,
  clean: true,
  customPonyfills: "./path/to/ponyfills.js",
  destApp: "Illustrator",
  appVersion: "27.0",
  test: false,
});
```
