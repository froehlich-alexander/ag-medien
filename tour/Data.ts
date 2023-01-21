import {arrayEqualsContain} from "./utils.js";
import type {MediaContextType} from "./tour-dev-tool/TourContexts";
import type {Complete, UnFlatArray} from "./tour-dev-tool/utils";
import type {
    AbstractJsonInlineObject,
    ActionType,
    AddressableObjects,
    AnimationType,
    CustomAnimations,
    FetchPriorityType,
    IconType,
    InlineObjectPosition,
    InlineObjectType,
    JsonActivating,
    JsonAddressableObject,
    JsonClickable,
    JsonCustomObject,
    JsonInlineObject,
    JsonMedia,
    JsonPage,
    JsonSchulTourConfigFile,
    JsonSource,
    JsonTextField,
    LoadingType,
    MediaType,
    PageAnimations,
    TextAnimations,
    TextFieldSize,
    VideoPreloadType,
} from "./types";

export const mediaFolder = "media";

type DataTypeWithoutFields<T extends Data> = { [k in keyof Omit<T, "fields" | "field" | "json"> as T[k] extends Function ? never : k]: T[k] };
type DataType<T extends Data> = //Pick<T, T["field"]>;
    T extends Data<infer U, infer U1> ? U1 : never;
type JsonFromDataType<T extends { [k: string]: any }> = {
    [k in keyof T]:
    (T[k] extends { toJSON: () => infer JsonRet }
        ? (JsonRet extends Record<symbol | string | number, any> ? JsonFromDataType<JsonRet> : JsonRet)
        : (T[k] extends Array<infer AType>
            ? Array<(AType extends Record<symbol | string | number, any> ? JsonFromDataType<AType> : AType)>
            : T[k]))
};

type JsonType<T extends Data> = T["json"];
type DeepDataType<T extends Data> = {
    [k in keyof DataType<T>]: (DataType<T>[k] extends Data ? DeepDataType<DataType<T>[k]> : DataType<T>[k])
    | (DataType<T>[k] extends undefined ? undefined : never)
};

const uniqueId = (() => {
    let currentId = 0;
    const map = new WeakMap<object, number>();

    return (object: object): number => {
        if (!map.has(object)) {
            map.set(object, ++currentId);
        }

        return map.get(object)!;
    };
})();

type DataWiths<T extends { [k: string]: any }> = { [k in keyof T as (k extends string ? `with${Capitalize<k>}` : never)]-?: (value: T[k]) => any };

type DataClassType<T extends Data> = T & DataWiths<DataType<T>>;

export type DataTypeInitializer<T extends { [k: string]: any },
    Exclude extends keyof T = never, ParentType extends Data = Data<{}>> =
    T
    & DataWiths<Omit<T, Exclude | (ParentType extends Data<infer DataType> ? keyof DataType : never)>>;

/**
 * Use this in a static blog of a class, but place this block BEFORE all other static methods / fields, as this function initializes the fields, etc.<br>
 * You should also place a static blog containing {@link this.makeImmutable} AFTER all other static method / fields,
 * because that function freezes the static part of the class. Tying to alter that static part after the execution of that function will throw an error<br>
 * Example:
 * <pre>
 * class A extends Data {
 *     normalDataField;
 *     static anyField = [1, 2, 3]; // ok as long as you do not use this classes constructor here
 *
 *     static anyMethod(){
 *         return new A({}); // ERROR because DataClass initialization is not done yet
 *     }
 *
 *     constructor(other){}
 *
 *     static {
 *         DataClass(this, ["normalDataField"]); // DataClass initialization
 *     }
 *
 *     static anyMethod(){
 *         return new A({}); // ok because after DataClass initialization
 *     }
 *
 *     static {
 *         this.makeImmutable();
 *     }
 *     static wrongStaticField = 'wrong' // this will throw an error
 * }
 * </pre>
 * @param parent
 * @param fields
 * @param noWith
 * @constructor
 */
function DataClass<T extends typeof Data<any>, T1 extends { [k: string]: any; }>(parent: T, fields: (keyof T1 & string)[], noWith: (keyof T1 & string)[] = []):
    (Omit<T, "new" | "prototype"> & { new(...args: ConstructorParameters<T>): T1 & DataWiths<T1>, prototype: T1 & DataWiths<T1> }) {
    // type dataType = { [k in keyof (typeof fields[number])]: T1[k] };

    // set static fields
    // we NEED to use Object.defineProperty here, otherwise js thinks we want to alter Data.staticFields, which would result in an error
    Object.defineProperty(parent, "staticFields", {
        value: [...(parent.prototype.constructor as typeof Data).staticFields, ...fields],
        enumerable: true,
        writable: false,
        configurable: false,
    });

    for (let field of fields) {
        if (noWith.includes(field)) {
            continue;
        }
        let withMethodName = `with${field[0].toUpperCase()}${field.slice(1)}`;
        Object.defineProperty(parent.prototype, withMethodName, {
            value: function (this: T1, value: T1[typeof field]): T1 & typeof parent["prototype"] {
                if (value === this[field]) {
                    return this as T1 & typeof parent["prototype"];
                }
                return new (this.constructor as typeof Data)({
                    ...this,
                    [field]: value,
                }) as T1 & typeof parent["prototype"];
            },
            writable: false,
            configurable: false,
        });
    }

    // add default stub
    // without this, there would be an error if a class defines static default and the parent class does that too
    if (!Object.hasOwn(parent, "default")) {
        Object.defineProperty(parent, "default", {
            value: undefined,
            writable: true,
            configurable: false,
        });
    }

    // add from json stub
    // without this, there would be an error if a class defines static fromJSON and the parent class does that too
    if (!Object.hasOwn(parent, "fromJSON")) {
        Object.defineProperty(parent, "fromJSON", {
            value: undefined,
            writable: true,
            configurable: false,
        });
    }

    Object.freeze(parent.staticFields);
    // Object.freeze(parent);
    // Object.freeze(parent.prototype);
    return parent as any;
}

class Data<T extends { [k: string]: any } = any, TUnion extends { [k: string]: any } = T> {
    public static readonly staticFields: string[] = [];
    // these 2 will never exist at runtime
    declare public readonly json: {};
    declare public readonly field: any;

    constructor(placeholder?: {}) {
        this.onConstructionFinished(Data);
    }

    static {
        DataClass<typeof this, {}>(this, []);
    }

    /**
     * Place a call to this method <b>AFTER</b> all other static methods / fields,
     * because this function freezes the static part of the class. Tying to alter that static part after the execution of that function will throw an error<br>
     * Example:
     * <pre>
     * class A extends Data {
     *     normalDataField;
     *     static anyField = [1, 2, 3]; // ok as long as you do not use this classes constructor here
     *
     *     static anyMethod(){
     *         return new A({}); // ERROR because DataClass initialization is not done yet
     *     }
     *
     *     constructor(other){}
     *
     *     static {
     *         DataClass(this, ["normalDataField"]); // DataClass initialization
     *     }
     *
     *     static anyMethod(){
     *         return new A({}); // ok because after DataClass initialization
     *     }
     *
     *     static {
     *         this.makeImmutable();
     *     }
     *     static wrongStaticField = 'wrong' // this will throw an error
     * }
     * </pre>
     * @protected
     */
    protected static makeImmutable() {
        Object.freeze(this);
        Object.freeze(this.prototype);
    }

    // public readonly fields: (this["field"])[] = [];

    protected onConstructionFinished<T extends typeof Data<any>>(staticClass: T) {//, ...fields: UnFlatArray<this["field"], 2, true, true>) {
        // this.fields.push(...fields.flat());
        if (staticClass.prototype === Object.getPrototypeOf(this)) {
            // register withXxx functions
            // for (let i of this.fields as (string & keyof DataType<this>)[]) {
            //     Object.defineProperty(this, `with${i[0].toUpperCase() + i.slice(1)}`, {
            //         writable: false,
            //         value: (value: any): this => {
            //             if (value === this[i]) {
            //                 return this;
            //             }
            //             return new (this.constructor as typeof Data)({...this, [i]: value}) as this;
            //         },
            //     });
            // }
            Object.freeze(this);
        }
    }

