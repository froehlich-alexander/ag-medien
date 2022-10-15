import {Page} from "./tour";
import {getAddressableIds} from "./tour-dev-tool/refactor-data";
import type {MediaContextType} from "./tour-dev-tool/TourContexts";
import type {Complete, Mutable, UnFlatArray} from "./tour-dev-tool/utils";
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
type DataType<T extends Data> = Pick<T, T["field"]>;
type JsonType<T extends Data> = T["json"];
type toJSONFunctionType<T, T1 extends Data | never = never> = () => T & (T1 extends Data ? JsonType<T1> : never);
type DeepDataType<T extends Data> = {
    [k in keyof DataType<T>]: (DataType<T>[k] extends Data ? DeepDataType<DataType<T>[k]> : DataType<T>[k])
    | (DataType<T>[k] extends undefined ? undefined : never)
};

/**
 * Checks if the arrays are equal<br>
 * Ignores order of the items and if one item appears more often in one array than in the other
 * @param array1
 * @param array2
 */
function arrayEquals(array1: readonly any[] | undefined, array2: readonly any[] | undefined): array2 is typeof array1 {
    if (array1 === array2) {
        return true;
    }
    if (array1 === undefined || array2 === undefined) {
        // s.o. they are not equal (and undefined === undefined is always true)
        return false;
    }
    for (let item of array1) {
        if (!array2.some(value => value === item || value.equals?.(item))) {
            return false;
        }
    }
    for (let item of array2) {
        if (!array1.some(value => value === item || value.equals?.(item))) {
            return false;
        }
    }
    return true;
}

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

type DataWiths<T extends { [k: string]: any }> = { [k in keyof T as `with${Capitalize<k>}`]: (value: T[k]) => any };

type DataClassType<T extends Data> = T & DataWiths<DataType<T>>;

function DataClass<T extends typeof Data, T1 extends Data>(parent: T, fields: (keyof T1 & string)[], noWith: (keyof T1 & string)[] = []):
    Omit<T, ""> & { new(...args: ConstructorParameters<T>): T1 & DataWiths<DataType<T1>> } {
    // type dataType = { [k in keyof (typeof fields[number])]: T1[k] };
    (parent.staticFields as Mutable<typeof parent.staticFields>) = [...(parent.prototype.constructor as typeof Data).staticFields, ...fields];
    for (let field of fields) {
        if (noWith.includes(field)) {
            continue;
        }
        let withMethodName = `with${field[0].toUpperCase()}${field.slice(1)}`;
        Object.defineProperty(parent, withMethodName, {
            value: function (this: T1, value: T1[typeof field]) {
                if (value === this[field]) {
                    return this;
                }
                return new (this.constructor as typeof Data)({...this, [field]: value});
            },
            writable: false,
        });
    }
    return parent as any;
}

class Data {
    declare public static staticFields: string[];
    // these 2 will never exist at runtime
    declare public readonly json: {};
    declare public readonly field: any;

    // public readonly fields: (this["field"])[] = [];

    protected onConstructionFinished<T extends typeof Data>(prototype: T) {//, ...fields: UnFlatArray<this["field"], 2, true, true>) {
        // this.fields.push(...fields.flat());
        if (prototype === Object.getPrototypeOf(this)) {
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
            Object.freeze(this.fields);
        }
    }

    constructor(placeholder?: {}) {
        this.onConstructionFinished(Data);
    }

    public equals(other: DataType<this> | null | undefined, ...ignore: (keyof DataType<this>)[]): boolean {
        if (other == null) {
            return false;
        }
        //@ts-ignore
        else if (this === other) {
            return true;
        }
        for (let field of this.fields) {
            if (!ignore.includes(field)) {
                // @ts-ignore
                const thisVal = this[field];
                // @ts-ignore
                const otherVal = other[field];

                if (thisVal === otherVal) {
                    continue;
                }
                // use equals method if available
                if (thisVal.equals) {
                    if (!thisVal.equals(otherVal)) {
                        return false;
                    }
                } else if (Array.isArray(thisVal)) {
                    //compare arrays
                    if (!Array.isArray(otherVal)) {
                        return false;
                    }
                    if (!arrayEquals(thisVal, otherVal)) {
                        return false;
                    }
                }
            }
        }
        return true;
    };

