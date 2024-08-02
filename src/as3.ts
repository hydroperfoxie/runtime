export abstract class NS
{
	abstract toString(): string;
}

export class SystemNS extends NS
{
	static INTERNAL = 0;
	static PUBLIC = 1;
	static PRIVATE = 2;
	static PROTECTED = 3;
	static STATIC_PROTECTED = 4;

	kind: number = SystemNS.INTERNAL;

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

export class UserNS extends NS
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

export class ExplicitNS extends NS
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
	readonly publicns: SystemNS = new SystemNS(SystemNS.PUBLIC, null);
	readonly internalns: SystemNS = new SystemNS(SystemNS.INTERNAL, null);

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
export function packagens(name: string): NS
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
export function packageinternalns(name: string): NS
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
	prefix: NS;
	local: string;

	constructor(prefix: NS, local: string)
	{
		this.prefix = prefix;
		this.local = local;
	}
}

export function name(prefix: NS, local: string): Name
{
	return new Name(prefix, local);
}

const as3Names = new Map<string, Map<string, any>>();