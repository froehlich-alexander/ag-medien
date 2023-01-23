/**
 * Checks if the arrays are equal<br>
 * Ignores order of the items and if one item appears more often in one array than in the other
 * @param array1
 * @param array2
 * @param compare
 */
import { Data } from "./Data.js";
function arrayEqualsContain(array1, array2, compare) {
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
    const originalCompare = (a, b) => {
        if (a === b) {
            return true;
        }
        if (a instanceof Data) {
            return a.equals(b);
        }
        else if (b instanceof Data) {
            return b.equals(a);
        }
        return false;
    };
    if (!compare) {
        compare = originalCompare;
    }
    for (let item of array1) {
        if (!array2.some(v => compare(item, v, originalCompare))) {
            return false;
        }
    }
    for (let item of array2) {
        if (!array1.some(v => compare(item, v, originalCompare))) {
            return false;
        }
    }
    return true;
}
export { arrayEqualsContain };
//# sourceMappingURL=utils.js.map