    public toJSON(): this["json"] {
        const jsonObj: this["json"] = {};
        for (let i of this.fields) {
            jsonObj[i] = this[i].toJSON?.() ?? this[i];
        }
        return jsonObj;
    };

    public withUpdate(other: Partial<DataType<this>>): this {
        // @ts-ignore
        const updated = new (this.constructor as typeof T)({...this, ...other});
        if (this.equals(updated)) {
            return this;
        } else {
            return updated;
        }
    }

    public get fields(): this["field"][] {
        return (this.constructor as typeof Data).staticFields;
    }
}

class _AbstractAddressableObject extends Data {
    public readonly declare json: JsonAddressableObject;
    declare public readonly field: keyof DataTypeWithoutFields<this>;

    public readonly id: string;
    public readonly animationType: AnimationType;

    constructor({id, animationType, ...base}: DataType<AbstractAddressableObject>) {
        super(base);
        this.id = id;
        this.animationType = animationType;
        this.onConstructionFinished(AbstractAddressableObject);
    }

    // public equals(other: DataType<AbstractAddressableObject<T, Json>> | undefined | null, ...ignore: (keyof T)[]): other is DataType<AbstractAddressableObject<T, Json>> {
    //     return other != null && (this === other || (
    //         (this.id === other!.id || ignore.includes("id"))
    //         && (this.animationType === other!.animationType || ignore.includes("animationType"))
    //     ));
    // }

    // public toJSON(): { [k in keyof JsonAddressableObject]: Json[k] } {
    //     return {
    //         id: this.id,
    //         animationType: this.animationType,
    //     };
    // }

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
}

const AbstractAddressableObject = DataClass<typeof _AbstractAddressableObject, _AbstractAddressableObject>(_AbstractAddressableObject, ["id", "animationType"], []);
type AbstractAddressableObject = DataClassType<_AbstractAddressableObject>;

class _AbstractInlineObjectData extends Data {
    declare public readonly json: AbstractJsonInlineObject;
    declare public readonly field: keyof DataTypeWithoutFields<this>;

    // standard attributes
    public readonly x: number;
    public readonly y: number;
    public readonly type: InlineObjectType;
    public readonly position: InlineObjectPosition;
    public readonly animationType: AnimationType;
    public readonly hidden: boolean;

    constructor(
        {
            x,
            y,
            animationType,
            position,
            type,
            hidden,
        }: DataType<AbstractInlineObjectData>,
    ) {
        super();
        // standard
        this.x = Math.round(x * 10 ** InlineObjectData.CoordinateDigits) / 10 ** InlineObjectData.CoordinateDigits;
        this.y = Math.round(y * 10 ** InlineObjectData.CoordinateDigits) / 10 ** InlineObjectData.CoordinateDigits;
        this.type = type;
        this.position = position;
        this.animationType = animationType;
        this.hidden = hidden;
        this.onConstructionFinished(AbstractInlineObjectData);
    }

    // public equals(other: DataType<AbstractInlineObjectData<T, Json>> | undefined | null): other is DataType<AbstractInlineObjectData<T, Json>> {
    //     return other != null && (this === other || (
    //         this.x === (Math.round(other.x * 10 ** InlineObjectData.CoordinateDigits) / 10 ** InlineObjectData.CoordinateDigits) &&
    //         this.y === (Math.round(other.y * 10 ** InlineObjectData.CoordinateDigits) / 10 ** InlineObjectData.CoordinateDigits) &&
    //         this.type === other.type &&
    //         this.position === other.position &&
    //         this.animationType === other.animationType &&
    //         this.hidden === other.hidden
    //     ));
    // }
    //
    // public toJSON(): { [k in keyof Pick<Json, keyof AbstractJsonInlineObject>]: Json[k] } {
    //     return {
    //         x: this.x,
    //         y: this.y,
    //         type: this.type,
    //         position: this.position,
    //         animationType: this.animationType,
    //         hidden: this.hidden,
    //         // title: this.title,
    //         // icon: this.icon,
    //         // content: this.content,
    //         // footer: this.footer,
    //         // cssClasses: this.cssClasses,
    //         // htmlId: this.htmlId,
    //     };
    // }

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

