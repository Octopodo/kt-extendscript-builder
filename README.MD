# KT ExtendScript Builder

KT ExtendScript Builder is a specialized tool designed to simplify the process of transpiling TypeScript code to ExtendScript for Adobe Creative Cloud applications. Built on Vite, it provides a streamlined workflow for developing, building, and testing ExtendScript code. Thanks to this builder, you can use advanced TypeScript features like classes and inheritance in your ExtendScript projects, which are automatically transpiled to compatible ES3 code.

## Features

-   TypeScript to ExtendScript transpilation
-   ES3 target support for maximum compatibility with Adobe apps
-   Development and production build modes
-   Watch mode for real-time development
-   Command-line interface for easy integration into workflows
-   Custom ponyfills support for extending ExtendScript compatibility
-   Adobe application type definitions integration
-   Test-specific configuration support

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

| Option             | Alias | Description                         | Default       |
| ------------------ | ----- | ----------------------------------- | ------------- |
| --input            | -i    | Input file path                     | src/index.ts  |
| --output           | -o    | Output file path                    | dist/index.js |
| --test             | -t    | Build tests                         | false         |
| --watch            | -w    | Watch mode                          | false         |
| --mode             | -m    | Build mode (production/development) | production    |
| --clean            | -c    | Clean output directory before build | true          |
| --custom-ponyfills |       | Path to custom ponyfills file       |               |
| --dest-app         |       | Adobe app destination               |               |
| --app-version      |       | Adobe app version                   |               |

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
        "customPonyfills": "./my-ponyfills.ts",
        "destApp": "AfterEffects",
        "appVersion": "23.0"
    },
    "dev": {
        "mode": "development",
        "watch": true
    },
    "test": {
        "input": "src/tests/index.ts",
        "output": "dist.test/index.js",
        "test": true
    }
}
```

Then run with:

```bash
npx kt-build         # Uses default config
npx kt-build dev     # Uses dev config
npx kt-build test    # Uses test config
```

### Package.json Integration

You can easily integrate KT ExtendScript Builder into your npm scripts:

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

Then simply run with npm:

```bash
npm run build        # Production build
npm run dev          # Development mode with watching
npm run test         # Build tests
```

### Example: TypeScript to ExtendScript

Using the configuration above, here's a simple example of a TypeScript file and its transpiled output:

**TypeScript (src/index.ts):**

```typescript
class Greeting {
    private message: string;

    constructor(name: string) {
        this.message = 'Hello, ' + name + '!';
    }

    public show(): void {
        alert(this.message);
    }
}

// Create and use the greeting
const greeting = new Greeting('Adobe');
greeting.show();
```

**Transpiled ExtendScript (dist/index.js):**

```javascript
(function (thisObj) {
    //EXTENDSCRIPT INCLUDES, PONYFILLS AND BABEL HELPERS
    //......
    //------------------------------//
    var Greeting = (function () {
        function Greeting(name) {
            this.message = 'Hello, ' + name + '!';
        }
        Greeting.prototype.show = function () {
            alert(this.message);
        };
        return Greeting;
    })();

    // Create and use the greeting
    var greeting = new Greeting('Adobe');
    greeting.show();
    thisObj.KT = KT;
})(this);
```

### Custom Ponyfills

KT ExtendScript Builder supports custom ponyfills to enhance ExtendScript compatibility with modern JavaScript features. This functionality is inspired by and compatible with [Bolt CEP's ponyfill system](https://github.com/hyperbrew/bolt-cep?tab=readme-ov-file#custom-ponyfills).

To use custom ponyfills:

1. Create a TypesCript file exporting an array of ponyfill objects:

```javascript
// my-ponyfills.ts
export const ponyfills = [
    {
        find: 'Array.prototype.includes',
        replace: '__arrayIncludes',
        inject: `function __arrayIncludes(arr, item) { 
            for (var i = 0; i < arr.length; i++) { 
                if (arr[i] === item) return true; 
            } 
            return false; 
        }`
    },
    {
        find: 'String.prototype.startsWith',
        replace: '__stringStartsWith',
        inject: `function __stringStartsWith(str, search) { 
            return str.indexOf(search) === 0; 
        }`
    }
];
```

2. Specify the path to your ponyfills file:

```bash
npx kt-build --custom-ponyfills ./my-ponyfills.ts
```

Or in your `kt-config.json`:

```json
{
    "default": {
        "customPonyfills": "./my-ponyfills.ts"
    }
}
```

Each ponyfill object requires three properties:

-   `find`: The JavaScript feature to replace
-   `replace`: The function name to use instead
-   `inject`: The actual implementation code

Custom ponyfills are combined with built-in ones which already provide polyfills for common methods like `Object.create` and `Object.assign`.

### Adobe Application Type Definitions

You can specify which Adobe application and version to target for type definitions:

```bash
npx kt-build --dest-app AfterEffects --app-version 23.0
```

This will automatically include the appropriate type definitions in the TypeScript configuration when using the built-in templates.

## Testing Support

The builder provides enhanced support for testing ExtendScript code:

```bash
npx kt-build --test
```

When using the `--test` flag or a configuration with `"test": true`, the builder:

-   Uses a dedicated test-specific TypeScript template
-   Automatically adjusts input paths to target test files
-   Creates output in a separate test directory

You can use [KT Testing Suite](https://github.com/Octopodo/kt-testing-suite-core) since it is part of the KT ecosystem.

## Examples

### Basic Usage

```bash
# Build a project with default settings
npx kt-build

# Build with custom input and output
npx kt-build --input src/main.ts --output build/script.js

# Build in development mode with watch enabled
npx kt-build --mode development --watch

# Build with custom ponyfills
npx kt-build --custom-ponyfills ./path/to/ponyfills.js

# Build with Adobe application targeting
npx kt-build --dest-app Photoshop --app-version 24.0

# Build test files
npx kt-build --test
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
    customPonyfills: './path/to/ponyfills.js',
    destApp: 'Illustrator',
    appVersion: '27.0',
    test: false
});
```

## License

MIT