    /**
     * only allowed in constructor
     * @protected
     */
    public setFields(other: Partial<T>): void {
        for (let [k, v] of Object.entries(other) as ([keyof TUnion, TUnion[keyof TUnion]])[]) {
            if (this.fields.includes(k as string)) {
                this[k as keyof this] = v as unknown as this[keyof this];
            } else {
                console.warn("You tried to set a field that is not present in this.fields!!!", "Your Field:", k,
                    "Allowed fields:", this.fields);
            }
        }
    }

    public equals(other: Omit<TUnion, typeof ignore[number]> | null | undefined, ...ignore: (keyof TUnion)[]): other is TUnion {
        if (other == null || typeof other !== "object") {
            return false;
        }
        //@ts-ignore
        else if (this === other) {
            return true;
        }
        for (let field of this.fields) {
            if (ignore.includes(field)) {
                continue;
            }
            const thisVal: undefined | this[this["field"]] = this[field as keyof this];
            // @ts-ignore
            const otherVal = other[field];

            if (thisVal === otherVal) {
                continue;
            }
            // use equals method if available
            // @ts-ignore
            if (thisVal?.equals) {
                if (!thisVal.equals(otherVal)) {
                    return false;
                }
            } else if (Array.isArray(thisVal)) {
                //compare arrays
                if (!Array.isArray(otherVal)) {
                    return false;
                }
                if (!arrayEqualsContain(thisVal, otherVal)) {
                    return false;
                }
            } else {
                return false;
            }
        }
        return true;
    };

    public toJSON(): this["json"] {
        return this.partialToJSON() as this["json"];
    };

    protected partialToJSON<Keys extends keyof TUnion>(...skip: Keys[]): Omit<JsonFromDataType<TUnion>, Keys> {
        function transformObjectToJson<T>(obj: T): any {
            if (typeof obj === "object" && obj !== null && "toJSON" in obj) {
                return (obj as unknown as { toJSON: () => unknown }).toJSON();
            } else if (Array.isArray(obj)) {
                return (obj as Array<unknown>).map(transformObjectToJson);
            }
            return obj;
        }

        const jsonObj: JsonFromDataType<TUnion> = {} as JsonFromDataType<TUnion>;
        for (let i of this.fields) {
            if (skip.includes(i as Keys)) {
                continue;
            }
            // skip undefined values
            if (this[i as keyof this] === undefined) {
                continue;
            }
            jsonObj[i as keyof TUnion] = transformObjectToJson(this[i as keyof this]);
            // if (typeof this[i] === "object" && "toJSON" in this[i]) {
            //     jsonObj[i] = this[i].toJSON();
            // }
            // else {
            //     jsonObj[i] = this[i];
            // }
            // jsonObj[i] = this[i]?.toJSON?.() ?? this[i];
        }
        return jsonObj;
    }

    public withUpdate(other: Partial<T>): this {
        const thisAttrs = {} as TUnion;
        for (let [k, v] of Object.entries(this) as [keyof TUnion, TUnion[keyof TUnion]][]) {
            if (this.fields.includes(k as string)) {
                thisAttrs[k] = v;
            }
        }
        // a bit of performance
        if (!Object.keys(thisAttrs).length) {
            return this;
        }
        const updated = new (this.constructor as { new(other: TUnion): any; })({...thisAttrs, ...other});
        if (this.equals(updated)) {
            return this;
        } else {
            return updated;
        }
    }

    public get fields(): (string)[] {
        return (this.constructor as typeof Data).staticFields;
    }

    static {
        this.makeImmutable();
    }
}

interface AbstractAddressableObjectType {
    readonly id: string,
    readonly animationType: AnimationType,
}

interface AbstractAddressableObject<T, TUnion> extends AbstractAddressableObjectType, DataWiths<AbstractAddressableObjectType> {
}

class AbstractAddressableObject<T extends AbstractAddressableObjectType = AbstractAddressableObjectType, TUnion extends AbstractAddressableObjectType = T> extends Data<T | AbstractAddressableObjectType, TUnion & AbstractAddressableObjectType> {
    public readonly declare json: JsonAddressableObject;
    declare public readonly field: keyof T | keyof AbstractAddressableObjectType;

    // public readonly id: string;
    // public readonly animationType: AnimationType;
    static {
        DataClass<typeof AbstractAddressableObject, AbstractAddressableObjectType>(AbstractAddressableObject, ["id", "animationType"], []);
    }

    constructor({id, animationType}: AbstractAddressableObjectType) {
        super();
        this.setFields({
            id: id,
            animationType: animationType,
        });
        // this.id = id;
        // this.animationType = animationType;
        this.onConstructionFinished(AbstractAddressableObject);
    }

    public isAddressable() {
        return true;
    }

    // public equals(other: DataType<AbstractAddressableObject<T, Json>> | undefined | null, ...ignore: (keyof T)[]): other is DataType<AbstractAddressableObject<T, Json>> {
    //     return other != null && (this === other || (
    //         (this.id === other!.id || ignore.includes("id"))
    //         && (this.animationType === other!.animationType || ignore.includes("animationType"))
    //     ));
    // }
    //
    // public toJSON(): { [k in keyof JsonAddressableObject]: Json[k] } {
    //     return {
    //         id: this.id,
    //         animationType: this.animationType,
    //     };
    // }
    //
    // public withId(id: string): this {
    //     if (this.id === id) {
    //         return this;
    //     }
    //     return new (this.constructor as typeof AbstractAddressableObject)({...this, id: id}) as this;
    // }
    //
    // public withAnimationType(animationType: AnimationType): this {
    //     if (this.animationType === animationType) {
    //         return this;
    //     }
    //     return new (this.constructor as typeof AbstractAddressableObject)({
    //         ...this,
    //         animationType: animationType,
    //     }) as this;
    // }
    static {
        this.makeImmutable();
    }
}

// type AbstractAddressableObject = DataClassType<AbstractAddressableObject>;

interface AbstractInlineObjectDataType {
    // standard attributes
    readonly x: number;
    readonly y: number;
    readonly type: InlineObjectType;
    readonly position: InlineObjectPosition;

    // undefined is allowed for things like clickable because we always have a fallback value from the Addressable Object itself
    // (therefore undefined is NOT allowed for addressable object - see AbstractAddressableInlineObjectDataType)
    readonly animationType: AnimationType | undefined;
    readonly hidden: boolean;
}

interface AbstractInlineObjectData<T, TUnion> extends DataTypeInitializer<AbstractInlineObjectDataType, "type"> {
}

class AbstractInlineObjectData<T extends AbstractInlineObjectDataType = AbstractInlineObjectDataType, TUnion extends AbstractInlineObjectDataType = T> extends Data<T | AbstractInlineObjectDataType, TUnion & AbstractInlineObjectDataType> {
    declare public readonly json: AbstractJsonInlineObject;
    declare public readonly field: keyof T & keyof AbstractInlineObjectDataType;

    static {
        DataClass<typeof AbstractInlineObjectData, AbstractInlineObjectDataType>(AbstractInlineObjectData, ["x", "y", "type", "position", "animationType", "hidden"], ["type"]);
    }

    constructor({x, y, animationType, position, type, hidden}: AbstractInlineObjectDataType) {
        super();
        // standard
        this.setFields({
            x: Math.round(x * 10 ** InlineObjectData.CoordinateDigits) / 10 ** InlineObjectData.CoordinateDigits,
            y: Math.round(y * 10 ** InlineObjectData.CoordinateDigits) / 10 ** InlineObjectData.CoordinateDigits,
            type: type,
            position: position,
            animationType: animationType,
            hidden: hidden,
        });
        this.onConstructionFinished(AbstractInlineObjectData);
    }

