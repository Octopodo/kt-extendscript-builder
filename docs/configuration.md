# Configuration

## Command Line Options

KT ExtendScript Builder supports various command-line options to customize the build process:

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

## Configuration File

For more complex projects, you can create a `kt-config.json` file in your project root to define multiple build configurations:

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

You can then run specific configurations:

```bash
npx kt-build         # Uses default config
npx kt-build dev     # Uses dev config
npx kt-build test    # Uses test config
```

## TypeScript Configuration

The builder automatically generates appropriate TypeScript configurations based on your settings. For advanced customization, you can provide your own `tsconfig.json` file. The builder will use it as a base and apply necessary modifications for ExtendScript compatibility.
