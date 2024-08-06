import { assert, FlexVector } from "./util";

const CONSTRUCTOR_INDEX = 0;

const DYNAMIC_PROPERTIES_INDEX = 1;

const ARRAY_SUBARRAY_INDEX = DYNAMIC_PROPERTIES_INDEX + 1;

const VECTOR_SUBARRAY_INDEX = 1;
const VECTOR_FIXED_INDEX = VECTOR_SUBARRAY_INDEX + 1;

const DICTIONARY_PROPERTIES_INDEX = 1;

const CLASS_CLASS_INDEX = 1;

const NAMESPACE_PREFIX_INDEX = 1;
const NAMESPACE_URI_INDEX = 2;

const QNAME_URI_INDEX = 1;
const QNAME_LOCALNAME_INDEX = 2;

const FUNCTION_FUNCTION_INDEX = 1;

export abstract class Ns
{
    abstract toString(): string;

    ispublicns(): boolean
    {
        return this instanceof Systemns && this.kind == Systemns.PUBLIC;
    }

    ispublicorinternalns(): boolean
    {
        return this instanceof Systemns && (this.kind == Systemns.PUBLIC || this.kind == Systemns.INTERNAL);
    }
}

export class Systemns extends Ns
{
    static INTERNAL = 0;
    static PUBLIC = 1;
    static PRIVATE = 2;
    static PROTECTED = 3;
    static STATIC_PROTECTED = 4;

    kind: number = Systemns.INTERNAL;

    /**
     * Nullable reference to an ActionScript package or class.
     */
    parent: Object | null = null;

    constructor(kind: number, parent: Object | null)
    {
        super();
        this.kind = kind;
        this.parent = parent;
    }

    override toString(): string {
        return "namespace://actionscript.net/system";
    }
}

export class Userns extends Ns
{
    uri: string = "";

    constructor(uri: string)
    {
        super();
        this.uri = uri;
    }

    override toString(): string {
        return this.uri;
    }
}

export class Explicitns extends Ns
{
    uri: string = "";

    constructor(uri: string)
    {
        super();
        this.uri = uri;
    }

    override toString(): string {
        return this.uri;
    }
}

export class Package
{
    /**
     * Full name
     */
    readonly name: string;
    readonly publicns: Systemns = new Systemns(Systemns.PUBLIC, null);
    readonly internalns: Systemns = new Systemns(Systemns.INTERNAL, null);
    readonly names: Names = new Names();
    readonly varvals: Map<Variable, any> = new Map();

    /**
     * @param name Full name
     */
    constructor(name: string) 
    {
        this.name = name;
        this.publicns.parent = this;
        this.internalns.parent = this;
    }
}

const packages = new Map<string, Package>();

/**
 * Retrieves the `public` namespace of a package.
 */
export function packagens(name: string): Ns
{
    if (packages.has(name))
    {
        return packages.get(name)!.publicns;
    }
    const p = new Package(name);
    packages.set(name, p);
    return p.publicns;
}

/**
 * Retrieves the `internal` namespace of a package.
 */
export function packageinternalns(name: string): Ns
{
    if (packages.has(name))
    {
        return packages.get(name)!.internalns;
    }
    const p = new Package(name);
    packages.set(name, p);
    return p.internalns;
}

export class Name
{
    ns: Ns;
    name: string;

    constructor(ns: Ns, name: string)
    {
        this.ns = ns;
        this.name = name;
    }

    toString(): string
    {
        if (this.ns instanceof Userns)
        {
            return this.ns.uri + ":" + this.name;
        }
        else if (this.ns instanceof Explicitns)
        {
            return this.ns.uri + ":" + this.name;
        }
        else
        {
            return this.name;
        }
    }
}

export function name(ns: Ns, name: string): Name
{
    return new Name(ns, name);
}

/**
 * Mapping from (*ns*, *name*) to a trait object.
 */
export class Names
{
    private readonly m_dict: Map<Ns, Map<string, any>> = new Map<Ns, Map<string, any>>();

    constructor()
    {
    }
    
