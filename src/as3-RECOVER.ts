export function getpackagevarval(name: Name): any
{
	const ns = name.ns as Systemns;
	assert(ns instanceof Systemns);
	const pckg = ns.parent as Package;
	assert(pckg instanceof Package);
	const varb = pckg.names.getnsname(ns, name.name) as Variable;
	assert(varb instanceof Variable);
	return coerce(pckg.varvals.get(varb), varb.type);
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

export function getclassstaticvarval(className: Name, varName: Name): any
{
	const class1 = globalnames.getnsname(className.ns, className.name) as Class;
	assert(class1 instanceof Class);
	const varb = class1.staticnames.getnsname(varName.ns, varName.name) as Variable;
	assert(varb instanceof Variable);
	return coerce(class1.staticvarvals.get(varb), varb.type);
}

export function setclassstaticvarval(className: Name, varName: Name, value: any): void
{
	const class1 = globalnames.getnsname(className.ns, className.name) as Class;
	assert(class1 instanceof Class);
	const varb = class1.staticnames.getnsname(varName.ns, varName.name) as Variable;
	assert(varb instanceof Variable);
	class1.staticvarvals.set(varb, value);
}