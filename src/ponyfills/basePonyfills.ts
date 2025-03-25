export const basePonyfills = [
  {
    find: 'Object.create',
    replace: '__objectCreate',
    inject: `function __objectCreate(proto) { function F() {}; F.prototype = proto; return new F(); };`
  },
  {
    find: 'Object.assign',
    replace: '__objectAssign',
    inject: `function __objectAssign(target, ...sources) { for (const source of sources) { for (const key in source) { target[key] = source[key]; } } return target; };`
  },
  {
    find: 'Object.defineProperty',
    replace: '__defineProperty',
    inject: `function __defineProperty(obj, prop, descriptor) { if (descriptor && descriptor.value !== undefined) { obj[prop] = descriptor.value; } return obj; };`
  }
];