    public isClickable(): this is ClickableData {
        return this.type === "clickable";
    }

    public isTextField(): this is TextFieldData {
        return this.type === "text";
    }

    public isCustom(): this is CustomObjectData {
        return this.type === "custom";
    }

    public isAddressable(): this is AbstractAddressableInlineObjectData {
        return this instanceof AbstractAddressableInlineObjectData;
    }

    public withType(type: InlineObjectType): InlineObjectData {
        const constr = InlineObjectData.constructorFromType(type);
        return new constr(constr.default.withUpdate(this) as any);
        // return new (this.constructor as typeof AbstractInlineObjectData)({...this, type: type}) as this;
    }

    static {
        this.makeImmutable();
    }
}

// function AbstractAddressable<T extends AbstractInlineObjectData<any, any> | Data<any>, Json extends JsonAddressableObject>(base: typeof AbstractInlineObjectData|typeof Data) {
//     // let constr = base ?? Data;
//
//     // @ts-ignore
//     interface AbstractAddressableObject extends Data<any>, T {
//     }
//
//     class AbstractAddressableObject extends base {
//         public declare excludeFromDataType: "excludeFromDataType";
//
//         public readonly id: string;
//         public readonly animationType: AnimationType;
//
//         protected constructor({id, animationType, ...base}: DataType<AbstractAddressableObject>) {
//             super(base);
//             this.id = id;
//             this.animationType = animationType;
//             this.onConstructionFinished(AbstractAddressableObject);
//         }
//
//         public equals(other: DataType<AbstractAddressableObject> | undefined | null): other is DataType<AbstractAddressableObject> {
//             return super.equals(other)
//                 && this.id === other!.id
//                 && this.animationType === other!.animationType;
//         }
//
//         public toJSON(): { [k in keyof Pick<Json, keyof (JsonAddressableObject)>]: Json[k] } {
//             return {
//                 ...super.toJSON(),
//                 id: this.id,
//                 animationType: this.animationType,
//             };
//         }
//
//         public withId(id: string): this {
//             if (this.id === id) {
//                 return this;
//             }
//             return new (this.constructor as typeof AbstractAddressableObject)({...this, id: id}) as this;
//         }
//
//         public withAnimationType(animationType: AnimationType): this {
//             if (this.animationType === animationType) {
//                 return this;
//             }
//             return new (this.constructor as typeof AbstractAddressableObject)({
//                 ...this,
//                 animationType: animationType,
//             }) as this;
//         }
//     }
//
//     return AbstractAddressableObject;
// }

interface AbstractAddressableInlineObjectDataType extends AbstractInlineObjectDataType {
    readonly id: string,
    readonly animationType: AnimationType,
}

// @ts-ignore
interface AbstractAddressableInlineObjectData<T extends AbstractAddressableInlineObjectDataType> extends DataTypeInitializer<AbstractAddressableInlineObjectDataType, never, AbstractInlineObjectData> {
}

class AbstractAddressableInlineObjectData<T extends AbstractAddressableInlineObjectDataType = AbstractAddressableInlineObjectDataType, TUnion extends AbstractAddressableInlineObjectDataType = T> extends AbstractInlineObjectData<T | AbstractAddressableInlineObjectDataType, TUnion & AbstractAddressableInlineObjectDataType> {
    public readonly declare json: JsonAddressableObject & AbstractInlineObjectData["json"];

    constructor({id, ...base}: AbstractAddressableInlineObjectDataType) {
        super(base);
        this.setFields({
            id: id,
        });
        this.onConstructionFinished(AbstractAddressableInlineObjectData);
    }

    static {
        DataClass<typeof this, AbstractAddressableInlineObjectDataType>(this, ["id"]);
    }

    // this is because AbstractInlineObject allows undefined on animationType - see AbstractInlineObjectDataType
    // @ts-ignore
    declare withAnimationType: (value: AnimationType) => AbstractAddressableInlineObjectData;

    static {
        this.makeImmutable();
    }
}

// type AbstractAddressableInlineObjectData = DataClassType<_AbstractAddressableInlineObjectData>;

interface AbstractActivatingInlineObjectDataType extends AbstractInlineObjectDataType {
    readonly goto?: string;
    readonly targetType: AddressableObjects | "auto";
    readonly action: ActionType;
    readonly scroll?: ScrollData;
}

interface AbstractActivatingInlineObjectData<T extends AbstractActivatingInlineObjectDataType> extends DataTypeInitializer<AbstractActivatingInlineObjectDataType, never, AbstractInlineObjectData> {
}

class AbstractActivatingInlineObjectData<T extends AbstractActivatingInlineObjectDataType = AbstractActivatingInlineObjectDataType, TUnion extends AbstractActivatingInlineObjectDataType = T> extends AbstractInlineObjectData<T | AbstractActivatingInlineObjectDataType, TUnion & AbstractActivatingInlineObjectDataType> {
    declare json: JsonActivating & AbstractInlineObjectData["json"];
    //
    // public readonly goto?: string;
    // public readonly targetType: AddressableObjects | "auto";
    // public readonly action: ActionType;
    // public readonly scroll: ScrollData;

    constructor({goto, targetType, action, scroll, ...base}: AbstractActivatingInlineObjectDataType) {
        super(base);
        this.setFields({
            goto: goto,
            targetType: targetType,
            action: action,
            scroll: scroll,
        });
        this.onConstructionFinished(AbstractActivatingInlineObjectData);
    }

    static {
        DataClass<typeof this, AbstractActivatingInlineObjectDataType>(this, ["goto", "targetType", "action", "scroll"]);
    }

    // public toJSON(): { [k in keyof Pick<Json, keyof (AbstractJsonInlineObject & JsonActivating)>]: Json[k] } {
    //     return {
    //         ...super.toJSON(),
    //         goto: this.goto,
    //         targetType: this.targetType,
    //         action: this.action,
    //         scroll: {
    //             start: 1,
    //             end: 1,
    //             time: 1,
    //         },
    //     };
    // }
    //
    // public equals(other: DataType<AbstractActivatingInlineObjectData<T, Json>> | undefined | null): other is DataType<AbstractActivatingInlineObjectData<T, Json>> {
    //     return super.equals(other)
    //         && this.goto === other.goto
    //         && this.targetType === other.targetType;
    // }
    //
    // public withGoto(goto: string): this {
    //     if (this.goto === goto) {
    //         return this;
    //     }
    //     return new (this.constructor as typeof AbstractActivatingInlineObjectData)({...this, goto: goto}) as this;
    // }
    //
    // public withTargetType(targetType: AddressableObjects): this {
    //     if (this.targetType === targetType) {
    //         return this;
    //     }
    //     return new (this.constructor as typeof AbstractActivatingInlineObjectData)({
    //         ...this,
    //         targetType: targetType,
    //     }) as this;
    // }
    static {
        this.makeImmutable();
    }
}

// type AbstractActivatingInlineObjectData = DataClassType<AbstractActivatingInlineObjectData>;

const InlineObjectData = {
    CoordinateDigits: 3,
    CentralPositionDigits: 3,
    DestinationScrollDigits: 3,

    Types: (["clickable", "text", "custom"] as Array<InlineObjectType>),
    Positions: (["media", "page"] as Array<InlineObjectPosition>),
    AnimationTypes: (["forward", "backward", "fade", "none"] as Array<AnimationType>),

    fromJSON(json: JsonInlineObject): InlineObjectData {
        switch (json.type) {
            case "clickable":
                return ClickableData.fromJSON(json);
            case "text":
                return TextFieldData.fromJSON(json);
            case "custom":
                return CustomObjectData.fromJSON(json);
        }
    },

    constructorFromType(type: InlineObjectType): InlineObjectDataConstructor {
        switch (type) {
            case "clickable":
                return ClickableData;
            case "text":
                return TextFieldData;
            case "custom":
                return CustomObjectData;
        }
    },

    default(): InlineObjectData {
        return ClickableData.default;
    },
};

