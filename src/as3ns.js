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

	// Package
	parent = null;

	constructor(kind, parent) {
		this.kind = kind;
		this.parent = parent;
	}
}

export class UserNS extends NS
{
	uri = "";

	constructor(uri) {
		this.uri = uri;
	}
}

export class ExplicitNS extends NS
{
	uri = "";

	constructor(uri) {
		this.uri = uri;
	}
}