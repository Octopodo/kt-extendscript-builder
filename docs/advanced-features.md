# Advanced Features

## Custom Ponyfills

KT ExtendScript Builder supports custom ponyfills to enhance ExtendScript compatibility with modern JavaScript features. This functionality is inspired by and compatible with [Bolt CEP's ponyfill system](https://github.com/hyperbrew/bolt-cep?tab=readme-ov-file#custom-ponyfills).

### Creating Custom Ponyfills

Create a TypeScript file exporting an array of ponyfill objects:

```typescript
// my-ponyfills.ts
export const ponyfills = [
  {
    find: "Array.prototype.includes",
    replace: "__arrayIncludes",
    inject: `function __arrayIncludes(arr, item) {
      for (var i = 0; i < arr.length; i++) {
        if (arr[i] === item) return true;
      }
      return false;
    }`,
  },
  {
    find: "String.prototype.startsWith",
    replace: "__stringStartsWith",
    inject: `function __stringStartsWith(str, search) {
      return str.indexOf(search) === 0;
    }`,
  },
];
```

### Using Custom Ponyfills

Specify the path to your ponyfills file via command line:

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

- `find`: The JavaScript feature to replace
- `replace`: The function name to use instead
- `inject`: The actual implementation code

Custom ponyfills are combined with built-in ones which already provide polyfills for common methods like `Object.create` and `Object.assign`.

## Adobe Application Type Definitions

You can specify which Adobe application and version to target for type definitions:

```bash
npx kt-build --dest-app AfterEffects --app-version 23.0
```

This will automatically include the appropriate type definitions in the TypeScript configuration when using the built-in templates.

Supported Adobe applications include After Effects, Photoshop, Illustrator, and others.

## Testing Support

The builder provides enhanced support for testing ExtendScript code:

```bash
npx kt-build --test
```

When using the `--test` flag or a configuration with `"test": true`, the builder:

- Uses a dedicated test-specific TypeScript template
- Automatically adjusts input paths to target test files
- Creates output in a separate test directory

You can use [KT Testing Suite](https://github.com/Octopodo/kt-testing-suite-core) since it is part of the KT ecosystem.
