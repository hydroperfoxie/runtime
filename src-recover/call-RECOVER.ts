/**
 * Calls a property.
 */
export function callproperty(base: any, qual: any, name: any, ...args: any[]): any
{
    // instance
    if (base instanceof Array)
    {
        const ctor = base[CONSTRUCTOR_INDEX] as Class;
        const slotfixturestart = ctor.dynamic ? 2 : 1;

        // instance prototype
        let c1 = ctor;
        while (c1 !== null)
        {
            let itrait = c1.prototypenames.getname(qual, String(name));
            if (itrait)
            {
                // variable
                if (itrait instanceof Variable)
                {
                    const i = ctor.prototypevarslots.indexOf(itrait);
                    return base[slotfixturestart + i];
                }
                // property accessor
                if (itrait instanceof VirtualVariable)
                {
                    const getter = itrait.getter;
                    if (getter === null)
                    {
                        throw constructerror(referenceerrorclass, "Cannot read write-only property.");
                    }
                    return getter!.disp.apply(base, []);
                }
                // bound method
                if (itrait instanceof Method)
                {
                    let bm1 = boundmethods.get(base);
                    if (!bm1)
                    {
                        bm1 = new Map<Method, any>();
                        boundmethods.set(base, bm1);
                    }
                    let bm: any = boundmethods.get(itrait);
                    if (bm === null)
                    {
                        bm = construct(functionclass);
                        bm[FUNCTION_FUNCTION_INDEX] = itrait.disp.bind(base);
                        boundmethods.set(itrait, bm);
                    }
                    return bm;
                }
                if (itrait instanceof Nsalias)
                {
                    return reflectnamespace(itrait.ns);
                }
                
                throw constructerror(referenceerrorclass, "Internal error");
            }
            
            // instance ecmaprototype
            if ((!qual || (qual instanceof Ns && qual.ispublicns())) && hasonlydynamicproperty(c1.ecmaprototype, String(name)))
            {
                return getonlydynamicproperty(c1.ecmaprototype, String(name));
            }

            c1 = c1.baseclass;
        }

        if (!qual || (qual instanceof Ns && qual.ispublicns()))
        {
            if (ctor.dynamic)
            {
                if (base[DYNAMIC_PROPERTIES_INDEX].has(String(name)))
                {
                    return base[DYNAMIC_PROPERTIES_INDEX].get(String(name));
                }
            }

            // Read collection properties (Array, Vector[$double|$float|$int|$uint], Dictionary)

            if (istype(base, arrayclass) && Number(name) == name >> 0)
            {
                return base[ARRAY_SUBARRAY_INDEX][name >> 0];
            }
            if (istype(base, vectorclass) && Number(name) == name >> 0)
            {
                let i = name >> 0;
                if (i < 0 || i >= base[VECTOR_SUBARRAY_INDEX].length)
                {
                    throw constructerror(referenceerrorclass, "Index " + i + " out of bounds (length=" + base[VECTOR_SUBARRAY_INDEX].length + ").");
                }
                return base[VECTOR_SUBARRAY_INDEX][i];
            }
            if ((istype(base, vectordoubleclass) || istype(base, vectorfloatclass) || istype(base, vectorintclass) || istype(base, vectoruintclass)) && Number(name) == name >> 0)
            {
                let i = name >> 0, l = base[VECTOR_SUBARRAY_INDEX].length;
                if (i < 0 || i >= l)
                {
                    throw constructerror(referenceerrorclass, "Index " + i + " out of bounds (length=" + l + ").");
                }
                return base[VECTOR_SUBARRAY_INDEX].get(i);
            }
            if (istype(base, dictionaryclass))
            {
                const mm = base[DICTIONARY_PROPERTIES_INDEX];
                if (mm instanceof WeakMap && !(name instanceof Array))
                {
                    throw constructerror(referenceerrorclass, "Weak key must be a managed Object.");
                }
                return mm.get(name);
            }
        }

        // Read the "Class" object's class properties
        if (istype(base, classclass))
        {
            return getproperty(base[CLASS_CLASS_INDEX], qual, name);
        }

        throw constructerror(referenceerrorclass, "Access of undefined property +" + name + ".");
    }
    // class static
    if (base instanceof Class)
    {
        if (String(name) == "prototype")
        {
            return base.ecmaprototype;
        }
        let c1 = base;
        while (c1 !== null)
        {
            const trait = c1.staticnames.getname(qual, name);
            if (trait)
            {
                // variable
                if (trait instanceof Variable)
                {
                    return c1.staticvarvals.get(trait);
                }
                // property accessor
                if (trait instanceof VirtualVariable)
                {
                    const getter = trait.getter;
                    if (getter === null)
                    {
                        throw constructerror(referenceerrorclass, "Cannot read write-only property.");
                    }
                    return getter!.disp.apply(undefined, []);
                }
                // method
                if (trait instanceof Method)
                {
                    return trait.disp.apply(undefined, []);
                }
                // namespace
                if (trait instanceof Nsalias)
                {
                    return reflectnamespace(trait.ns);
                }
                throw constructerror(referenceerrorclass, "Internal error");
            }
            c1 = c1.baseclass;
        }
    }
    // Number
    if (typeof base == "number")
    {
        return getproperty([numberclass, base], qual, name);
    }
    // Boolean
    if (typeof base == "boolean")
    {
        return getproperty([booleanclass, base], qual, name);
    }
    // String
    if (typeof base == "string")
    {
        return getproperty([stringclass, base], qual, name);
    }
    // null
    if (base === null)
    {
        throw constructerror(referenceerrorclass, "Cannot read property of null.");
    }
    // undefined
    throw constructerror(referenceerrorclass, "Cannot read property of undefined.");
}

function callfunctionobjorconvertclass(obj: any, ...args: any)
{
}