    dictionary(): Map<Name, any>
    {
        const result = new Map<Name, any>();
        for (const [ns, names] of this.m_dict)
        {
            for (const [name, trait] of names)
            {
                result.set(new Name(ns, name), trait);
            }
        }
        return result;
    }
    
    hasnsname(ns: Ns, name: string): boolean
    {
        return this.m_dict.get(ns)?.has(name) ?? false;
    }

    hasnssetname(nsset: Ns[], name: string): boolean
    {
        for (const ns of nsset)
        {
            const result = ns.ispublicns() ? this.haspublicname(name) : this.hasnsname(ns, name);
            if (result)
            {
                return result;
            }
        }
        return false;
    }

    haspublicname(name: string): boolean
    {
        for (const [ns, names] of this.m_dict)
        {
            if (ns instanceof Systemns && ns.kind == Systemns.PUBLIC)
            {
                return names.has(name) ?? false;
            }
        }
        return false;
    }
    
    getnsname(ns: Ns, name: string): any
    {
        return this.m_dict.get(ns)?.get(name) ?? null;
    }

    getnssetname(nsset: Ns[], name: string): any
    {
        for (const ns of nsset)
        {
            const result = ns.ispublicns() ? this.getpublicname(name) : this.getnsname(ns, name);
            if (result !== null)
            {
                return result;
            }
        }
        return null;
    }
    
    getpublicname(name: string): any
    {
        for (const [ns, names] of this.m_dict)
        {
            if (ns instanceof Systemns && ns.kind == Systemns.PUBLIC)
            {
                const result = names.get(name) ?? null;
                if (result !== null)
                {
                    return result;
                }
            }
        }
        return null;
    }

    setnsname(ns: Ns, name: string, trait: any): void
    {
        let names = this.m_dict.get(ns) ?? null;
        if (names === null)
        {
            names = new Map<string, any>();
            this.m_dict.set(ns, names);
        }
        names.set(name, trait);
    }
}

/**
 * Encodes certain details of a class.
 * 
 * An instance of a class is an Array object
 * whose first element is a reference to the Class object
 * corresponding to that class, and is used for computing
 * the `constructor` property.
 * 
 * An instance of a dynamic class will have the second element
 * as a Map<any, any> object containing dynamic properties.
 */
export class Class
{
    baseclass: any = null;
    interfaces: Interface[] = [];

    /**
     * Fully package qualified name.
     */
    name: string;
    final: boolean;
    dynamic: boolean;
    metadata: Metadata[];
    ctor: Function;

    readonly staticnames: Names = new Names();
    readonly ecmaprototype: any = {};
    readonly prototypenames: Names = new Names();

    readonly staticvarvals: Map<Variable, any> = new Map();

    /**
     * Sequence of instance variables.
     * 
     * If the class is not dynamic, the first Variable element
     * identifies the slot number 1 of the instance Array;
     * if the class is dynamic, the first Variable element identifies
     * the slot number 2 of the instance Array.
     */
    prototypevarslots: Variable[] = [];

    constructor(name: string, final: boolean, dynamic: boolean, metadata: Metadata[], ctor: Function)
    {
        this.name = name;
        this.final = final;
        this.dynamic = dynamic;
        this.metadata = metadata;
        this.ctor = ctor;
    }

    recursivedescclasslist(): Class[]
    {
        const result: Class[] = [this];
        if (this.baseclass !== null)
        {
            result.push.apply(result, this.baseclass!.recursivedescclasslist());
        }
        return result;
    }
}

export type ClassOptions =
{
    extendslist?: any,
    implementslist?: Interface[],
    final?: boolean,
    dynamic?: boolean,
    metadata?: Metadata[],
    ctor?: Function,
};

