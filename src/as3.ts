import { assert } from "./util";

export abstract class Ns
{
	abstract toString(): string;
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
	readonly name: string;
	readonly publicns: Systemns = new Systemns(Systemns.PUBLIC, null);
	readonly internalns: Systemns = new Systemns(Systemns.INTERNAL, null);
	readonly names: Names = new Names();
	readonly varvals: Map<Variable, any> = new Map();

	constructor(name: string) 
	{
		this.name = name;
		this.publicns.parent = this;
		this.internalns.parent = this;
	}
}

const packages = new Map<string, Package>();

export function getpackagevarval(name: Name): any
{
	const ns = name.ns as Systemns;
	assert(ns instanceof Systemns);
	const pckg = ns.parent as Package;
	assert(pckg instanceof Package);
	const varb = pckg.names.getnsname(ns, name.name) as Variable;
	assert(varb instanceof Variable);
	return pckg.varvals.get(varb);
}

export function setpackagevarval(name: Name, value: any): void
{
	const ns = name.ns as Systemns;
	assert(ns instanceof Systemns);
	const pckg = ns.parent as Package;
	assert(pckg instanceof Package);
	const varb = pckg.names.getnsname(ns, name.name) as Variable;
	assert(varb instanceof Variable);
	pckg.varvals.set(varb, value);
}

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
 * An instance of the a dynamic class will have the second element
 * as a plain JavaScript object containing dynamic properties.
 */
export class Class
{
	baseclass: Class | null = null;
	interfaces: Interface[] = [];

	/**
	 * Fully package qualified name.
	 */
	name: string;
	final: boolean;
	dynamic: boolean;
	metadata: Metadata[];

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
	varslots: Variable[] = [];

	constructor(name: string, final: boolean, dynamic: boolean, metadata: Metadata[])
	{
		this.name = name;
		this.final = final;
		this.dynamic = dynamic;
		this.metadata = metadata;
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

export function getclassstaticvarval(className: Name, varName: Name): any
{
	const class1 = globalnames.getnsname(className.ns, className.name) as Class;
	assert(class1 instanceof Class);
	const varb = class1.staticnames.getnsname(varName.ns, varName.name) as Variable;
	assert(varb instanceof Variable);
	return class1.staticvarvals.get(varb);
}

export function setclassstaticvarval(className: Name, varName: Name, value: any): void
{
	const class1 = globalnames.getnsname(className.ns, className.name) as Class;
	assert(class1 instanceof Class);
	const varb = class1.staticnames.getnsname(varName.ns, varName.name) as Variable;
	assert(varb instanceof Variable);
	class1.staticvarvals.set(varb, value);
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

export class Variable
{
	/**
	 * Fully package qualified name.
	 */
	name: string;
	readonly: boolean;
	metadata: Metadata[];
 	type: Class | null;

	constructor(name: string, readonly: boolean, metadata: Metadata[], type: Class | null)
	{
		this.name = name;
		this.readonly = readonly;
		this.metadata = metadata;
		this.type = type;
	}
}

export class VirtualVariable
{
	/**
	 * Fully package qualified name.
	 */
	name: string;
	getter: Method | null;
	setter: Method | null;
	metadata: Metadata[];
 	type: Class | null;

	constructor(name: string, getter: Method | null, setter: Method | null, metadata: Metadata[], type: Class | null)
	{
		this.name = name;
		this.getter = getter;
		this.setter = setter;
		this.metadata = metadata;
		this.type = type;
	}
}

export class Method
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
		this.name = name;
		this.metadata = metadata;
		this.disp = disp;
		this.nodisp = nodisp;
	}
}

export const globalnames = new Names();

export const globalvarvals = new Map<Variable, any>();

export const boundmethods = new Map<Array<any>, Map<Method, Function>>();

/**
 * Checks for `v is T`.
 */
export function isoftype(instance: any, type: Class | Interface | null): boolean
{
	// type = null = *
	// type = [object Class] = a class
	// type = [object Interface] = an interface

	if (instance instanceof Array)
	{
		const instanceClasses = (instance[0] as Class).recursivedescclasslist();

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
		// (Number, uint, int, float)
		// String
		// Boolean
		check-for-primitive-types;
	}
	return type === null;
}