type InlineObjectData = ClickableData | CustomObjectData | TextFieldData;
export type InlineObjectDataConstructor = typeof ClickableData | typeof CustomObjectData | typeof TextFieldData;

interface ClickableDataType extends AbstractActivatingInlineObjectDataType {
    readonly title: string,
    readonly icon: IconType,
    // the scroll (percentage) where we arrive at the target
    readonly destinationScroll: number | "auto",
}

interface ClickableData extends DataTypeInitializer<ClickableDataType, never, AbstractActivatingInlineObjectData> {
}

class ClickableData extends AbstractActivatingInlineObjectData<ClickableDataType, ClickableDataType> {
    declare public readonly json: JsonClickable & AbstractActivatingInlineObjectData["json"];

    declare public readonly type: "clickable";

    public static readonly Icons: Array<IconType> = ["arrow_l", "arrow_u", "arrow_r", "arrow_d"];

    constructor({title, icon, destinationScroll, ...r}: ClickableDataType) {
        super({...r, type: "clickable"});
        this.setFields({
            title: title,
            icon: icon,
            destinationScroll: typeof destinationScroll === "string" ? destinationScroll
                : Math.round(destinationScroll * 10 ** InlineObjectData.DestinationScrollDigits) / 10 ** InlineObjectData.DestinationScrollDigits,
        });
        this.onConstructionFinished(ClickableData);
    }

    static {
        DataClass<typeof this, ClickableData>(this, ["title", "icon", "destinationScroll"]);
    }

    public static default: ClickableData = new ClickableData({
        icon: "arrow_l",
        title: "",
        animationType: undefined,
        goto: "",
        targetType: "auto",
        x: 0,
        y: 0,
        type: "clickable",
        position: "media",
        hidden: false,
        action: "activate",
        destinationScroll: "auto",
    });

    public static fromJSON(json: Omit<JsonClickable, "type">): ClickableData {
        return new ClickableData({
            type: "clickable",
            title: json.title,
            icon: json.icon ?? ClickableData.default.icon,
            x: typeof json.x === "number" ? json.x : parseFloat(json.x),
            y: typeof json.y === "number" ? json.y : parseFloat(json.y),
            goto: json.goto,
            action: json.action ?? ClickableData.default.action,
            targetType: json.targetType ?? ClickableData.default.targetType,
            position: json.position ?? ClickableData.default.position,
            animationType: json.animationType ?? ClickableData.default.animationType,
            hidden: json.hidden ?? ClickableData.default.hidden,
            destinationScroll: json.destinationScroll ?? ClickableData.default.destinationScroll,
        });
    }

    // public override toJSON(): this["json"] {
    //     return {
    //         ...super.partialToJSON(),
    //         destinationScroll: this.destinationScroll
    //     }
    // }

    // public equals(other: DataType<ClickableData> | undefined | null): other is DataType<ClickableData> {
    //     return super.equals(other)
    //         && this.title === other.title
    //         && this.icon === other.icon;
    // }
    //
    // public toJSON(): JsonClickable {
    //     return {
    //         ...super.toJSON(),
    //         title: this.title,
    //         icon: this.icon,
    //     } as JsonClickable;
    //     // we need to cast here because JsonActivating is dynamic
    // }
    //
    // public withIcon(icon: IconType): ClickableData {
    //     return new ClickableData({...this, icon: icon});
    // }
    //
    // public withTitle(title: string): ClickableData {
    //     return new ClickableData({...this, title: title});
    // }
    static {
        this.makeImmutable();
    }
}

// type ClickableData = DataClassType<ClickableData>;

// interface TextFieldData extends AbstractInlineObjectData<TextFieldData, JsonTextField>{}
interface TextFieldDataType extends AbstractAddressableInlineObjectDataType {
    readonly title?: string;
    readonly content: string;
    readonly cssClasses: string[];
    readonly size: TextFieldSize;
}

interface TextFieldData extends DataTypeInitializer<TextFieldDataType, never, AbstractAddressableInlineObjectData> {
}

class TextFieldData extends AbstractAddressableInlineObjectData<TextFieldDataType> {
    declare public readonly json: JsonTextField;
    //
    // public readonly title?: string;
    // public readonly content: string;
    // public readonly cssClasses: string[];
    // public readonly size: TextFieldSize;
    // public readonly id: string;

    declare public readonly type: "text";
    declare public readonly animationType: TextAnimations;

    public static readonly Sizes: TextFieldSize[] = ["small", "normal", "large", "x-large", "xx-large"];

    constructor({title, content, cssClasses, size, ...base}: TextFieldDataType) {
        super({...base, type: "text"});
        this.setFields({
            title: title,
            content: content,
            cssClasses: cssClasses,
            size: size,
        });
        // this.title = title;
        // this.content = content;
        // this.cssClasses = cssClasses;
        // this.size = size;
        this.onConstructionFinished(TextFieldData);
    }

    static {
        DataClass<typeof this, TextFieldDataType>(this, ["title", "content", "cssClasses", "size"]);
    }

    public static default: TextFieldData = new TextFieldData({
        type: "text",
        title: "",
        position: "media",
        content: "",
        cssClasses: [],
        size: "normal",
        animationType: "fade",
        id: "",
        x: 0,
        y: 0,
        hidden: false,
    });

    public static fromJSON(json: Omit<JsonTextField, "type">): TextFieldData {
        return new TextFieldData({
            type: "text",
            title: json.title,
            content: json.content,
            cssClasses: typeof json.cssClasses === "string" ? json.cssClasses.split(" ") : json.cssClasses ?? [],
            size: json.size ?? TextFieldData.default.size,
            id: json.id,
            hidden: json.hidden ?? TextFieldData.default.hidden,
            x: typeof json.x === "number" ? json.x : parseFloat(json.x),
            y: typeof json.y === "number" ? json.y : parseFloat(json.y),
            position: json.position ?? TextFieldData.default.position,
            animationType: json.animationType ?? TextFieldData.default.animationType,
        });
    }

    // public equals(other: DataType<TextFieldData> | undefined | null): other is DataType<TextFieldData> {
    //     return super.equals(other) &&
    //         this.title === other.title &&
    //         this.content === other.content &&
    //         this.size === other.size &&
    //         // this.id === other.id &&
    //         arrayEquals(this.cssClasses, other.cssClasses);
    // }
    //
    // public toJSON(): JsonTextField {
    //     return {
    //         ...super.toJSON(),
    //         title: this.title,
    //         content: this.content,
    //         cssClasses: this.cssClasses as Mutable<TextFieldData["cssClasses"]>,
    //         size: this.size,
    //     };
    // }
    //
    // public withTitle(title: string): TextFieldData {
    //     return new TextFieldData({...this, title: title});
    // }
    //
    // public withContent(content: string): TextFieldData {
    //     return new TextFieldData({...this, content: content});
    // }
    //
    // public withCssClasses(cssClasses: string[]): TextFieldData {
    //     return new TextFieldData({...this, cssClasses: cssClasses});
    // }
    //
    // public withFooter(footer: string | undefined): TextFieldData {
    //     return new TextFieldData({...this, footer: footer});
    // }
    //
    // public withSize(size: TextFieldSize): TextFieldData {
    //     if (this.size === size) {
    //         return this;
    //     }
    //     return new TextFieldData({...this, size: size});
    // }
    static {
        this.makeImmutable();
    }
}