    // public withType(type: this["type"]): this {
    //     return new (this.constructor as typeof AbstractInlineObjectData)({...this, type: type}) as this;
    // }
    //
    // public withPosition(position: InlineObjectPosition): this {
    //     return new (this.constructor as typeof AbstractInlineObjectData)({...this, position: position}) as this;
    // }
    //
    // public withX(x: number): this {
    //     return new (this.constructor as typeof AbstractInlineObjectData)({...this, x: x}) as this;
    // }
    //
    // public withY(y: number): this {
    //     return new (this.constructor as typeof AbstractInlineObjectData)({...this, y: y}) as this;
    // }
    //
    // public withAnimationType(animationType: AnimationType): this {
    //     return new (this.constructor as typeof AbstractInlineObjectData)({
    //         ...this,
    //         animationType: animationType,
    //     }) as this;
    // }
    //
    // public withGoto(goto: string): this {
    //     return new (this.constructor as typeof AbstractInlineObjectData)({...this, goto: goto}) as this;
    // }
    //
    // public withHidden(hidden: boolean): this {
    //     if (this.hidden === hidden) {
    //         return this;
    //     }
    //     return new (this.constructor as typeof AbstractInlineObjectData)({...this, hidden: hidden}) as this;
    // }
}

const AbstractInlineObjectData = DataClass<typeof _AbstractInlineObjectData, _AbstractInlineObjectData>(_AbstractInlineObjectData, ["x", "y", "type", "position", "animationType", "hidden"], []);
type AbstractInlineObjectData = DataClassType<_AbstractInlineObjectData>;


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

export class _AbstractAddressableInlineObjectData extends AbstractInlineObjectData {
    public readonly declare json: JsonAddressableObject & AbstractInlineObjectData["json"];

    public readonly id: string;

    constructor({id, ...base}: DataType<AbstractAddressableInlineObjectData>) {
        super(base);
        this.id = id;
        this.onConstructionFinished(AbstractAddressableInlineObjectData);
    }

    // public equals(other: DataType<AbstractAddressableInlineObjectData<T, Json>> | undefined | null): other is DataType<AbstractAddressableInlineObjectData<T, Json>> {
    //     return super.equals(other)
    //         && this.id === other.id
    //         && this.hidden === other.hidden;
    // }
    //
    // public toJSON(): { [k in keyof Pick<Json, keyof (AbstractJsonInlineObject & JsonAddressableObject)>]: Json[k] } {
    //     return {
    //         ...super.toJSON(),
    //         id: this.id,
    //     };
    // }
    //
    // public withId(id: string): this {
    //     return new (this.constructor as typeof AbstractAddressableInlineObjectData)({...this, id: id}) as this;
    // }
}

const AbstractAddressableInlineObjectData = DataClass<typeof _AbstractAddressableInlineObjectData, _AbstractAddressableInlineObjectData>(_AbstractAddressableInlineObjectData, ["id"], []);
type AbstractAddressableInlineObjectData = DataClassType<_AbstractAddressableInlineObjectData>;

class _ScrollData extends Data {
    public declare field: keyof DataTypeWithoutFields<_ScrollData>;
    public declare toJSON: toJSONFunctionType<JsonActivating["scroll"]>;

    public readonly start: number;
    public readonly end: number;
    public readonly time: number;

    constructor(other: DataType<ScrollData>) {
        super();
        this.fields.push("start", "end", "time");
        this.start = other.start;
        this.end = other.end;
        this.time = other.time;
        this.onConstructionFinished(ScrollData);
    }

