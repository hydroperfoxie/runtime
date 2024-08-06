# To do list

- defineglobalnsalias()
- defineglobalvar()
- defineglobalvirtualvar()
- defineglobalmethod()

Constructor operations:

- [ ] construct

Property operations:

- [ ] getproperty
  - Number value
   - Inherit from instance definitions of Number class (including bound methods)
  - Boolean value
    - Inherit from instance definitions of Boolean class (including bound methods)
  - String value
    - Inherit from instance definitions of String class (including bound methods)
- [ ] callproperty
  - Apply any function with `this=base`
  - Different from getproperty, does not create bound methods inefficiently.
  - Consider calling ecmaprototype methods
- [ ] setproperty
  - Dictionary of weak keys does not accept any key.
  - Setting class static "prototype" results into error.
- [ ] deleteproperty
  - Dictionary of weak keys does not accept any key.
  - Deleting class static "prototype" results into error.
- [ ] getglobalproperty
- [ ] setglobalproperty
- [ ] callglobalproperty
- [ ] nameiterator
  - Dictionary of weak keys cannot be iterated as it holds a JavaScript WeakMap.
- [ ] valueiterator
  - Dictionary of weak keys cannot be iterated as it holds a JavaScript WeakMap.

Define the following ActionScript 3 classes and properties:

- [ ] `undefined`
- [ ] `NaN`
- [ ] `Infinity`
- [ ] `Object`
- [ ] `Class`
- [ ] `Function`
- [ ] `Namespace`
- [ ] `QName`
- [ ] `Number`
- [ ] `uint`
- [ ] `int`
- [ ] `float`
- [ ] `String`
- [ ] `Boolean`
- [ ] `Array`
- [ ] `Error`
- [ ] `ArgumentError`
- [ ] `DefinitionError`
- [ ] `EvalError`
- [ ] `RangeError`
- [ ] `ReferenceError`
- [ ] `SecurityError`
- [ ] `SyntaxError`
- [ ] `TypeError`
- [ ] `URIError`
- [ ] `VerifyError`
- [ ] `flash.utils.Dictionary`
- [ ] `__AS3__.vec.Vector`
- [ ] `__AS3__.vec.Vector$double`
- [ ] `__AS3__.vec.Vector$float`
- [ ] `__AS3__.vec.Vector$int`
- [ ] `__AS3__.vec.Vector$uint`

## E4X

Use the NPM package [`@xmldom/xmldom`](https://www.npmjs.com/package/@xmldom/xmldom) for the E4X implementation.

```ts
import { DOMParser, XMLSerializer } from "@xmldom/xmldom";

const source = `<xml xmlns="a">
	<child>test</child>
	<child/>
</xml>`;

const doc: XMLDocument = new DOMParser().parseFromString(source, "text/xml");

const serialized = new XMLSerializer().serializeToString(doc);
```