// type TextFieldData = DataClassType<TextFieldData>;
interface CustomObjectDataType extends AbstractInlineObjectDataType {
    readonly htmlId: string;
}

interface CustomObjectData extends DataTypeInitializer<CustomObjectDataType, never, AbstractInlineObjectData> {
}

class CustomObjectData extends AbstractInlineObjectData<CustomObjectDataType> {
    declare public readonly json: JsonCustomObject & AbstractActivatingInlineObjectData["json"];
    //
    // public readonly htmlId: string;

    declare public readonly type: "custom";
    declare public readonly animationType: CustomAnimations;

    constructor({htmlId, ...base}: CustomObjectDataType) {
        super({...base, type: "custom"});
        this.setFields({htmlId: htmlId});
        // this.htmlId = htmlId;
        this.onConstructionFinished(CustomObjectData);
    }

    static {
        DataClass<typeof this, CustomObjectDataType>(this, ["htmlId"]);
    }

    public static default: CustomObjectData = new CustomObjectData({
        type: "custom",
        hidden: false,
        x: 0,
        y: 0,
        animationType: "fade",
        position: "media",
        htmlId: "",
    });

    public static fromJSON(json: Omit<JsonCustomObject, "type">): CustomObjectData {
        return new CustomObjectData({
            type: "custom",
            htmlId: json.htmlId,
            x: typeof json.x === "number" ? json.x : parseFloat(json.x),
            y: typeof json.y === "number" ? json.y : parseFloat(json.y),
            position: json.position ?? CustomObjectData.default.position,
            animationType: json.animationType ?? CustomObjectData.default.animationType,
            hidden: json.hidden ?? CustomObjectData.default.hidden,
        });
    }

    // public equals(other: DataType<CustomObjectData> | undefined | null): other is DataType<CustomObjectData> {
    //     return super.equals(other) &&
    //         this.htmlId === other.htmlId;
    // }
    //
    // public toJSON(): JsonCustomObject {
    //     return {
    //         ...super.toJSON(),
    //         htmlId: this.htmlId,
    //     };
    // }
    static {
        this.makeImmutable();
    }
}


// type CustomObjectData = DataClassType<CustomObjectData>;
interface FileDataType {
    readonly name: string;
    readonly size: number;
    readonly type: MediaType;
    readonly file: File;
    readonly intrinsicWidth: number | null;
    readonly intrinsicHeight: number | null;
    readonly url: string;
}

interface FileData extends DataTypeInitializer<FileDataType> {
}

class FileData extends Data<FileDataType> {
    declare public readonly field: keyof Omit<DataTypeWithoutFields<this>, "outdated">;
    declare json: Promise<JsonFileData>;

    // public readonly name: string;
    // public readonly size: number;
    // public readonly type: MediaType;
    // public readonly file: File;
    // public readonly intrinsicWidth: number | null;
    // public readonly intrinsicHeight: number | null;
    // public readonly url: string;

    // we would need to get the complete file content and that need way too much time
    // public readonly hash: number;
    // public readonly base64: string;
    private _outdated = false;

    constructor(other: FileDataType) {
        super();
        this.setFields(other);
        // this.name = name;
        // this.size = size;
        // this.type = type;
        // this.file = file;
        // this.intrinsicWidth = intrinsicWidth;
        // this.intrinsicHeight = intrinsicHeight;
        // this.url = url;
        this.onConstructionFinished(FileData);
        // this.hash = hashString(name+base64);
        // this.base64 = base64;
        // document.body.append(this.img, this.video);
        // this.file.size;
    }

    static {
        DataClass<typeof this, FileDataType>(this, ["name", "size", "type", "file", "intrinsicWidth", "intrinsicHeight", "url"]);
    }

    public static async fromFile(file: File): Promise<FileData> {
        // const stream = file.stream().getReader();
        // let binaryString = '';
        // while (true) {
        //     const data = await stream.read();
        //     if (data.done) {
        //         break;
        //     }
        //     for (let i of data.value) {
        //         binaryString += String.fromCharCode(i);
        //     }
        // }
        const type = MediaData.determineType("auto", file.name);
        const url = URL.createObjectURL(file);
        let width = null, height = null;
        if (type === "img" || type === "video") {
            [width, height] = await FileData.computeWidthHeight(url, type);
        }
        return new FileData({
            name: file.name,
            size: file.size,
            file: file,
            type: type,
            intrinsicWidth: width,
            intrinsicHeight: height,
            url: url,
            // base64: btoa(binaryString),
        });
    }

    public static async computeWidthHeight(url: string, type: MediaType): Promise<[number, number]> {
        // let res: [number, number] | undefined;

        const img = document.createElement("img");
        const video = document.createElement("video");
        video.style.display = "none";
        video.preload = "metadata";

        // const url = URL.createObjectURL(file);
        // console.log("media url:", url);

        // const cleanup = () => {
        //     console.log(img.naturalWidth);
        //     URL.revokeObjectURL(url);
        //     video.src = "";
        //     img.src = "";
        // };

        return new Promise<[number, number]>((resolve, reject) => {
            if (type === "img") {
                img.onload = () => {
                    resolve([img.naturalWidth, img.naturalHeight]);
                    // cleanup();
                };
                img.src = url;
                // res = [this.img.naturalWidth, this.img.naturalHeight];
            } else if (type === "video") {
                video.onloadeddata = () => {
                    resolve([video.videoWidth, video.videoHeight]);
                    // cleanup();
                };
                video.src = url;
                // res = [this.video.videoWidth, this.video.videoHeight]
            } else {
                // cleanup();
                reject("computeWidth Height rejected, because type didnt match, Allowed types: img, video; actual type: " + type);
            }
        });
        // clean up
        // this.img.src = "";
        // this.video.src = "";
        // URL.revokeObjectURL(url);
        // return res;
    }

    // public equals(other: null | undefined | DataType<FileData>): boolean {
    //     return other != null && (this === other || (
    //         this.name === other.name
    //         && this.type === other.type
    //         && this.size === other.size
    //         // && this.hash === other.hash
    //     ));
    // }

    public static fromJSON(json: JsonFileData): FileData {
        const data = atob(json.data);
        const file = new File([data], json.name, {type: "media/image"});
        return new FileData({
            name: json.name,
            size: json.size,
            url: URL.createObjectURL(file),
            intrinsicWidth: json.intrinsicWidth,
            intrinsicHeight: json.intrinsicHeight,
            // base64: json.data,
            file: file,
            type: MediaData.determineType("auto", json.name),
        });
    }

    public cleanup() {
        this._outdated = true;
        URL.revokeObjectURL(this.url);
    }

    public override async toJSON(): Promise<JsonFileData> {
        const stream = (this.file.stream() as unknown as ReadableStream).getReader();
        let binaryString = "";
        while (true) {
            const data = await stream.read();
            if (data.done) {
                break;
            }
            for (let i of data.value) {
                binaryString += String.fromCharCode(i);
            }
        }

        const data = btoa(binaryString);

        return {
            name: this.name,
            size: this.file.size,
            data: data,
            hash: hashString(data),
            // data: this.base64,
            // hash: this.hash,
            intrinsicWidth: this.intrinsicWidth,
            intrinsicHeight: this.intrinsicHeight,
        };
    }

    public get outdated(): boolean {
        return this._outdated;
    }

    static {
        this.makeImmutable();
    }
}

// type FileData = DataClassType<FileData>;

export type JsonFileData = {
    name: string,
    size: number,
    data: string,
    hash: number,
    intrinsicWidth: number | null,
    intrinsicHeight: number | null,
}

interface SourceDataType {
    readonly name: string;
    // natural width
    readonly width?: number;
    // natural height
    readonly height?: number;

    readonly type: MediaType;

    // create tool only
    readonly file?: FileData;
    readonly fileDoesNotExist?: boolean;
}

interface SourceData extends DataTypeInitializer<SourceDataType> {
}