    // public equals(other: DataType<ScrollData> | null | undefined, ...ignore: (keyof DataType<ScrollData>)[]): boolean {
    //     return (other != null && (this === other || (
    //         (ignore.includes("start") || this.start === other.start)
    //         && (ignore.includes("end") || this.end === other.end)
    //         && (ignore.includes("time") || this.end === other.end)
    //     )));
    // }
    //
    // public toJSON(): JsonActivating["scroll"] {
    //     return {
    //         start: this.start,
    //         end: this.end,
    //         time: this.time,
    //     };
    // }
}

const ScrollData = DataClass<typeof _ScrollData, _ScrollData>(_ScrollData, ["start", "end", "time"]);
type ScrollData = DataClassType<_ScrollData>;


class _AbstractActivatingInlineObjectData extends AbstractInlineObjectData {
    declare json: JsonActivating & AbstractInlineObjectData["json"];

    public readonly goto?: string;
    public readonly targetType: AddressableObjects | "auto";
    public readonly action: ActionType;
    public readonly scroll: ScrollData;

    constructor({goto, targetType, action, scroll, ...base}: DataType<AbstractActivatingInlineObjectData>) {
        super(base);
        this.goto = goto;
        this.targetType = targetType;
        this.action = action;
        this.scroll = scroll;
        this.onConstructionFinished(AbstractActivatingInlineObjectData);
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
}

const AbstractActivatingInlineObjectData = DataClass<typeof _AbstractActivatingInlineObjectData, _AbstractActivatingInlineObjectData>(_AbstractActivatingInlineObjectData, ["goto", "targetType", "action", "scroll"] );
type AbstractActivatingInlineObjectData = DataClassType<_AbstractActivatingInlineObjectData>;

const InlineObjectData = {
    CoordinateDigits: 3,
    InitialDirectionDigits: 3,
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
        return ClickableData.fromJSON(ClickableData.default);
    },
};

type InlineObjectData = ClickableData | CustomObjectData | TextFieldData;
export type InlineObjectDataConstructor = typeof ClickableData | typeof CustomObjectData | typeof TextFieldData;

class _ClickableData extends AbstractActivatingInlineObjectData {
    declare public readonly json: JsonClickable & AbstractActivatingInlineObjectData["json"];

    public readonly title: string;
    public readonly icon: IconType;

    declare public readonly type: "clickable";
    // declare public readonly animationType: PageAnimations;
    // declare public readonly goto?: string;


    public static readonly Icons: Array<IconType> = ["arrow_l", "arrow_u", "arrow_r", "arrow_d"];

    constructor({title, icon, ...r}: DataType<ClickableData>) {
        super({...r, type: "clickable"});
        this.title = title;
        this.icon = icon;
        this.onConstructionFinished(ClickableData);
    }

    public static default: Complete<JsonClickable> = {
        icon: "arrow_l",
        title: "",
        animationType: "forward",
        goto: "",
        targetType: "auto",
        x: 0,
        y: 0,
        type: "clickable",
        position: "media",
        hidden: false,
        backward: false,
        action: "activate",
    };

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
        });
    }

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
}

const ClickableData = DataClass<typeof _ClickableData, _ClickableData>(_ClickableData,  ["title", "icon"] );
type ClickableData = DataClassType<_ClickableData>;

// interface TextFieldData extends AbstractInlineObjectData<TextFieldData, JsonTextField>{}
class _TextFieldData extends AbstractAddressableInlineObjectData {
    declare public readonly json: JsonTextField & AbstractActivatingInlineObjectData["json"];

    public readonly title?: string;
    public readonly content: string;
    public readonly cssClasses: string[];
    public readonly size: TextFieldSize;
    // public readonly id: string;

    declare public readonly type: "text";
    declare public readonly animationType: TextAnimations;

    public static readonly Sizes: TextFieldSize[] = ["small", "normal", "large", "x-large", "xx-large"];

    constructor({title, content, cssClasses, size, ...base}: DataType<TextFieldData>) {
        super({...base, type: "text"});
        this.title = title;
        this.content = content;
        this.cssClasses = cssClasses;
        this.size = size;
        this.onConstructionFinished(TextFieldData);
    }

