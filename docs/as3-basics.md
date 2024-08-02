# AS3 language basics

The ActionScript 3 environment is global, not an instantiable machine; therefore it is easy to declare or use its definitions.

The JavaScript elements within the `as3ns` namespace use either the hungarian or sneakcase naming convention.

## Declaring a class

A class is declared as follows for example:

```js
import { as3ns } from "./iron.js";

// package com.my.company (public, internal)
const publicns = as3ns.packagens("com.my.company");

// public class Main { var aField:Number; }
as3ns.defineclass(as3.name(publicns, "Main"), {}, [
    [as3ns.name(publicns, "aField"), as3ns.varslot({
        readonly: false,
        name: as3ns.name(publicns, "aField"),
        type: as3ns.numberclass(),
    })],
]);
```

The MXMLC compiler hoists all classes so one can refer to the other in whatever code piece.