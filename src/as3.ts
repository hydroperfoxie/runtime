import { assert } from "./util";

export abstract class Ns
{
	abstract toString(): string;

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

class Package
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
	
	hasnsname(ns: Ns, name: string): any
	{
		return this.m_dict.get(ns)?.has(name) ?? false;
	}
	
	getnsname(ns: Ns, name: string): any
	{
		return this.m_dict.get(ns)?.get(name) ?? null;
	}

	getnssetname(nsset: Ns[], name: string): any
	{
		for (const ns of nsset)
		{
			const result = this.getnsname(ns, name);
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

	set(ns: Ns, name: string, trait: any): void
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
 * as a Map<string, any> object containing dynamic properties.
 */
class Class
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
		if (item.static)
		{
			class1.staticnames.set(itemname.ns, itemname.name, item);
		}
		else
		{
			class1.prototypenames.set(itemname.ns, itemname.name, item);
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

	return class1;
}

/**
 * Encodes certain details of an interface.
 */
class Interface
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

class PossiblyStatic
{
	static: boolean = false;
}

class Nsalias extends PossiblyStatic
{
	ns: Ns;

	constructor(ns: Ns)
	{
		super();
		this.ns = ns;
	}
}

class Variable extends PossiblyStatic
{
	/**
	 * Fully package qualified name.
	 */
	name: string;
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

class VirtualVariable extends PossiblyStatic
{
	/**
	 * Fully package qualified name.
	 */
	name: string;
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

export class Method extends PossiblyStatic
{
	/**
	 * Fully package qualified name.
	 */
	name: string;
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

const globalnames = new Names();

const globalvarvals = new Map<Variable, any>();

const boundmethods = new Map<Array<any>, Map<Method, Function>>();

export function hasname(base1: any, name: Name): boolean
{
	if (!(base1 instanceof Array))
	{
		return false;
	}
	const base = base1 as Array<any>;
	const class1 = base[0] as Class;
	if (class1.dynamic && name.ns.ispublicorinternalns())
	{
		return (base[1] as Map<string, any>).has(name.name);
	}
	let classb = class1;
	while (classb !== null)
	{
		if (classb.prototypenames.hasnsname(name.ns, name.name))
		{
			return true;
		}
		classb = classb.baseclass;
	}
	return false;
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
		const instanceClasses = (value[0] as Class).recursivedescclasslist();

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
			(typeof value === "number" && numberclasses.indexOf(type) !== -1) ||
			(typeof value === "string" && type == stringclass) ||
			(typeof value === "boolean" && type == booleanclass)
		);
	}
	return type === null;
}

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
	return value;
}

let $publicns = packagens("");

export const objectclass = defineclass(name($publicns, "Object"),
	{
		dynamic: true,
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