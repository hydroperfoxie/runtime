export function assert(value: any, message: string = ""): void
{
    if (!value)
    {
        throw new Error(message);
    }
}

const INITIAL_CAPACITY = 3;

function assertNotFixedVectorError(value: boolean): void
{
    if (value)
    {
        throw new RangeError("The fixed property is set to true.");
    }
}

export class FlexVector
{
    private typedArrayConstructor: new (arg: any) => any;
    private m_array: any;
    private m_length: number = 0;
    private m_fixed: boolean;

    constructor(typedArrayConstructor: new () => any, argument: any = 0, fixed: boolean = false)
    {
        this.typedArrayConstructor = typedArrayConstructor;
        if (typeof argument == "number")
        {
            argument = Math.max(0, argument >>> 0);
            this.m_array = new this.typedArrayConstructor(Math.max(INITIAL_CAPACITY, argument));
            this.m_length = argument;
        }
        else
        {
            if (argument.length == 0)
            {
                this.m_array = new this.typedArrayConstructor(INITIAL_CAPACITY);
                this.m_length = 0;
            } else {
                this.m_array = argument.slice(0);
                this.m_length = argument.length;
            }
        }
        this.m_fixed = fixed;
    }

    entries(): Iterator<[number, number]>
    {
        return this.m_array.subarray(0, this.m_length).entries();
    }

    keys(): Iterator<number>
    {
        return this.m_array.subarray(0, this.m_length).keys();
    }

    values(): Iterator<number>
    {
        return this.m_array.subarray(0, this.m_length).values();
    }

    get length(): number
    {
        return this.m_length;
    }

    set length(value: number)
    {
        value = Number(value);
        if (value == this.m_length)
        {
            return;
        }
        assertNotFixedVectorError(this.m_fixed);
        value = Math.max(0, value >>> 0);
        if (value > this.m_array.length)
        {
            const k = this.m_array;
            this.m_array = new this.typedArrayConstructor(k.length + (value - k.length));
            this.m_array.set(k.subarray(0, k.length));
            this.m_length = value;
        }
        else if (value == 0)
        {
            this.m_array = new this.typedArrayConstructor(INITIAL_CAPACITY);
            this.m_length = 0;
        }
        else
        {
            this.m_array = this.m_array.slice(0, value);
            this.m_length = value;
        }
    }

    get fixed(): boolean
    {
        return this.m_fixed;
    }

    set fixed(value: boolean)
    {
        this.m_fixed = !!value;
    }

    hasIndex(index: number): boolean
    {
        index = Math.max(0, index >>> 0);
        return index < this.m_length;
    }

    get(index: number): number
    {
        index = Math.max(0, index >>> 0);
        return index < this.m_length ? this.m_array[index] : 0;
    }

    /**
     * @throws {Error} If index is out of range.
     */
    set(index: number, value: number): void
    {
        index = Math.max(0, index >>> 0);
        value = Number(value);
        if (index == this.m_length)
        {
            assertNotFixedVectorError(this.m_fixed);
            this.push(value);
        }
        if (index >= this.m_length)
        {
            throw new RangeError("Index out of bounds.");
        }
        this.m_array[index] = value;
    }

    includes(item: number): boolean
    {
        return this.indexOf(item) != -1;
    }

    concat(...args: FlexVector[]): FlexVector
    {
        const result = this.slice(0);
        for (const arg of args)
        {
            const appendice = arg.m_array;
            const k = result.m_array;
            const kmlen = result.m_length;
            result.m_length += appendice.length;
            let newCapacity = kmlen;
            newCapacity = newCapacity < result.m_length ? result.m_length : newCapacity;
            result.m_array = new this.typedArrayConstructor(newCapacity);
            result.m_array.set(k.subarray(0, kmlen));
            result.m_array.set(appendice, kmlen);
        }
        return result;
    }

    push(...args: number[]): number
    {
        assertNotFixedVectorError(this.m_fixed);
        args = args instanceof Array ? args : [];
        args = args.map(v => Number(v));
        if (args.length == 1)
        {
            this._push1(args[0]);
        }
        else
        {
            const appendice = new this.typedArrayConstructor(args);
            const k = this.m_array;
            const kmlen = this.m_length;
            this.m_length += appendice.length;
            let newCapacity = kmlen;
            newCapacity = newCapacity < this.m_length ? this.m_length : newCapacity;
            this.m_array = new this.typedArrayConstructor(newCapacity);
            this.m_array.set(k.subarray(0, kmlen));
            this.m_array.set(appendice, kmlen);
        }
        return this.m_length;
    }

    private _push1(value: number): void
    {
        const i = this.m_length++;
        if (i >= this.m_array.length)
        {
            const k = this.m_array;
            this.m_array = new this.typedArrayConstructor(k.length * 2);
            this.m_array.set(k.subarray(0, i));
        }
        this.m_array[i] = Number(value);
    }

    shift(): number
    {
        assertNotFixedVectorError(this.m_fixed);
        if (this.m_length == 0)
        {
            return 0;
        }
        const k = this.m_array;
        this.m_length--;
        this.m_array = new this.typedArrayConstructor(k.length);
        this.m_array.set(k.subarray(1, this.m_length + 1));
        return k[0];
    }

