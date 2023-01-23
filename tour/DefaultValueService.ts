export type DefaultOrType<T> = T | DefaultValue<T>;
export type ExcludeDefault<T> = T extends DefaultOrType<infer T1> ? T1 : T;


// if (!globalThis.DEFAULT_VALUE_SERVICE) {
//     globalThis.DEFAULT_VALUE_SERVICE = true

    /**
     * A {@link DefaultValue} inside a {@link DefaultValue} is not allowed
     */
    class DefaultValue<T extends ExcludeDefault<any>> {
        readonly #value: T;

        constructor(value: T) {
            if (isDefault(value)) {
                throw new TypeError(`The value in ${DefaultValue.name} must not be another ${DefaultValue.name}`);
            }
            if (isNotSet(value)) {
                throw new TypeError(`The value in ${DefaultValue.name} must not be the NotSet constant: ${NotSet}`);
            }
            this.#value = value;
            Object.freeze(this);
        }

        valueOf(): T {
            return this.#value;
        }

        toString(): string {
            return String(this.#value);
        }

        [Symbol.toPrimitive](): T {
            return this.#value;
        }

        static {
            Object.freeze(DefaultValue);
        }
    }
// }

export function wrapDefault<T>(value: T): DefaultValue<ExcludeDefault<T>> {
    return new DefaultValue(value) as DefaultValue<ExcludeDefault<T>>;
}

export function isDefault<T>(value: T | DefaultValue<ExcludeDefault<T>>): value is DefaultValue<ExcludeDefault<T>> {
    return value instanceof DefaultValue;
}

export function defaultEqual(value1: unknown, value2: unknown): value1 is typeof value2 {
    return value1?.valueOf() == value2?.valueOf();
}

export function defaultIsUndefined(value: unknown): value is DefaultOrType<undefined> {
    return value === undefined || (value !== null && value.valueOf() === undefined);
}

export function defaultIsNullable(value: unknown): value is DefaultOrType<null | undefined> {
    return value?.valueOf() == null;
}

/**
 * ?? operator but works with {@link DefaultValue}
 * @param value1
 * @param value2
 */
export function defaultNullishCoalescing<T, T1>(value1: T, value2: T1): Exclude<T, DefaultOrType<null | undefined>> | T1 {
    if (value1 == null || value1.valueOf() == null) {
        return value2;
    }
    return value1 as any;
}

export function extractFromDefault<T>(value: T): ExcludeDefault<T> {
    if (isDefault(value)) {
        return value.valueOf();
    }
    return value as ExcludeDefault<T>;
}


// -----------------------------------------------------------------------------------

// This constant is used as a placeholder for values that are not set (undefined isn't good because inputs do not accept it as a real value)
export const NotSet = 'NOT_SET' as const;
export type NotSet = typeof NotSet;

export function isNotSet(value: unknown): value is  NotSet {
    return value === NotSet;
}

export function notSetToUndefined<T>(value: T): T extends NotSet ? undefined : T {
    if (value === NotSet) {
        return undefined as any;
    }
    return value as Exclude<T, NotSet>;
}

export {DefaultValue};