    public static default: Complete<JsonTextField> = {
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
    };

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
}

const TextFieldData = DataClass<typeof _TextFieldData, _TextFieldData>(_TextFieldData,  ["title", "content", "cssClasses", "size"] );
type TextFieldData = DataClassType<_TextFieldData>;

class _CustomObjectData extends AbstractInlineObjectData {
    declare public readonly json: JsonCustomObject & AbstractActivatingInlineObjectData["json"];

    public readonly htmlId: string;

    declare public readonly type: "custom";
    declare public readonly animationType: CustomAnimations;

    constructor({htmlId, ...base}: DataType<CustomObjectData>) {
        super({...base, type: "custom"});
        this.htmlId = htmlId;
        this.onConstructionFinished(CustomObjectData);
    }

    public static default: Complete<JsonCustomObject> = {
        type: "custom",
        hidden: false,
        x: 0,
        y: 0,
        animationType: "fade",
        position: "media",
        htmlId: "",
    };

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
}

const CustomObjectData = DataClass<typeof _CustomObjectData, _CustomObjectData>(_CustomObjectData,  ["htmlId"] );
type CustomObjectData = DataClassType<_CustomObjectData>;

class FileData extends Data {
    declare public readonly field: keyof Omit<DataTypeWithoutFields<this>, "outdated">;

    public readonly name: string;
    public readonly size: number;
    public readonly type: MediaType;
    public readonly file: File;
    public readonly intrinsicWidth: number | null;
    public readonly intrinsicHeight: number | null;
    public readonly url: string;
    // we would need to get the complete file content and that need way too much time
    // public readonly hash: number;
    // public readonly base64: string;
    private _outdated = false;

    protected constructor({name, file, size, type, intrinsicWidth, intrinsicHeight, url}: DataType<FileData>) {
        super();
        this.name = name;
        this.size = size;
        this.type = type;
        this.file = file;
        this.intrinsicWidth = intrinsicWidth;
        this.intrinsicHeight = intrinsicHeight;
        this.url = url;
        this.onConstructionFinished(FileData, ["name", "size", "type", "file", "intrinsicWidth", "intrinsicHeight", "url"] as (keyof DataType<this>)[]);
        // this.hash = hashString(name+base64);
        // this.base64 = base64;
        // document.body.append(this.img, this.video);
        // this.file.size;
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
        const [width, height] = await FileData.computeWidthHeight(url, type);
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
                reject();
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

    public async toJSON(): Promise<JsonFileData> {
        const stream = this.file.stream().getReader();
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
}

export type JsonFileData = {
    name: string,
    size: number,
    data: string,
    hash: number,
    intrinsicWidth: number | null,
    intrinsicHeight: number | null,
}

class _SourceData extends Data {
    declare public readonly json: JsonSource;
    declare public readonly field: keyof DataTypeWithoutFields<this>;

    public readonly name: string;
    // natural width
    public readonly width?: number;
    // natural height
    public readonly height?: number;

    public readonly type: MediaType;

    // create tool only
    public readonly file?: FileData;
    public readonly fileDoesNotExist?: boolean;

    constructor({name, width, height, file, type, fileDoesNotExist}: DataType<SourceData>) {
        super();
        this.name = name;
        this.file = file;
        this.fileDoesNotExist = fileDoesNotExist;
        // const srcNotExistent: boolean = media.src != null && mediaContext.mediaFiles.find(v => v.name === media.src!.name) === undefined;
        this.width = width;
        this.height = height;
        this.type = type;
        this.onConstructionFinished(SourceData);
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
    });

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
        });
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

    public equals(other: undefined | null | DataType<SourceData>): other is DataType<SourceData> {
        return other != null && (this === other || (
            this.height === other.height &&
            this.width === other.width &&
            this.name === other.name &&
            this.type === other.type &&
            (this.file === other.file || (this.file?.equals(other.file) ?? false))
        ));
    }

    // public toJSON(): JsonSource {
    //     return {
    //         name: this.name,
    //         type: this.type,
    //         height: this.height,
    //         width: this.width,
    //     };
    // }

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
}

