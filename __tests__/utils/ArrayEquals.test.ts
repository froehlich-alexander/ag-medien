import {arrayEqualsContain} from "../../tour/utils";
import {describe, test, expect} from "@jest/globals";

describe("Array Equals", function () {
    const normalList = [1, 2, "sdf", {}, 2.3, undefined, null] as const;

    test("Same array", () => {
        expect(arrayEqualsContain(normalList, normalList)).toBe(true);
    });

    test("copied array", () => {
        expect(arrayEqualsContain(normalList, normalList.slice())).toBe(true);
    });

    test("different order", () => {
        expect(arrayEqualsContain(normalList, normalList.slice().sort((a, b) => 2))).toBe(true);
    });

    test("different arrays", () => {
        expect(arrayEqualsContain(normalList, normalList.concat(4))).toBe(false);
    });

    test("mutiple occurance of 1 item", () => {
        expect(arrayEqualsContain(normalList, normalList.concat(normalList[3], normalList[1]))).toBe(true);
    });

    test("different object", () => {
        expect(arrayEqualsContain(normalList.concat({a: 43}), normalList.concat({a: 43}))).toBe(false);
    });
    
    test("1 array null / undefined", () => {
        expect(arrayEqualsContain(normalList, undefined)).toBe(false);
        expect(arrayEqualsContain(normalList, null)).toBe(false);
        expect(arrayEqualsContain(undefined, normalList)).toBe(false);
        expect(arrayEqualsContain(null, normalList)).toBe(false);
    });
    
    test("both null / undefined", () => {
        expect(arrayEqualsContain(undefined, undefined)).toBe(true);
        expect(arrayEqualsContain(null, null)).toBe(true);
        expect(arrayEqualsContain(undefined, null)).toBe(false);
        expect(arrayEqualsContain(null, undefined)).toBe(false);
    });
    
    test("non array arguments", () => {
        expect(arrayEqualsContain(normalList, 2 as any)).toBe(false);
        expect(arrayEqualsContain(normalList, '2' as any)).toBe(false);
        expect(arrayEqualsContain(normalList, {} as any)).toBe(false);
        expect(arrayEqualsContain(normalList, true as any)).toBe(false);

        expect(arrayEqualsContain(2 as any, 2 as any)).toBe(false);
        expect(arrayEqualsContain("2" as any, '2' as any)).toBe(false);
        expect(arrayEqualsContain({} as any, {} as any)).toBe(false);
        expect(arrayEqualsContain(true as any, true as any)).toBe(false);
    });

    test("custom compare func", () => {
        const compare = (a: any, b: any, oldComp: (a: any, b: any) => boolean) => {
            if (oldComp(a, b)) {
                return true;
            }
            if (typeof a === "object" && a != null && b != null && typeof b === "object") {
                for (let [k, v] of Object.entries(a)) {
                    if (b[k] !== v) {
                        return false;
                    }
                }
                return true;
            }
            return false;
        };
        expect(arrayEqualsContain(normalList.concat({a: 43}), normalList.concat({a: 43}), compare)).toBe(true);
    });
});