export function defineclass(name: Name, options: ClassOptions, items: [Name, any][]): Class
{
    let finalname = "";
    if (name.ns instanceof Systemns && name.ns.parent instanceof Package)
    {
        finalname = name.ns.parent.name + "." + name.name;
    }

    const class1 = new Class(finalname, options.final ?? false, options.dynamic ?? false, options.metadata ?? [], options.ctor ?? function() {});

    // Extend class
    class1.baseclass = options.extendslist ?? null;

    // Implement interfaces
    class1.interfaces = options.implementslist ?? [];

    // Define items
    const thesevars: Variable[] = [];
    for (const [itemname, item1] of items)
    {
        const item: PossiblyStatic = item1 as PossiblyStatic;
        assert(item instanceof PossiblyStatic);

        item.name = itemname.name;

        if (item.static)
        {
            class1.staticnames.setnsname(itemname.ns, itemname.name, item);
        }
        else
        {
            class1.prototypenames.setnsname(itemname.ns, itemname.name, item);
            if (item instanceof Variable)
            {
                thesevars.push(item);
            }
        }
    }

    // Calculate instance slots (-constructor [- dynamic] [+ fixed1 [+ fixed2 [+ fixedN]]])
    let baseslots: Variable[] = [];
    if (class1.baseclass !== null)
    {
        baseslots = class1.baseclass.prototypevarslots.slice(0);
    }
    class1.prototypevarslots.push.apply(baseslots, thesevars);

    // Finish
    globalnames.setnsname(name.ns, name.name, class1);

    return class1;
}

/**
 * Encodes certain details of an interface.
 */
export class Interface
{
    baseinterfaces: Interface[] = [];

    /**
     * Fully package qualified name.
     */
    name: string;
    metadata: Metadata[];

    readonly prototypenames: Names = new Names();

    constructor(name: string, metadata: Metadata[])
    {
        this.name = name;
        this.metadata = metadata;
    }
    
    recursivedescinterfacelist(): Interface[]
    {
        const result: Interface[] = [this];
        for (const itrfc1 of this.baseinterfaces)
        {
            result.push.apply(result, itrfc1.recursivedescinterfacelist());
        }
        return result;
    }
}

export type InterfaceOptions =
{
    extendslist?: Interface[],
    metadata?: Metadata[],
};

export function defineinterface(name: Name, options: InterfaceOptions, items: [Name, any][]): Interface
{
    let finalname = "";
    if (name.ns instanceof Systemns && name.ns.parent instanceof Package)
    {
        finalname = name.ns.parent.name + "." + name.name;
    }

    const itrfc = new Interface(finalname, options.metadata ?? []);

    // Extends interfaces
    itrfc.baseinterfaces = options.extendslist ?? [];

    // Define items
    for (const [itemname, item1] of items)
    {
        const item: PossiblyStatic = item1 as PossiblyStatic;
        assert(item instanceof PossiblyStatic);
        assert(!item.static && (item instanceof VirtualVariable || item instanceof Method));
        item.name = itemname.name;
        itrfc.prototypenames.setnsname(itemname.ns, itemname.name, item);
    }

    // Finish
    globalnames.setnsname(name.ns, name.name, itrfc);

    return itrfc;
}

/**
 * Meta-data attached to traits such as classes, methods and properties.
 */
export class Metadata
{
    name: string;
    entries: [string | null, string][];

    constructor(name: string, entries: [string | null, string][])
    {
        this.name = name;
        this.entries = entries;
    }
}

export class PossiblyStatic
{
    /**
     * Fully package qualified name.
     */
    name: string = "";
    static: boolean = false;
}

export class Nsalias extends PossiblyStatic
{
    ns: Ns;

    constructor(name: string, ns: Ns)
    {
        super();
        this.name = name;
        this.ns = ns;
    }
}

export type NsaliasOptions =
{
    ns: Ns,
    static?: boolean,
};

export function nsalias(options: NsaliasOptions): Nsalias
{
    const r = new Nsalias("", options.ns);
    r.static = options.static ?? false;
    return r;
}

export class Variable extends PossiblyStatic
{
    readonly: boolean;
    metadata: Metadata[];
     type: any;

    constructor(name: string, readonly: boolean, metadata: Metadata[], type: any)
    {
        super();
        this.name = name;
        this.readonly = readonly;
        this.metadata = metadata;
        this.type = type;
    }
}

export type VariableOptions =
{
    readonly?: boolean,
    metadata?: Metadata[],
    type: any,
    static?: boolean,
};