    pop(): number
    {
        assertNotFixedVectorError(this.m_fixed);
        return this.m_length == 0 ? 0 : this.m_array[--this.m_length];
    }

    join(sep: string = ","): string
    {
        return this.m_array.join(sep);
    }

    unshift(...args: number[]): number
    {
        assertNotFixedVectorError(this.m_fixed);
        args = args instanceof Array ? args : [];
        args = args.map(v => Number(v));
        if (args.length == 0)
        {
            return this.m_length;
        }
        const k = this.m_array;
        const kmlen = this.m_length;
        this.m_length += args.length;
        let newCapacity = k.length;
        newCapacity = newCapacity < this.m_length ? newCapacity * 2 : newCapacity;
        this.m_array = new this.typedArrayConstructor(newCapacity);
        this.m_array.set(new this.typedArrayConstructor(args), 0);
        this.m_array.set(k.subarray(0, kmlen), args.length);
        return this.m_length;
    }

    insertAt(index: number, element: number): void
    {
        assertNotFixedVectorError(this.m_fixed);
        index = Math.max(0, index >>> 0);
        element = Number(element);
        if (index >= this.m_length)
        {
            throw new RangeError("Index out of bounds.");
        }
        const k = this.m_array;
        this.m_length++;
        let newCapacity = k.length;
        newCapacity = newCapacity < this.m_length ? newCapacity * 2 : newCapacity;
        this.m_array = new this.typedArrayConstructor(k.length);
        this.m_array.set(k.subarray(0, index));
        this.m_array[index] = element;
        this.m_array.set(k.subarray(index, this.m_length), index + 1);
    }

    removeAt(index: number): number
    {
        assertNotFixedVectorError(this.m_fixed);
        index = Math.max(0, index >>> 0);
        if (index >= this.m_length)
        {
            throw new RangeError("Index out of bounds.");
        }
        const r = this.m_array[index];
        const k = this.m_array;
        this.m_length--;
        this.m_array = new this.typedArrayConstructor(k.length);
        this.m_array.set(k.subarray(0, index));
        this.m_array.set(k.subarray(index + 1, this.m_length + 1), index);
        return r;
    }
    
    splice(startIndex: number, deleteCount: number = 0xFFFFFFFF, ...items: number[]): FlexVector
    {
        assertNotFixedVectorError(this.m_fixed);

        startIndex = Math.max(0, startIndex >>> 0);
        deleteCount = Math.max(0, deleteCount >>> 0);
        items = items instanceof Array ? items : [];
        items = items.map(v => Number(v));

        if (startIndex >= this.m_length)
        {
            throw new RangeError("Index out of bounds.");
        }
        if (startIndex + deleteCount > this.m_length)
        {
            deleteCount = this.m_length - startIndex;
        }

        const k = this.m_array;
        const kmlen = this.m_length;
        this.m_length = kmlen - deleteCount + items.length;
        let newCapacity = k.length;
        newCapacity = newCapacity < this.m_length ? this.m_length : newCapacity;
        this.m_array = new this.typedArrayConstructor(newCapacity);
        this.m_array.set(k.subarray(0, startIndex));
        this.m_array.set(k.subarray(startIndex + deleteCount, kmlen), startIndex);
        const r = k.slice(startIndex, startIndex + deleteCount);
        this.m_array.set(new this.typedArrayConstructor(items), kmlen - deleteCount);
        return new FlexVector(r);
    }

    slice(startIndex: number = 0, endIndex: number = 0x7FFFFFFF): FlexVector
    {
        startIndex = Math.max(0, startIndex >>> 0);
        endIndex = Math.max(0, endIndex >>> 0);
        startIndex = this.hasIndex(startIndex) ? startIndex : this.m_length;
        endIndex = endIndex < startIndex ? startIndex : endIndex;
        return new FlexVector(this.m_array.slice(startIndex, endIndex));
    }
    
    sort(sortBehavior: any): FlexVector
    {
        this.m_array.sort(sortBehavior);
        return this;
    }

    reverse(): FlexVector {
        this.m_array.reverse();
        return this;
    }

    indexOf(searchElement: number, fromIndex: number = 0): number
    {
        searchElement = Number(searchElement);
        fromIndex = Math.max(0, fromIndex >>> 0);
        fromIndex = this.hasIndex(fromIndex) ? fromIndex : this.m_length;
        return this.m_array.indexOf(searchElement, fromIndex);
    }

    lastIndexOf(searchElement: number, fromIndex: number = 0): number
    {
        searchElement = Number(searchElement);
        fromIndex = Math.max(0, fromIndex >>> 0);
        fromIndex = this.hasIndex(fromIndex) ? fromIndex : this.m_length;
        return this.m_array.lastIndexOf(searchElement, fromIndex);
    }

    toString(): string
    {
        return this.m_array.toString();
    }

    toLocaleString(): string
    {
        return this.m_array.toLocaleString();
    }
}