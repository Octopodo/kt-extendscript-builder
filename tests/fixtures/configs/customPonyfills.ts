export const customPonyfills = [
    {
        find: 'Array.prototype.includes',
        replace: '__arrayIncludes',
        inject: `function __arrayIncludes(arr, item) { var result = false; for (var i = 0; i < arr.length; i++) { if (arr[i] === item) { result = true; break; } } return result; }`
    },
    {
        find: 'String.prototype.includes',
        replace: '__stringIncludes',
        inject: `function __stringIncludes(str, search) { var result = false; for (var i = 0; i < str.length; i++) { if (str[i] === search) { result = true; break; } } return result; }`
    },
    {
        find: 'Array.prototype.find',
        replace: '__arrayFind',
        inject: `function __arrayFind(arr, predicate) { for (var i = 0; i < arr.length; i++) { if (predicate(arr[i], i, arr)) { return arr[i]; } } return undefined; }`
    }
];
