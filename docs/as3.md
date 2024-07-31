# AS3

The ActionScript 3 environment is global, and not an instantiable machine, therefore it is easy to declare or use its definitions.

## Declaring a class

```js
// package com.my.company (public, internal)
const publicns = as3ns.packagens("com.my.company");

// public class Main { var aField:Number; }
as3ns.defineClass(as3.name(publicns, "Main"), [
    [as3ns.name(publicns, "aField"), as3ns.varSlot({
        readonly: false,
        name: as3ns.name(publicns, "aField"),
        type: as3ns.numberClass(),
    })],
]);
```