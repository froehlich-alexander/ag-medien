import {ClickableData, Data, DataClass, DataTypeInitializer, DataWiths} from "../../tour/Data";
import {describe, test, expect} from "@jest/globals";

describe("Test Data classes", function () {
    const testDataFields: (keyof TestDataType)[] = ["testField1", "testFieldArray", "notIncludedWith"];

    interface TestDataJson extends TestDataType {
    }

    interface TestDataType {
        testField1: string,
        testFieldArray: number[],
        notIncludedWith: boolean,
    }

    interface TestData extends DataTypeInitializer<TestDataType> {
    }

    class TestData<T extends TestDataType = TestDataType, TUnion extends TestDataType = T> extends Data<T | TestDataType, TUnion&TestDataType> {
        declare json: TestDataJson;
        declare field: TUnion&TestDataType;

        constructor(other: TestDataType) {
            super();
            this.setFields(other);
            this.onConstructionFinished(TestData);
        }

        static {
            DataClass<typeof this, TestDataType>(this, testDataFields, ["notIncludedWith"]);
        }

        public static default = new TestData({
            testFieldArray: [1, 2],
            testField1: "default",
            notIncludedWith: false,
        });

        public testMethod() {
            return 3;
        }

        static {
            this.makeImmutable();
        }
    }

    test("Data base class (without subclasses)", () => {

        // static side
        expect(TestData.staticFields).toEqual(testDataFields);
        expect(TestData.default.fields).toBe(TestData.staticFields);

        // do not include type declarations
        expect(TestData.default.field).toBeUndefined();
        expect(TestData.default.json).toBeUndefined();

        //equals
        expect(TestData.default.equals(TestData.default)).toBe(true);
        expect(TestData.default.equals(TestData.default.withTestField1("111"))).toBe(false);
        expect(TestData.default.equals(undefined)).toBe(false);
        expect(TestData.default.equals(null)).toBe(false);
        expect(TestData.default.equals("dd" as any)).toBe(false);

        expect(TestData.default.equals({
            testField1: "default",
            testFieldArray: [1, 2],
            notIncludedWith: false,
        })).toBe(true);

        expect(TestData.default.equals(TestData.default.withUpdate({}))).toBe(true);
        expect(TestData.default.equals(TestData.default.withUpdate({testField1: "2"}))).toBe(false);

        expect(TestData.default.withUpdate({testField1: "324"}).equals(TestData.default.withTestField1("324"))).toBe(true);

        // get fields
        expect(TestData.default.testField1).toBe("default");
        expect(TestData.default.testFieldArray).toEqual([1, 2]);

        // custom methods work
        expect(TestData.default.testMethod()).toBe(3);

        // ignore withs
        expect((TestData.default as any).withNotIncludedWith).toBeUndefined();
        expect(TestData.default.notIncludedWith).toBe(false);

        // toJSON
        expect(TestData.default.toJSON()).toEqual({
            testField1: "default",
            testFieldArray: [1, 2],
            notIncludedWith: false,
        } as TestDataJson);
    });

    test("Data base class WITH SUBCLASSES", () => {
        const derivedDataFields: (keyof DerivedDataType)[] = ["secondField"];

        interface DerivedDataJson extends Omit<DerivedDataType, 'secondField'> {
            second_field: 7|8,
        }

        interface DerivedDataType extends TestDataType {
            secondField: 7 | 8,
        }

        interface DerivedData extends DataTypeInitializer<DerivedDataType, "notIncludedWith"> {
        }

        class DerivedData extends TestData<DerivedDataType> {
            declare json: DerivedDataJson;

            constructor({secondField, ...other}: DerivedDataType) {
                super(other);
                this.setFields({secondField: secondField});
                this.onConstructionFinished(DerivedData);
            }

            static {
                DataClass<typeof DerivedData, DerivedDataType>(DerivedData, derivedDataFields, ["notIncludedWith"]);
            }

            public override toJSON(): this["json"] {
                return {
                    ...this.partialToJSON('secondField'),
                    second_field: this.secondField,
                }
            }

            public static override default: DerivedData = new DerivedData({
                secondField: 7,
                notIncludedWith: false,
                testField1: "default",
                testFieldArray: [1, 2],
            });

            static {
                this.makeImmutable();
            }
        }

        // static
        expect(DerivedData.staticFields).toEqual((testDataFields as any[]).concat(derivedDataFields));
        expect(DerivedData.default.fields).toEqual(DerivedData.staticFields);

        // get fields
        expect(DerivedData.default.testField1).toBe("default");
        expect(DerivedData.default.testFieldArray).toEqual([1, 2]);

        // custom methods work
        expect(DerivedData.default.testMethod()).toBe(3);

        // ignore withs
        expect((DerivedData.default as any).withNotIncludedWith).toBeUndefined();
        expect(DerivedData.default.notIncludedWith).toBe(false);

        // toJSON
        expect(DerivedData.default.toJSON()).toEqual({
            testField1: "default",
            testFieldArray: [1, 2],
            notIncludedWith: false,
            second_field: 7,
        } as DerivedDataJson);

        // immutable
        expect(Object.isFrozen(DerivedData)).toBe(true);
        expect(Object.getPrototypeOf(DerivedData.default)).toBe(DerivedData.prototype);
        expect(Object.isFrozen(DerivedData.default)).toBe(true);
        expect(() => DerivedData.default.secondField = 7).toThrowError();
    });

    test("Clickable equality", () => {
        const defaultTextRaw = ClickableData.default;
        const defaultClickable = ClickableData.fromJSON(defaultTextRaw);
        const n = defaultClickable.withGoto!("newGoto");
        expect(defaultClickable.equals(n)).toBe(false);
    });
});
