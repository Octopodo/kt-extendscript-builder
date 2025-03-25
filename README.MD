# KT ExtendScript Builder

KT ExtendScript Builder is a specialized tool designed to simplify the process of transpiling TypeScript code to ExtendScript for Adobe Creative Cloud applications. Built on Vite, it provides a streamlined workflow for developing, building, and testing ExtendScript code.

## Features

- TypeScript to ExtendScript transpilation
- ES3 target support for maximum compatibility with Adobe apps
- Development and production build modes
- Watch mode for real-time development
- Built-in TypeScript templates for quick setup
- Support for custom TypeScript configurations
- Command-line interface for easy integration into workflows

## Installation

```bash
npm install kt-extendscript-builder --save-dev
```

## Usage

### Command Line Interface

KT ExtendScript Builder can be used directly from the command line:

```bash
npx kt-build [options]
```

### Options

| Option         | Alias | Description                         | Default       |
| -------------- | ----- | ----------------------------------- | ------------- |
| --input        | -i    | Input file path                     | src/index.ts  |
| --output       | -o    | Output file path                    | dist/index.js |
| --test         | -t    | Build tests                         | false         |
| --watch        | -w    | Watch mode                          | false         |
| --mode         | -m    | Build mode (production/development) | production    |
| --tsconfig     |       | Path to custom tsconfig file        |               |
| --use-template |       | Use built-in tsconfig template      | false         |
| --clean        | -c    | Clean output directory before build | true          |

### Configuration File

You can also create a `kt-config.json` file in your project root to define different build configurations:

```json
{
  "default": {
    "input": "src/index.ts",
    "output": "dist/index.js",
    "mode": "production",
    "watch": false,
    "clean": true,
    "useTemplateTsconfig": true
  },
  "dev": {
    "mode": "development",
    "watch": true
  },
  "test": {
    "input": "src/tests/index.ts",
    "output": "dist.test/index.js",
    "tsconfig": "tsconfig.tests.json"
  }
}
```

Then run with:

```bash
npx kt-build         # Uses default config
npx kt-build dev     # Uses dev config
npx kt-build test    # Uses test config
```

### TypeScript Configuration

KT ExtendScript Builder provides built-in TypeScript templates specifically configured for ExtendScript compatibility. These templates target ES3 and include the necessary type definitions for Adobe Creative Cloud applications.

You can use these templates by setting the `useTemplateTsconfig` option to `true`, or by creating your own tsconfig file based on the provided templates:

```json
{
  "compilerOptions": {
    "target": "ES3",
    "module": "CommonJS",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "lib": [],
    "sourceMap": true,
    "types": [
      "kt-core/src/lib/json2",
      "types-for-adobe/shared/global",
      "types-for-adobe/shared/JavaScript"
    ]
  },
  "include": ["src"]
}
```

## Examples

### Basic Usage

```bash
# Build a project with default settings
npx kt-build

# Build with custom input and output
npx kt-build --input src/main.ts --output build/script.js

# Build in development mode with watch enabled
npx kt-build --mode development --watch
```

### Programmatic Usage

You can also use KT ExtendScript Builder programmatically in your Node.js scripts:

```typescript
import { buildExtendScript } from 'kt-extendscript-builder';

buildExtendScript({
  input: 'src/index.ts',
  output: 'dist/index.js',
  mode: 'production',
  watch: false,
  clean: true,
  useTemplateTsconfig: true
});
```

## License

MIT