export function variable(options: VariableOptions): Variable
{
    const varb = new Variable("", options.readonly ?? false, options.metadata ?? [], options.type);
    varb.static = options.static ?? false;
    return  varb;
}

export class VirtualVariable extends PossiblyStatic
{
    getter: Method | null;
    setter: Method | null;
    metadata: Metadata[];
     type: any;

    constructor(name: string, getter: Method | null, setter: Method | null, metadata: Metadata[], type: any)
    {
        super();
        this.name = name;
        this.getter = getter;
        this.setter = setter;
        this.metadata = metadata;
        this.type = type;
    }
}

export type VirtualVariableOptions =
{
    getter: Method | null,
    setter: Method | null,
    metadata?: Metadata[],
    type: any,
    static?: boolean,
};

export function virtualvar(options: VirtualVariableOptions): VirtualVariable
{
    const vvar = new VirtualVariable("", options.getter, options.setter, options.metadata ?? [], options.type);
    vvar.static = options.static ?? false;
    return vvar;
}

export class Method extends PossiblyStatic
{
    metadata: Metadata[];

    /**
     * The main function of a method: if it is overriden by another method,
     * then it will not invoke `nodisp` and will interrupt, invoking
     * the overriding method.
     */
    disp: Function;

    nodisp: Function;

    constructor(name: string, metadata: Metadata[], disp: Function, nodisp: Function)
    {
        super();
        this.name = name;
        this.metadata = metadata;
        this.disp = disp;
        this.nodisp = nodisp;
    }
}

export type MethodOptions =
{
    disp: Function,
    nodisp: Function,
    metadata?: Metadata[],
    static?: boolean,
};

export function method(options: MethodOptions): Method
{
    const m = new Method("", options.metadata ?? [], options.disp, options.nodisp);
    m.static = options.static ?? false;
    return m;
}

const globalnames = new Names();

const globalvarvals = new Map<Variable, any>();

/**
 * Maps (instance) to (method) to (bound method Function instance).
 */
const boundmethods = new Map<Array<any>, Map<Method, any>>();

/**
 * Checks whether an object has or inherits a given property name.
 * 
 * This method is used by the `name in o` expression, where
 * `o` is either a base class or a base instance.
 */
export function inobject(base: any, name: any): boolean
{
    if (base instanceof Array)
    {
        const ctor = base[CONSTRUCTOR_INDEX] as Class;
        if (ctor.dynamic)
        {
            if (base[DYNAMIC_PROPERTIES_INDEX].has(String(name)))
            {
                return true;
            }
        }
        let c1 = ctor;
        while (c1 !== null)
        {
            if (c1.prototypenames.haspublicname(String(name)))
            {
                return true;
            }
            // ECMAScript 3 prototype
            if (Object.prototype.hasOwnProperty.apply(c1.ecmaprototype, [String(name)]))
            {
                return true;
            }
            c1 = c1.baseclass;
        }
        // Test collection properties (Array, Vector[$double|$float|$int|$uint], Dictionary)
        if (istype(base, arrayclass))
        {
            if (Number(name) != name >> 0)
            {
                return false;
            }
            let i = name >> 0;
            return i >= 0 && i < base[ARRAY_SUBARRAY_INDEX].length;
        }
        if (istype(base, vectorclass))
        {
            if (Number(name) != name >> 0)
            {
                return false;
            }
            let i = name >> 0;
            return i >= 0 && i < base[VECTOR_SUBARRAY_INDEX].length;
        }
        if (istype(base, vectordoubleclass))
        {
            if (Number(name) != name >> 0)
            {
                return false;
            }
            let i = name >> 0;
            return i >= 0 && i < base[VECTOR_SUBARRAY_INDEX].length;
        }
        if (istype(base, vectorfloatclass))
        {
            if (Number(name) != name >> 0)
            {
                return false;
            }
            let i = name >> 0;
            return i >= 0 && i < base[VECTOR_SUBARRAY_INDEX].length;
        }
        if (istype(base, vectorintclass))
        {
            if (Number(name) != name >> 0)
            {
                return false;
            }
            let i = name >> 0;
            return i >= 0 && i < base[VECTOR_SUBARRAY_INDEX].length;
        }
        if (istype(base, vectoruintclass))
        {
            if (Number(name) != name >> 0)
            {
                return false;
            }
            let i = name >> 0;
            return i >= 0 && i < base[VECTOR_SUBARRAY_INDEX].length;
        }
        if (istype(base, dictionaryclass))
        {
            return base[DICTIONARY_PROPERTIES_INDEX].has(name);
        }
    }
    // Class static
    if (base instanceof Class)
    {
        if (String(name) == "prototype")
        {
            return true;
        }
        let c1 = base;
        while (c1 !== null)
        {
            if (c1.prototypenames.haspublicname(String(name)))
            {
                return true;
            }
            c1 = c1.baseclass;
        }
    }
    return false;
}

