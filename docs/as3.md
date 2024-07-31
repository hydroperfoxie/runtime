# AS3

The ActionScript 3 environment is global, and not an instantiable machine, therefore it is easy to declare or use its definitions.

## Declaring a class

```
// package com.my.company (public, internal)
const publicNS = as3ns.packageNS("com.my.company");

// public class Main { var aField:Number; }
as3ns.defineClass(as3.name(publicNS, "Main"), [
    [as3ns.name(publicNS, "aField"), as3ns.varSlot({
        readonly: false,
        name: as3ns.name(publicNS, "aField"),
        type: as3ns.numberType(),
    })],
]);
```