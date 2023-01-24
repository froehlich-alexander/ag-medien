// if (!globalThis.DEFAULT_VALUE_SERVICE) {
//     globalThis.DEFAULT_VALUE_SERVICE = true
/**
 * A {@link DefaultValue} inside a {@link DefaultValue} is not allowed
 */
class DefaultValue {
    #value;
    constructor(value) {
        if (isDefault(value)) {
            throw new TypeError(`The value in ${DefaultValue.name} must not be another ${DefaultValue.name}`);
        }
        if (isNotSet(value)) {
            throw new TypeError(`The value in ${DefaultValue.name} must not be the NotSet constant: ${NotSet}`);
        }
        this.#value = value;
        Object.freeze(this);
    }
    valueOf() {
        return this.#value;
    }
    toString() {
        return String(this.#value);
    }
    [Symbol.toPrimitive]() {
        return this.#value;
    }
    static {
        Object.freeze(DefaultValue);
    }
}
// }
export function wrapDefault(value) {
    return new DefaultValue(value);
}
export function isDefault(value) {
    return value instanceof DefaultValue;
}
export function defaultEqual(value1, value2) {
    return value1?.valueOf() == value2?.valueOf();
}
export function defaultIsUndefined(value) {
    return value === undefined || (value !== null && value.valueOf() === undefined);
}
export function defaultIsNullable(value) {
    return value?.valueOf() == null;
}
/**
 * ?? operator but works with {@link DefaultValue}
 * @param value1
 * @param value2
 */
export function defaultNullishCoalescing(value1, value2) {
    if (value1 == null || value1.valueOf() == null) {
        return value2;
    }
    return value1;
}
export function extractFromDefault(value) {
    if (isDefault(value)) {
        return value.valueOf();
    }
    return value;
}
// -----------------------------------------------------------------------------------
// This constant is used as a placeholder for values that are not set (undefined isn't good because inputs do not accept it as a real value)
export const NotSet = 'NOT_SET';
export function isNotSet(value) {
    return value === NotSet;
}
export function notSetToUndefined(value) {
    if (value === NotSet) {
        return undefined;
    }
    return value;
}
export { DefaultValue };
//# sourceMappingURL=DefaultValueService.js.map