/**
 * Checks whether an object owns a given property name or key.
 * 
 * This method looks for Array element indices and own variables,
 * either for a base class or for a base instance.
 */
export function hasownproperty(base: any, name: any): boolean
{
    if (base instanceof Array)
    {
        const ctor = base[CONSTRUCTOR_INDEX] as Class;
        if (ctor.dynamic)
        {
            if (base[DYNAMIC_PROPERTIES_INDEX].has(String(name)))
            {
                return true;
            }
        }
        let c1 = ctor;
        while (c1 !== null)
        {
            let varb = c1.prototypenames.getpublicname(String(name));
            if (varb instanceof Variable)
            {
                return true;
            }
            c1 = c1.baseclass;
        }
        // Test collection properties (Array, Vector[$double|$float|$int|$uint], Dictionary)
        if (istype(base, arrayclass))
        {
            if (Number(name) != name >> 0)
            {
                return false;
            }
            let i = name >> 0;
            return i >= 0 && i < base[ARRAY_SUBARRAY_INDEX].length;
        }
        if (istype(base, vectorclass))
        {
            if (Number(name) != name >> 0)
            {
                return false;
            }
            let i = name >> 0;
            return i >= 0 && i < base[VECTOR_SUBARRAY_INDEX].length;
        }
        if (istype(base, vectordoubleclass))
        {
            if (Number(name) != name >> 0)
            {
                return false;
            }
            let i = name >> 0;
            return i >= 0 && i < base[VECTOR_SUBARRAY_INDEX].length;
        }
        if (istype(base, vectorfloatclass))
        {
            if (Number(name) != name >> 0)
            {
                return false;
            }
            let i = name >> 0;
            return i >= 0 && i < base[VECTOR_SUBARRAY_INDEX].length;
        }
        if (istype(base, vectorintclass))
        {
            if (Number(name) != name >> 0)
            {
                return false;
            }
            let i = name >> 0;
            return i >= 0 && i < base[VECTOR_SUBARRAY_INDEX].length;
        }
        if (istype(base, vectoruintclass))
        {
            if (Number(name) != name >> 0)
            {
                return false;
            }
            let i = name >> 0;
            return i >= 0 && i < base[VECTOR_SUBARRAY_INDEX].length;
        }
        if (istype(base, dictionaryclass))
        {
            return base[DICTIONARY_PROPERTIES_INDEX].has(name);
        }
    }
    // Class static
    if (base instanceof Class)
    {
        if (String(name) == "prototype")
        {
            return true;
        }
        let varb = base.staticnames.getpublicname(String(name));
        return varb instanceof Variable;
    }
    return false;
}

/**
 * Retrieves the value of a property taking
 * an optional qualifier either as a namespace or an Array of namespaces
 * and a local name.
 * 
 * @throws {ReferenceError} If the property is not defined or it is a reference of undefined or null.
 */
export function getproperty(base: any, qual: any, name: any): any
{
    // instance
    if (base instanceof Array)
    {
        fix-me;
    }
    // class static
    if (base instanceof Class)
    {
        fix-me;
    }
    // Number
    if (typeof base == "number")
    {
        fix-me;
    }
    // Boolean
    if (typeof base == "boolean")
    {
        fix-me;
    }
    // String
    if (typeof base == "string")
    {
        fix-me;
    }
    // null
    if (base === null)
    {
        throw new ReferenceError("Cannot read property of null.");
    }
    // undefined
    throw new ReferenceError("Cannot read property of undefined.");
}

