# Protecting against Object Forgery

JSON.parse makes it easy to unintentionally turn untrustworthy strings
into untrustworthy objects which has led to problems when key pieces
of infrastructure are less suspicious of objects than of strings.

This monkeypatches `JSON.parse` and provides an `isParsedObject` function
that likely identifies objects that were parsed from strings that might
come from an untrusted source.

See [Protecting against Object Forgery"](https://medium.com/@mikesamuel/protecting-against-object-forgery-2d0fd930a7a9)

## Usage

```js
const isParsedObject = require('no-object-forgery');

if (isParsedObject(x)) {
  // Don't treat x as privileged.
}
```

----

This is not an official Google product.