const SourceData = DataClass<typeof _SourceData, _SourceData>(_SourceData, ["name", "width", "height", "type", "file", "fileDoesNotExist"] );
type SourceData = DataClassType<_SourceData>;

class _MediaData extends Data {
    declare public readonly json: JsonMedia;
    declare public readonly field: keyof Omit<DataTypeWithoutFields<this>, "fileDoesNotExist">;

    public readonly src?: SourceData;
    public readonly srcMin?: SourceData;
    public readonly srcMax?: SourceData;
    public readonly loading: LoadingType | "auto";
    public readonly type: MediaType;
    public readonly fetchPriority: FetchPriorityType;
    public readonly poster?: string;
    public readonly autoplay: boolean;
    public readonly muted: boolean;
    public readonly loop: boolean;
    public readonly preload: VideoPreloadType;

    // dev tool only
    public readonly fileDoesNotExist: boolean;

    public static readonly imgFileEndings = ["png", "jpeg", "jpg", "gif", "svg", "webp", "apng", "avif"];
    public static readonly videoFileEndings = ["mp4", "webm", "ogg", "ogm", "ogv", "avi"];
    //this list is not exhaustive
    public static readonly iframeUrlEndings = ["html", "htm", "com", "org", "edu", "net", "gov", "mil", "int", "de", "en", "eu", "us", "fr", "ch", "at", "au"];
    public static readonly Types: Array<MediaType> = ["img", "video", "iframe"];

    constructor(other: DataType<MediaData>) {
        super();
        this.src = other.src;
        this.srcMin = other.srcMin;
        this.srcMax = other.srcMax;
        this.loading = other.loading;
        this.type = other.type;
        this.fetchPriority = other.fetchPriority;
        this.poster = other.poster;
        this.autoplay = other.autoplay;
        this.muted = other.muted;
        this.loop = other.loop;
        this.preload = other.preload;

        this.fileDoesNotExist = (this.src?.fileDoesNotExist || this.srcMin?.fileDoesNotExist || this.srcMax?.fileDoesNotExist) ?? true;
        this.onConstructionFinished(MediaData);
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
            type: MediaData.determineType(media.type ?? "auto", (src ?? srcMin ?? srcMax)!.name),
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
        type: "img",
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
}

const MediaData = DataClass<typeof _MediaData, _MediaData>(_MediaData,  ["src", "srcMin", "srcMax", "loading", "type", "fetchPriority", "poster", "autoplay", "muted", "loop", "preload"] );
type MediaData = DataClassType<_MediaData>;

// @ts-ignore
class _PageData extends AbstractAddressableObject {
    declare public readonly json: JsonPage & AbstractAddressableObject["json"];
    // declare public readonly field: keyof DataTypeWithoutFields<PageData>;

    public declare readonly animationType: PageAnimations;

    public readonly media: MediaData;
    public readonly is360: boolean;
    public readonly isPanorama: boolean;
    public readonly initialDirection: number;
    public readonly inlineObjects: readonly InlineObjectData[];

    constructor({media, is360, isPanorama, initialDirection, inlineObjects, ...base}: DataType<PageData>) {
        super(base);
        this.media = media;
        this.is360 = is360;
        this.isPanorama = isPanorama;
        this.initialDirection = Math.round(initialDirection * 10 ** InlineObjectData.InitialDirectionDigits) / 10 ** InlineObjectData.InitialDirectionDigits;
        this.inlineObjects = inlineObjects;
        this.onConstructionFinished(PageData);
    }