/**
 * Checks for `v is T`.
 */
export function istype(value: any, type: any): boolean
{
    // type = null = *
    // type = [object Class] = a class
    // type = [object Interface] = an interface

    if (value instanceof Array)
    {
        const instanceClasses = (value[CONSTRUCTOR_INDEX] as Class).recursivedescclasslist();

        if (type instanceof Class)
        {
            return instanceClasses.indexOf(type!) !== -1;
        }
        if (type instanceof Interface)
        {
            for (const class1 of instanceClasses)
            {
                for (const itrfc1 of class1.interfaces)
                {
                    const itrfcs = itrfc1.recursivedescinterfacelist();
                    if (itrfcs.indexOf(type!) !== -1)
                    {
                        return true;
                    }
                }
            }
        }
    }
    if (type instanceof Class)
    {
        return (
            (typeof value === "number" && (numberclasses.indexOf(type) !== -1) || type === objectclass) ||
            (typeof value === "string" && (type == stringclass || type === objectclass)) ||
            (typeof value === "boolean" && (type == booleanclass || type === objectclass))
        );
    }
    return type === null;
}

const m_coercionDataView = new DataView(new ArrayBuffer(32));

/**
 * Performs implicit coercion.
 */
export function coerce(value: any, type: any): any
{
    if (!istype(value, type))
    {
        if (type instanceof Class)
        {
            return (
                type === objectclass && typeof value === "undefined" ? undefined :
                floatclasses.indexOf(type) !== -1 ? NaN :
                integerclasses.indexOf(type) !== -1 ? 0 :
                type === booleanclass ? false : null
            );
        }
        return null;
    }
    if (numberclasses.indexOf(type) !== -1)
    {
        switch (type)
        {
            case floatclass:
                m_coercionDataView.setFloat32(0, value);
                value = m_coercionDataView.getFloat32(0);
                return value;
            case numberclass:
                return Number(value);
            case intclass:
                m_coercionDataView.setInt32(0, value);
                value = m_coercionDataView.getInt32(0);
                return value;
            case uintclass:
                m_coercionDataView.setUint32(0, value);
                value = m_coercionDataView.getUint32(0);
                return value;
        }
    }
    return value;
}

/**
 * The `AS3` namespace.
 */
export const as3ns = packagens("http://adobe.com/AS3/2006/builtin");

/**
 * The `flash_proxy` namespace.
 */
export const flashproxyns = packagens("http://www.adobe.com/2006/actionscript/flash/proxy");

// ----- Globals -----

let $publicns = packagens("");

export const objectclass = defineclass(name($publicns, "Object"),
    {
        dynamic: true,
    },
    [
    ]
);

// Namespace(prefix:String, uri:String)
export const namespaceclass = defineclass(name($publicns, "Namespace"),
    {
        final: true,
        ctor(this: any, arg1: any, arg2: any = undefined)
        {
            this[NAMESPACE_PREFIX_INDEX] =
            this[NAMESPACE_URI_INDEX] = "";

            if (typeof arg2 === "undefined")
            {
                if (istype(arg1, namespaceclass))
                {
                    this[NAMESPACE_URI_INDEX] = arg1[NAMESPACE_URI_INDEX];
                }
                else if (istype(arg1, qnameclass))
                {
                    this[NAMESPACE_URI_INDEX] = arg1[QNAME_URI_INDEX];
                }
                else
                {
                    this[NAMESPACE_URI_INDEX] = String(arg1);
                }
            }
            else
            {
                // arg1 = prefixValue
                if (typeof arg1 === "undefined")
                {
                    this[NAMESPACE_PREFIX_INDEX] = "undefined";
                }
                else
                {
                    this[NAMESPACE_PREFIX_INDEX] = fix-me;
                    fix-me;
                }

                // arg2 = uriValue
                this[NAMESPACE_URI_INDEX] = fix-me;
            }
        },
    },
    [
    ]
);

