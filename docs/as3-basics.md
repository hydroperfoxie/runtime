# AS3 language basics

The ActionScript 3 environment is global, not an instantiable machine; therefore it is easy to declare or use its definitions.

The JavaScript elements within the `as3` namespace use either the hungarian or sneakcase naming convention.

## Declaring a class

A class is declared as follows for example:

```js
import { as3 } from "./iron.js";

// package com.my.company (public, internal)
const publicns = as3.packagens("com.my.company");

// public class Main { var aField:Number; }
as3.defineclass(as3.globalnames, as3.name(publicns, "Main"),
{
    // base class=?
    // dynamic?
    // final?
    // metadata=?
},
[
    [as3.name(publicns, "aField"), as3.variable({
        readonly: false,
        name: as3.name(publicns, "aField"),
        type: as3.numberclass(),
    })],
]);
```

The MXMLC compiler hoists all classes so one can refer to the other in whatever code piece.

Never define a class manually as `as3.defineclass` will decide variable slots (including these of the base class); that is, do not invoke `new as3.Class` to assign it to a `Names` object later.