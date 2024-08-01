export class NS
{
}

export class SystemNS extends NS
{
	static INTERNAL = 0;
	static PUBLIC = 1;
	static PRIVATE = 2;
	static PROTECTED = 3;
	static STATIC_PROTECTED = 4;

	kind = SystemNS.INTERNAL;

	/**
	 * Nullable reference to an ActionScript package or class.
	 */
	parent = null;

	constructor(kind, parent) {
		super();
		this.kind = kind;
		this.parent = parent;
	}
}

export class UserNS extends NS
{
	uri = "";

	constructor(uri) {
		super();
		this.uri = uri;
	}
}

export class ExplicitNS extends NS
{
	uri = "";

	constructor(uri) {
		super();
		this.uri = uri;
	}
}

class Package
{
	name = "";
	publicns = new SystemNS(SystemNS.PUBLIC, null);
	internalns = new SystemNS(SystemNS.INTERNAL, null);

	constructor(name) 
	{
		this.name = name;
		this.publicns.parent = this;
		this.internalns.parent = this;
	}
}

const packages = new Map();

/**
 * Retrieves the `public` namespace of a package.
 */
export function packagens(name)
{
	if (packages.has(name))
	{
		return packages.get(name).publicns;
	}
	const p = new Package(name);
	packages.set(name, p);
	return p.publicns;
}

/**
 * Retrieves the `internal` namespace of a package.
 */
export function packageinternalns(name)
{
	if (packages.has(name))
	{
		return packages.get(name).internalns;
	}
	const p = new Package(name);
	packages.set(name, p);
	return p.internalns;
}

export class Name
{
	/**
	 * @type {NS}
	 */
	prefix = null;
	/**
	 * @type {string}
	 */
	local = "";

	constructor(prefix, local)
	{
		this.prefix = prefix;
		this.local = local;
	}
}

/**
 * @param {NS} prefix
 * @param {string} local
 * @returns {Name}
 */
export function name(prefix, local)
{
	return new Name(prefix, local);
}

/**
 * @type {Map<string, Map<string, *>>}
 */
const globalNames = new Map();