// QName(uri:String, localName:String)
export const qnameclass = defineclass(name($publicns, "QName"),
    {
        final: true,
        ctor(this: any, arg1: any, arg2: any = undefined)
        {
            this[QNAME_URI_INDEX] =
            this[QNAME_LOCALNAME_INDEX] = "";

            fix-me;
        },
    },
    [
    ]
);

export const classclass = defineclass(name($publicns, "Class"),
    {
        ctor(this: any)
        {
            this[CLASS_CLASS_INDEX] = classclass;
        },
    },
    [
    ]
);

export const numberclass = defineclass(name($publicns, "Number"),
    {
        final: true,
    },
    [
    ]
);

export const intclass = defineclass(name($publicns, "int"),
    {
        final: true,
    },
    [
    ]
);

export const uintclass = defineclass(name($publicns, "uint"),
    {
        final: true,
    },
    [
    ]
);

export const floatclass = defineclass(name($publicns, "float"),
    {
        final: true,
    },
    [
    ]
);

export const numberclasses = [numberclass, intclass, uintclass, floatclass];
export const floatclasses = [numberclass, floatclass];
export const integerclasses = [intclass, uintclass];

export const booleanclass = defineclass(name($publicns, "Boolean"),
    {
        final: true,
    },
    [
    ]
);

export const stringclass = defineclass(name($publicns, "String"),
    {
        final: true,
    },
    [
    ]
);

export const arrayclass = defineclass(name($publicns, "Array"),
    {
        dynamic: true,

        ctor(this: any, length: number = 0)
        {
            this[DYNAMIC_PROPERTIES_INDEX] = new Map<any, any>();
            this[ARRAY_SUBARRAY_INDEX] = new Array(Math.max(0, length >>> 0));
        },
    },
    [
    ]
);

function mdefaultfunction() {}

export const functionclass = defineclass(name($publicns, "Function"),
    {
        final: true,

        ctor(this: any)
        {
            this[FUNCTION_FUNCTION_INDEX] = mdefaultfunction;
        },
    },
    [
    ]
);

$publicns = packagens("__AS3__.vec");

export const vectorclass = defineclass(name($publicns, "Vector"),
    {
        ctor(this: any, length: number = 0, fixed: boolean = false)
        {
            this[VECTOR_SUBARRAY_INDEX] = new Array(Math.max(0, length >>> 0));
            this[VECTOR_FIXED_INDEX] = !!fixed;
        },
    },
    [
    ]
);

export const vectordoubleclass = defineclass(name($publicns, "Vector$double"),
    {
        ctor(this: any, length: number = 0, fixed: boolean = false)
        {
            this[VECTOR_SUBARRAY_INDEX] = new FlexVector(Float64Array, Number(length), fixed);
        },
    },
    [
    ]
);

export const vectorfloatclass = defineclass(name($publicns, "Vector$float"),
    {
        ctor(this: any, length: number = 0, fixed: boolean = false)
        {
            this[VECTOR_SUBARRAY_INDEX] = new FlexVector(Float32Array, Number(length), fixed);
        },
    },
    [
    ]
);

export const vectorintclass = defineclass(name($publicns, "Vector$int"),
    {
        ctor(this: any, length: number = 0, fixed: boolean = false)
        {
            this[VECTOR_SUBARRAY_INDEX] = new FlexVector(Int32Array, Number(length), fixed);
        },
    },
    [
    ]
);

export const vectoruintclass = defineclass(name($publicns, "Vector$uint"),
    {
        ctor(this: any, length: number = 0, fixed: boolean = false)
        {
            this[VECTOR_SUBARRAY_INDEX] = new FlexVector(Uint32Array, Number(length), fixed);
        },
    },
    [
    ]
);

$publicns = packagens("flash.utils");

export const dictionaryclass = defineclass(name($publicns, "Dictionary"),
    {
        ctor(this: any, weakKeys: boolean = false)
        {
            this[DICTIONARY_PROPERTIES_INDEX] = weakKeys ? new WeakMap<any, any>() : new Map<any, any>();
        },
    },
    [
    ]
);