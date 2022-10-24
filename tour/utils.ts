/**
 * Checks if the arrays are equal<br>
 * Ignores order of the items and if one item appears more often in one array than in the other
 * @param array1
 * @param array2
 * @param compare
 */
import {Data} from "./Data.js";

function arrayEqualsContain<T1 extends unknown>(array1: readonly T1[] | undefined | null, array2: readonly T1[] | undefined | null, compare?: (a: NonNullable<typeof array1>[number], b: NonNullable<typeof array2>[number], oldCompare: (a1: typeof a, b1: typeof b) => boolean) => boolean): array2 is T1[] {
    if (array1 === array2) {
        // if both are null / undefined / Array and equals it's ok, otherwise not
        if (array1 == null) {
            return true;
        }

    }
    if (!Array.isArray(array1) || !Array.isArray(array2)) {
        return false;
    }
    if (array1 == null || array2 == null) {
        // s.o. they are not equal (and undefined === undefined is always true)
        return false;
    }
    const originalCompare: Parameters<NonNullable<typeof compare>>[2] = (a, b) => {
        if (a === b) {
            return true;
        }
        if (a instanceof Data) {
            return a.equals(b as any);
        } else if (b instanceof Data) {
            return b.equals(a as any);
        }
        return false;
    };
    if (!compare) {
        compare = originalCompare;
    }
    for (let item of array1) {
        if (!array2.some(v => compare!(item, v, originalCompare))) {
            return false;
        }
    }
    for (let item of array2) {
        if (!array1.some(v => compare!(item, v, originalCompare))) {
            return false;
        }
    }
    return true;
}

export {arrayEqualsContain};