class SourceData extends Data<SourceDataType> {
    declare public readonly json: JsonSource;
    declare public readonly field: keyof SourceDataType;

    // public readonly name: string;
    // // natural width
    // public readonly width?: number;
    // // natural height
    // public readonly height?: number;
    //
    // public readonly type: MediaType;
    //
    // // create tool only
    // public readonly file?: FileData;
    // public readonly fileDoesNotExist?: boolean;

    constructor({name, width, height, file, type, fileDoesNotExist}: SourceDataType) {
        super();
        this.setFields({
            name: name,
            width: width,
            height: height,
            file: file,
            type: type,
            fileDoesNotExist: fileDoesNotExist,
        });
        // this.name = name;
        // this.file = file;
        // this.fileDoesNotExist = fileDoesNotExist;
        // // const srcNotExistent: boolean = media.src != null && mediaContext.mediaFiles.find(v => v.name === media.src!.name) === undefined;
        // this.width = width;
        // this.height = height;
        // this.type = type;
        this.onConstructionFinished(SourceData);
    }

    static {
        DataClass<typeof this, SourceData>(this, ["name", "width", "height", "type", "file", "fileDoesNotExist"]);
    }

    public static fromJSON(other: JsonSource) {
        let name = typeof other !== "string" ? other.name : other;
        return new SourceData({
            name: name,
            // if typeof other == string -> other.width == undefined -> OK
            // @ts-ignore
            width: other?.width,
            // @ts-ignore
            height: other?.height,
            // @ts-ignore
            type: MediaData.determineType(other?.type ?? "auto", name),
        });
    }

    public static default: SourceData = new SourceData({
        type: "img",
        name: "baustelle.png",
        width: undefined,
        height: undefined,
    }) as SourceData;

    public static formatSrc(src: string): string {
        let regex = new RegExp("^(?:[a-z]+:)?//", "i");
        //if src is absolute (e.g. http://abc.xyz)
        //or src relative to document root (starts with '/') (the browser interprets that correctly)
        if (regex.test(src) || src.startsWith("/")) {
            if (src.startsWith("http://")) {
                console.warn("Security waring: Using unsecure url in iframe:", src);
            }
            return src;
        }
        //add prefix
        return mediaFolder + "/" + src;
    }

    public static async fromFile(file: File): Promise<SourceData> {
        const fileData = await FileData.fromFile(file);
        return this.fromFileData(fileData);
    }

    public static fromFileData(fileData: FileData): SourceData {
        return new SourceData({
            name: fileData.name,
            file: fileData,
            fileDoesNotExist: false,
            width: fileData.intrinsicWidth ?? undefined,
            height: fileData.intrinsicHeight ?? undefined,
            type: MediaData.determineType("auto", fileData.name),
        }) as SourceData;
    }

    public complete(this: SourceData, mediaContext: MediaContextType): SourceData {
        if (this.isComplete()) {
            // if (this.height != null && this.width != null) {
            return this;
            // }
            // return SourceData.fromFile(this.file.file);
        }
        const media = mediaContext.mediaFiles.find(value => value.name === this.name);
        if (media) {
            return SourceData.fromFileData(media);
        }

        // media file not present
        return this.withFileDoesNotExist!(true);
        // return SourceData.fromFile(await SourceData.loadMedia(this.name));
    }

    public isComplete(): this is { file: FileData & { outdated: false } } {
        return this.file != null
            && !this.file.outdated;
    }

    //
    // public equals(other: undefined | null | SourceDataType): other is SourceDataType {
    //     return other != null && (this === other || (
    //         this.height === other.height &&
    //         this.width === other.width &&
    //         this.name === other.name &&
    //         this.type === other.type &&
    //         (this.file === other.file || (this.file?.equals(other.file) ?? false))
    //     ));
    // }

    public override toJSON(): JsonSource {
        return this.partialToJSON("file", "fileDoesNotExist");
    }

    /**
     * Return a string which is a (valid) url to the source
     */
    public url(): string {
        if (this.isComplete()) {
            return this.file.url;
        }
        return SourceData.formatSrc(this.name);
    }

    // public withType(type: MediaType): SourceData {
    //     if (this.type === type) {
    //         return this;
    //     }
    //     return new SourceData({...this, type: type});
    // }
    //
    // public withWidth(width: number | undefined): SourceData {
    //     if (this.width === width) {
    //         return this;
    //     }
    //     return new SourceData({...this, width: width});
    // }
    //
    // public withHeight(height: number | undefined): SourceData {
    //     if (this.height === height) {
    //         return this;
    //     }
    //     return new SourceData({...this, height: height});
    // }
    //
    // public withFileDoesNotExist(fileDoesNotExist: boolean): SourceData {
    //     if (this.fileDoesNotExist === fileDoesNotExist) {
    //         return this;
    //     }
    //     return new SourceData({...this, fileDoesNotExist: fileDoesNotExist});
    // }
    static {
        this.makeImmutable();
    }
}

// type SourceData = DataClassType<SourceData>;

interface MediaDataType {
    readonly src?: SourceData;
    readonly srcMin?: SourceData;
    readonly srcMax?: SourceData;
    readonly loading: LoadingType | "auto";
    readonly fetchPriority: FetchPriorityType;
    readonly poster?: string;
    readonly autoplay: boolean;
    readonly muted: boolean;
    readonly loop: boolean;
    readonly preload: VideoPreloadType;
}

interface MediaData extends DataTypeInitializer<MediaDataType> {
}

class MediaData extends Data<MediaDataType> {
    declare public readonly json: JsonMedia;
    declare public readonly field: keyof MediaDataType;
    //
    // public readonly src?: SourceData;
    // public readonly srcMin?: SourceData;
    // public readonly srcMax?: SourceData;
    // public readonly loading: LoadingType | "auto";
    // public readonly type: MediaType;
    // public readonly fetchPriority: FetchPriorityType;
    // public readonly poster?: string;
    // public readonly autoplay: boolean;
    // public readonly muted: boolean;
    // public readonly loop: boolean;
    // public readonly preload: VideoPreloadType;

    // dev tool only
    public readonly fileDoesNotExist: boolean;

    public static readonly imgFileEndings = ["png", "jpeg", "jpg", "gif", "svg", "webp", "apng", "avif"];
    public static readonly videoFileEndings = ["mp4", "webm", "ogg", "ogm", "ogv", "avi"];
    //this list is not exhaustive
    public static readonly iframeUrlEndings = ["html", "htm", "com", "org", "edu", "net", "gov", "mil", "int", "de", "en", "eu", "us", "fr", "ch", "at", "au"];
    public static readonly Types: Array<MediaType> = ["img", "video", "iframe"];

    constructor(other: DataType<MediaData>) {
        super();
        this.setFields(other);
        // this.src = other.src;
        // this.srcMin = other.srcMin;
        // this.srcMax = other.srcMax;
        // this.loading = other.loading;
        // this.type = other.type;
        // this.fetchPriority = other.fetchPriority;
        // this.poster = other.poster;
        // this.autoplay = other.autoplay;
        // this.muted = other.muted;
        // this.loop = other.loop;
        // this.preload = other.preload;

        this.fileDoesNotExist = (this.src?.fileDoesNotExist || this.srcMin?.fileDoesNotExist || this.srcMax?.fileDoesNotExist) ?? true;
        this.onConstructionFinished(MediaData);
    }

    static {
        DataClass<typeof this, MediaDataType>(this, ["src", "srcMin", "srcMax", "loading", "fetchPriority", "poster", "autoplay", "muted", "loop", "preload"]);
    }

    public async complete(mediaContext: MediaContextType): Promise<MediaData> {
        const src = await this.src?.complete(mediaContext);
        const srcMin = await this.srcMin?.complete(mediaContext);
        const srcMax = await this.srcMax?.complete(mediaContext);
        if (src !== this.src || srcMin !== this.srcMin || srcMax !== this.srcMax) {
            return this.withUpdate({
                src: src,
                srcMin: srcMin,
                srcMax: srcMax,
            });
        }
        return this;
    }

