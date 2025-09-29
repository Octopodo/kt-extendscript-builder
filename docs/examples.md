# Examples

## TypeScript to ExtendScript Example

Here's a simple example of a TypeScript file and its transpiled output:

**TypeScript (src/index.ts):**

```typescript
class Greeting {
  private message: string;

  constructor(name: string) {
    this.message = "Hello, " + name + "!";
  }

  public show(): void {
    alert(this.message);
  }
}

// Create and use the greeting
const greeting = new Greeting("Adobe");
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
      this.message = "Hello, " + name + "!";
    }
    Greeting.prototype.show = function () {
      alert(this.message);
    };
    return Greeting;
  })();

  // Create and use the greeting
  var greeting = new Greeting("Adobe");
  greeting.show();
  thisObj.KT = KT;
})(this);
```

## Advanced Configuration Example

A more complex `kt-config.json` with multiple environments:

```json
{
  "default": {
    "input": "src/index.ts",
    "output": "dist/index.js",
    "mode": "production",
    "clean": true,
    "destApp": "AfterEffects",
    "appVersion": "23.0"
  },
  "dev": {
    "mode": "development",
    "watch": true,
    "output": "dist/dev.js"
  },
  "photoshop": {
    "destApp": "Photoshop",
    "appVersion": "24.0",
    "output": "dist/photoshop.js"
  },
  "test": {
    "input": "tests/index.ts",
    "output": "dist.test/index.js",
    "test": true,
    "mode": "development"
  }
}
```

## Custom Ponyfill Example

An example of a custom ponyfill for `Array.prototype.find`:

```typescript
// custom-ponyfills.ts
export const ponyfills = [
  {
    find: "Array.prototype.find",
    replace: "__arrayFind",
    inject: `function __arrayFind(arr, callback) {
      for (var i = 0; i < arr.length; i++) {
        if (callback(arr[i], i, arr)) {
          return arr[i];
        }
      }
      return undefined;
    }`,
  },
];
```

Then use it in your code:

```typescript
// Your TypeScript code
const numbers = [1, 2, 3, 4, 5];
const found = numbers.find((num) => num > 3); // Will be replaced with __arrayFind
```
