# AS3 language basics

The ActionScript 3 environment is global, not an instantiable machine; therefore it is easy to declare or use its definitions.

The JavaScript elements within the `as3` namespace use either the hungarian or sneakcase naming convention.

## How instances are represented

An instance of a class is represented as a JavaScript `Array` whose first element is always an `as3.Class` object reference.

For dynamic classes including plain `Object`, the second element is always a plain JavaScript object (`{ }`) describing dynamic properties that may be read, assigned, and deleted; the following elements are the fixed variables.

For classes that are not dynamic, the second and consecutive elements are always the fixed variables.

## Primitive values

The Number, uint, int, and float data types are always represented as a normal JavaScript number.

The Boolean data type is always represented as a normal JavaScript boolean.

The String data type is always represented as a normal JavaScript string.

undefined is always represented as a normal JavaScript undefined value.

null is always represented as a normal JavaScript null value.

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