    public static fromJSON(media: JsonMedia) {
        let src = media.src != null ? SourceData.fromJSON(media.src) : undefined;
        let srcMin = media.srcMin != null ? SourceData.fromJSON(media.srcMin) : undefined;
        let srcMax = media.srcMax != null ? SourceData.fromJSON(media.srcMax) : undefined;

        return new MediaData({
            src: src,
            srcMin: srcMin,
            srcMax: srcMax,
            loading: media.loading ?? MediaData.default.loading,
            // type: MediaData.determineType(media.type ?? "auto", (src ?? srcMin ?? srcMax)!.name),
            fetchPriority: media.fetchPriority ?? MediaData.default.fetchPriority,
            poster: media.poster,
            autoplay: media.autoplay ?? MediaData.default.autoplay,
            muted: media.muted ?? MediaData.default.muted,
            loop: media.loop ?? MediaData.default.loop,
            preload: media.preload ?? MediaData.default.preload,
        });
    }

    public static default: MediaData = new MediaData({
        src: SourceData.default,
        poster: undefined,
        srcMax: undefined,
        srcMin: undefined,
        // type: "img",
        loading: "auto",
        muted: false,
        fetchPriority: "auto",
        preload: "auto",
        loop: false,
        autoplay: false,
    });

    public static determineType(value: MediaType | "auto", src: string): MediaType {
        let res: MediaType;
        if (value === "auto") {
            let fileSplit = src.split(".");
            let fileEnding = fileSplit[fileSplit.length - 1];
            if (MediaData.imgFileEndings.indexOf(fileEnding) > -1) {
                res = "img";
            } else if (MediaData.videoFileEndings.indexOf(fileEnding) > -1) {
                res = "video";
            } else if (MediaData.iframeUrlEndings.indexOf(fileEnding) > -1) {
                res = "iframe";
            } else {
                console.warn("Please add the file (or url) ending to the list\n'iframe' is used as default because there are endless different url endings\nFile Name which produced the Error:", src);
                res = "iframe";
            }
        } else {
            res = value;
        }
        return res;
    }

    public allTypes(): Array<MediaType> {
        return [this.src?.type, this.srcMin?.type, this.srcMax?.type].filter((value): value is MediaType => value != null);
    }

    // public equals(other: DataType<MediaData> | null | undefined): boolean {
    //     return other != null && (this === other || (
    //         this.src === other.src &&
    //         this.srcMax === other.srcMax &&
    //         this.srcMin === other.srcMin &&
    //         this.preload === other.preload &&
    //         this.autoplay === other.autoplay &&
    //         this.fetchPriority === other.fetchPriority &&
    //         this.loading === other.loading &&
    //         this.loop === other.loop &&
    //         this.muted === other.muted &&
    //         this.poster === other.poster &&
    //         this.type === other.type
    //     ));
    // }

    // public withUpdate(other: Partial<DataType<MediaData>>): MediaData {
    //     return new MediaData({...this, ...other});
    // }

    public isComplete(): boolean {
        return (this.src?.isComplete() ?? true) &&
            (this.srcMin?.isComplete() ?? true) &&
            (this.srcMax?.isComplete() ?? true);
    }

    // public toJSON(): JsonMedia {
    //     return {
    //         type: this.type,
    //         src: this.src?.toJSON(),
    //         srcMin: this.srcMin?.toJSON(),
    //         srcMax: this.srcMax?.toJSON(),
    //         fetchPriority: this.fetchPriority,
    //         loading: this.loading,
    //         loop: this.loop,
    //         muted: this.muted,
    //         preload: this.preload,
    //         poster: this.poster,
    //         autoplay: this.autoplay,
    //     };
    // }
    static {
        this.makeImmutable();
    }
}


interface ScrollDataType {
    readonly start?: number;
    readonly destination?: number;
}

interface ScrollData extends DataTypeInitializer<ScrollDataType> {
}

class ScrollData extends Data<ScrollDataType> {
    public declare field: keyof ScrollDataType;
    public declare json: NonNullable<JsonPage["initialScroll"]>;

    constructor(other: ScrollDataType) {
        super();
        this.setFields({
            start: other.start,
            destination: other.destination,
        });
        this.onConstructionFinished(ScrollData);
    }

    static {
        DataClass<typeof this, ScrollDataType>(this, ["start", "destination"]);
    }

    public static fromJSON(json: ScrollData["json"]): ScrollData {
        return new ScrollData({
            destination: json.destination,
            start: json.start,
        });
    }

    public static default: ScrollData = new ScrollData({
        destination: undefined,
        start: undefined,
    });

    static {
        this.makeImmutable();
    }
}


interface PageDataType extends AbstractAddressableObjectType {
    readonly media: MediaData;
    readonly is360: boolean;
    readonly isPanorama: boolean;
    readonly centralPositions: number[];
    readonly inlineObjects: InlineObjectData[];
    readonly initialScroll: ScrollData;
    readonly secondBeginning: number;
}

interface PageData extends DataTypeInitializer<PageDataType, "inlineObjects"> {
}

class PageData extends AbstractAddressableObject<PageDataType> {
    declare public readonly json: JsonPage & AbstractAddressableObject["json"];
    // declare public readonly field: keyof DataTypeWithoutFields<PageData>;

    public declare readonly animationType: PageAnimations;

    // public readonly media: MediaData;
    // public readonly is360: boolean;
    // public readonly isPanorama: boolean;
    // public readonly initialDirection: number;
    // public readonly inlineObjects: readonly InlineObjectData[];

    constructor(
        {media, is360, isPanorama, centralPositions, inlineObjects, initialScroll, secondBeginning, ...base}:
            DataType<PageData>) {
        super(base);
        this.setFields({
            media: media,
            is360: is360,
            isPanorama: isPanorama,
            centralPositions: centralPositions.map(v => Math.round(v * 10 ** InlineObjectData.CentralPositionDigits) / 10 ** InlineObjectData.CentralPositionDigits),
            inlineObjects: inlineObjects,
            initialScroll: initialScroll,
            secondBeginning: secondBeginning,
        });
        // this.media = media;
        // this.is360 = is360;
        // this.isPanorama = isPanorama;
        // this.initialDirection = Math.round(initialDirection * 10 ** InlineObjectData.InitialDirectionDigits) / 10 ** InlineObjectData.InitialDirectionDigits;
        // this.inlineObjects = inlineObjects;
        this.onConstructionFinished(PageData);
    }

    static {
        DataClass<typeof this, PageDataType>(this,
            ["media", "is360", "isPanorama", "centralPositions", "inlineObjects", "initialScroll", "secondBeginning"],
            ["inlineObjects", "isPanorama", "is360"]);
    }

    static fromJSON(page: JsonPage): PageData {
        const inlineObjects = page.inlineObjects?.map(InlineObjectData.fromJSON) ?? PageData.default.inlineObjects.slice();
        inlineObjects.push(...page.clickables?.map(ClickableData.fromJSON) ?? []);
        const media = MediaData.fromJSON(page.media);

        // defaults to false; iframes and videos cannot be 360 nor panorama
        const is360 = (page.is_360 ?? PageData.default.is360) && media.allTypes().includes("img");

        // defaults to false; iframes and videos cannot be 360 nor panorama
        const isPanorama = is360 || ((page.is_panorama ?? PageData.default.isPanorama) && media.allTypes().includes("img"));

        const initialScroll = page.initialScroll ? ScrollData.fromJSON(page.initialScroll) : ScrollData.default;

        let centralPositions: number[] | undefined;
        if (typeof page.centralPositions === "number") {
            centralPositions = [page.centralPositions];
        } else {
            centralPositions = page.centralPositions;
        }

        return new PageData({
            animationType: page.animationType ?? PageData.default.animationType,
            id: page.id,
            media: media,
            is360: is360,
            isPanorama: isPanorama,
            centralPositions: centralPositions ?? PageData.default.centralPositions,
            inlineObjects: inlineObjects,
            initialScroll: initialScroll,
            secondBeginning: page.secondBeginning ?? PageData.default.secondBeginning,
        });
    }

