export function assert(value: any, message: string = ""): void
{
    if (!value)
    {
        throw new Error(message);
    }
}