import { injectToIl2Cpp } from "../decorators";
import { readFieldValue, writeFieldValue } from "../utils";

import { NativeStruct } from "../../utils/native-struct";

@injectToIl2Cpp("Pointer")
class Il2CppPointer<T extends Il2Cpp.Field.Type = Il2Cpp.Field.Type> extends NativeStruct implements Iterable<T> {
    constructor(handle: NativePointer, readonly type: Il2Cpp.Type) {
        super(handle);
    }

    get values(): T[] {
        return this.read();
    }

    set values(values: T[]) {
        this.write(values);
    }

    get(index: number): T {
        return readFieldValue(this.getElementHandle(index), this.type) as T;
    }

    getElementHandle(index: number): NativePointer {
        return this.handle.add(index * this.type.class.arrayElementSize);
    }

    read(offset: number = 0, length: number = Number.MAX_SAFE_INTEGER): T[] {
        const value: T[] = [];

        for (let i = offset; i < length; i++) {
            const elementHandle = this.getElementHandle(i);
            if (elementHandle.readPointer().isNull()) {
                break;
            }
            value.push(readFieldValue(elementHandle, this.type) as T);
        }
        return value;
    }

    set(index: number, value: T): void {
        writeFieldValue(this.getElementHandle(index), value, this.type);
    }

    write(values: T[], offset: number = 0): void {
        let i = offset;
        for (const value of values) {
            this.set(i, value);
            i++;
        }
    }

    override toString(): string {
        return `[${this.values}]`;
    }

    *[Symbol.iterator](): IterableIterator<T> {
        for (const value of this.values) {
            yield value;
        }
    }
}