    public static default: PageData = new PageData({
        id: "badID",
        animationType: "forward",
        centralPositions: [],
        isPanorama: false,
        is360: false,
        inlineObjects: [],
        media: MediaData.default,
        initialScroll: ScrollData.default,
        secondBeginning: 100,
    }) as PageData;

    // public equals(other: DataType<PageData> | null | undefined, ...ignore: (keyof DataType<PageData>)[]): other is DataType<PageData> {
    //     return super.equals(other, ...ignore) &&
    //         (ignore.includes("media") || this.media.equals(other.media)) &&
    //         (ignore.includes("is360") || this.is360 === other.is360) &&
    //         (ignore.includes("initialDirection") || this.initialDirection === other.initialDirection) &&
    //         (ignore.includes("isPanorama") || this.isPanorama === other.isPanorama) &&
    //         (ignore.includes("inlineObjects") || this.inlineObjects.length === other.inlineObjects.length
    //             //@ts-ignore
    //             && this.inlineObjects.map(v => other.inlineObjects.find(value => value.equals(v)) !== undefined)
    //                 .reduce((prev, now) => prev && now, true));
    // }

    // public withUpdate(other: Partial<DataType<PageData>>): PageData {
    //     return new PageData({...this, ...other});
    // }

    public async complete(mediaContext: MediaContextType): Promise<PageData> {
        let media = await this.media.complete(mediaContext);
        if (media !== this.media) {
            return this.withUpdate({
                media: media,
            });
        }
        return this as PageData;
    }

    public isComplete(): boolean {
        return this.media.isComplete();
    }

    public override toJSON(): JsonPage {
        return {
            ...this.partialToJSON<"isPanorama" | "is360">("isPanorama", "is360"),
            is_panorama: this.isPanorama as any,
            is_360: this.is360 as any,
        };
    }

    public equalsIgnoringInlineObjectPos(other: PageDataType): other is PageDataType {
        if (!this.equals(other, "inlineObjects")) {
            return false;
        }
        const compare = (a: InlineObjectData, b: InlineObjectData) => {
            return a.equals(b, "x", "y");
        };
        return arrayEqualsContain(this.inlineObjects, other.inlineObjects, compare);
    }

    public withInlineObjects(...inlineObjects: UnFlatArray<InlineObjectData>): PageData {
        return new PageData({...this, inlineObjects: inlineObjects.flat()});
    }

    // public withInitialDirection(initialDirection: number): PageData {
    //     if (this.initialDirection === initialDirection) {
    //         return this;
    //     }
    //     return new PageData({...this, initialDirection: initialDirection});
    // }
    //
    // public withMedia(media: MediaData): PageData {
    //     if (this.media === media) {
    //         return this;
    //     }
    //     return new PageData({...this, media: media});
    // }
    //
    public withIs360(is360: boolean): PageData {
        if (this.is360 === is360) {
            return this;
        }
        return new PageData({...this, is360: is360, isPanorama: is360 || this.isPanorama});
    }

    public withIsPanorama(isPanorama: boolean): PageData {
        if (this.isPanorama === isPanorama) {
            return this;
        }
        return new PageData({...this, isPanorama: isPanorama, is360: isPanorama && this.is360});
    }

    static {
        this.makeImmutable();
    }
}

// type PageData = DataClassType<PageData>;

interface SchulTourConfigFileType {
    readonly pages: readonly PageData[];
    readonly initialPage: string | undefined;
    readonly fullscreen: boolean;
    readonly colorTheme: "dark" | "light";
    readonly mode: "inline" | "normal",
    readonly includeClickableHints: boolean,
}

interface SchulTourConfigFile extends SchulTourConfigFileType, DataWiths<SchulTourConfigFileType> {

}

class SchulTourConfigFile extends Data<SchulTourConfigFileType> {
    declare public readonly json: JsonSchulTourConfigFile;
    declare public readonly field: keyof SchulTourConfigFileType;

    // public readonly pages: readonly PageData[];
    // public readonly initialPage: string | undefined;
    // public readonly fullscreen: boolean;
    // public readonly colorTheme: "dark" | "light";
    // public readonly mode: "inline" | "normal";

    constructor(other: SchulTourConfigFileType) {
        super();
        this.setFields(other);
        // this.pages = other.pages;
        // this.initialPage = other.initialPage;
        // this.fullscreen = other.fullscreen;
        // this.colorTheme = other.colorTheme;
        // this.mode = other.mode;
        this.onConstructionFinished(SchulTourConfigFile);
    }

    static {
        DataClass<typeof this, SchulTourConfigFileType>(this, ["pages", "initialPage", "fullscreen", "colorTheme", "mode", "includeClickableHints"]);
    }

    public static default: SchulTourConfigFile = new SchulTourConfigFile({
        pages: [],
        initialPage: undefined,
        fullscreen: true,
        colorTheme: "dark",
        mode: "normal",
        includeClickableHints: false,
    });

    public static fromJSON(json: JsonSchulTourConfigFile): SchulTourConfigFile {
        const pages = json.pages.map(PageData.fromJSON);
        const default_ = SchulTourConfigFile.default;
        return new SchulTourConfigFile({
            pages: pages ?? default_.pages,
            initialPage: json.initialPage ?? default_.initialPage,
            fullscreen: json.fullscreen ?? default_.fullscreen,
            colorTheme: json.colorTheme ?? default_.colorTheme,
            mode: json.mode ?? default_.mode,
            includeClickableHints: json.includeClickableHints ?? default_.includeClickableHints,
        });
    }

    // public equals(other: null | undefined | DataType<SchulTourConfigFile>): boolean {
    //     return other != null && (this === other || (
    //         arrayEquals(this.pages, other.pages)
    //         && this.initialPage === other.initialPage
    //         && this.fullscreen === other.fullscreen
    //         && this.mode === other.mode
    //         && this.colorTheme === other.colorTheme
    //     ));
    // }
    //
    // public toJSON(): JsonSchulTourConfigFile {
    //     return {
    //         pages: this.pages.map(page => page.toJSON()),
    //         initialPage: this.initialPage,
    //         colorTheme: this.colorTheme,
    //         mode: this.mode,
    //         fullscreen: this.fullscreen,
    //     };
    // }
    //
    // public withInitialPage(initialPage: string): SchulTourConfigFile {
    //     if (this.initialPage === initialPage) {
    //         return this;
    //     }
    //     return new SchulTourConfigFile({...this, initialPage: initialPage});
    // }
    //
    // public withPages(pages: readonly PageData[]): SchulTourConfigFile {
    //     if (this.pages === pages) {
    //         return this;
    //     }
    //     return new SchulTourConfigFile({...this, pages: pages});
    // }
    static {
        this.makeImmutable();
    }
}


// type SchulTourConfigFile = DataClassType<SchulTourConfigFile>;

function hashString(str: string, seed = 0): number {
    // source https://github.com/bryc/code/blob/master/jshash/experimental/cyrb53.js
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

export {
    Data,
    DataClass,
    DataWiths,
    DataType,
    SchulTourConfigFile,
    PageData,
    InlineObjectData,
    AbstractInlineObjectData,
    AbstractAddressableInlineObjectData,
    ClickableData,
    CustomObjectData,
    TextFieldData,
    MediaData,
    SourceData,
    FileData,
    hashString,
    uniqueId,

};