    static fromJSON(page: JsonPage): PageData {
        const inlineObjects = page.inlineObjects?.map(InlineObjectData.fromJSON) ?? PageData.default.inlineObjects.slice();
        inlineObjects.push(...page.clickables?.map(ClickableData.fromJSON) ?? []);
        const media = MediaData.fromJSON(page.media);

        // defaults to false; iframes cannot be 360 nor panorama
        const is360 = (page.is_360 ?? PageData.default.is360) && (media.type === "img" || media.type === "video");

        // defaults to false; iframes cannot be 360 nor panorama
        const isPanorama = is360 || ((page.is_panorama ?? PageData.default.isPanorama) && (media.type === "img" || media.type === "video"));

        return new PageData({
            animationType: page.animationType ?? PageData.default.animationType,
            id: page.id,
            media: media,
            is360: is360,
            isPanorama: isPanorama,
            initialDirection: page.initial_direction ?? PageData.default.initialDirection,
            inlineObjects: inlineObjects,
        });
    }

    public static default: PageData = new PageData({
        id: "badID",
        animationType: "forward",
        initialDirection: 0,
        isPanorama: false,
        is360: false,
        inlineObjects: [],
        media: MediaData.default,
    });

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
        return this;
    }

    public isComplete(): boolean {
        return this.media.isComplete();
    }

    // public toJSON(): JsonPage {
    //     return {
    //         ...super.toJSON(),
    //         media: this.media.toJSON(),
    //         inlineObjects: this.inlineObjects.map(value => value.toJSON()),
    //         is_panorama: this.isPanorama,
    //         is_360: this.is360,
    //         initial_direction: this.initialDirection,
    //     };
    // }

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
    // public withIs360(is360: boolean): PageData {
    //     if (this.is360 === is360) {
    //         return this;
    //     }
    //     return new PageData({...this, is360: is360, isPanorama: is360 || this.isPanorama});
    // }
    //
    // public withIsPanorama(isPanorama: boolean): PageData {
    //     if (this.isPanorama === isPanorama) {
    //         return this;
    //     }
    //     return new PageData({...this, isPanorama: isPanorama, is360: isPanorama && this.is360});
    // }
}

const PageData = DataClass<typeof _PageData, _PageData>(_PageData, ["media", "is360", "isPanorama", "initialDirection", "inlineObjects"], ['inlineObjects']);
type PageData = DataClassType<_PageData>;

class _SchulTourConfigFile extends Data {
    declare public readonly json: JsonSchulTourConfigFile;
    declare public readonly field: keyof DataTypeWithoutFields<this>;

    public readonly pages: readonly PageData[];
    public readonly initialPage: string | undefined;
    public readonly fullscreen: boolean;
    public readonly colorTheme: "dark" | "light";
    public readonly mode: "inline" | "normal";

    constructor(other: DataType<SchulTourConfigFile>) {
        super();
        this.pages = other.pages;
        this.initialPage = other.initialPage;
        this.fullscreen = other.fullscreen;
        this.colorTheme = other.colorTheme;
        this.mode = other.mode;
        this.onConstructionFinished(SchulTourConfigFile);
    }

    public static default(): SchulTourConfigFile {
        return new SchulTourConfigFile({
            pages: [],
            initialPage: undefined,
            fullscreen: true,
            colorTheme: "dark",
            mode: "normal",
        });
    }

    public static fromJSON(json: JsonSchulTourConfigFile): SchulTourConfigFile {
        const pages = json.pages.map(PageData.fromJSON);
        return new SchulTourConfigFile({
            pages: pages,
            initialPage: json.initialPage,
            fullscreen: json.fullscreen ?? true,
            colorTheme: json.colorTheme ?? "dark",
            mode: json.mode ?? "normal",
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
}

const SchulTourConfigFile = DataClass<typeof _SchulTourConfigFile, _SchulTourConfigFile>(_SchulTourConfigFile, ["pages", "initialPage", "fullscreen", "colorTheme", "mode"] );
type SchulTourConfigFile = DataClassType<_SchulTourConfigFile>;

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
    DataType,
    SchulTourConfigFile,
    PageData,
    InlineObjectData,
    AbstractInlineObjectData,
    ClickableData,
    CustomObjectData,
    TextFieldData,
    MediaData,
    SourceData,
    FileData,
    hashString,
    uniqueId,
    arrayEquals,
};
