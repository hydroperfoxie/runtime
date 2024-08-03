# AS3 language basics

The ActionScript 3 environment is global, not an instantiable machine; therefore it is easy to declare or use its definitions.

The JavaScript elements within the `as3` namespace use either the hungarian or sneakcase naming convention.

## How instances are represented

An instance of a class is represented as a JavaScript `Array` whose first element is always an `as3.Class` object reference.

For dynamic classes including plain `Object`, the second element is always a `Map<any, any>` describing dynamic properties that may be read, assigned, and deleted; the elements that follow are the fixed variables.

For classes that are not dynamic, the second and consecutive elements are always the fixed variables.

## Primitive values

The Number, uint, int, and float data types are always represented as normal JavaScript numbers.

The Boolean data type is always represented as a normal JavaScript boolean.

The String data type is always represented as a normal JavaScript string.

undefined is always represented as a normal JavaScript undefined value.

null is always represented as a normal JavaScript null value.

## Top level package

The top level package consists of the full name as equivalent to the empty string **""**.

## Declaring a class

A class is declared as follows for example:

```js
import { as3 } from "./iron.js";

// package com.my.company (public, internal)
const publicns = as3.packagens("com.my.company");

// public class C1 { public var x:Number; }
as3.defineclass(as3.name(publicns, "C1"),
    { /* class options */ },
    [
        [ as3.name(publicns, "x"), as3.variable({ type: as3.numberclass() }) ],
    ]
);
```

The MXMLC compiler hoists all classes so one can refer to the other in whatever code piece.

The order in which you define variables is sensitive as it determines the slot number in the instance `Array` (the first one is either slot number 1 or slot number 2 if the class is dynamic).

## Declaring a variable inside a package

```js
import { as3 } from "./iron.js";

// package com.my.company { public var x:*; }
const publicns = as3.packagens("com.my.company");
as3.definepackagevar(publicns, "x", { type: null });
```

## Virtual variables

Virtual variables consisting of a getter and a setter are expressed by the term "virtualvar".

## Methods

Any function or method is expressed by the term "method".

## Namespace aliases

Any `namespace ans;` directive results in what is expressed by the term "nsalias". Normally namespaces are represented by `as3.Ns`, but when they are seen as properties, they are `as3.Nsalias`.

## Constructor

The constructor of a class is assigned by the `ctor` option, which is responsible for manually invoking the constructor of the base class (the `super();` statement).