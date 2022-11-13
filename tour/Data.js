import { arrayEqualsContain } from "./utils.js";
export const mediaFolder = "media";
const uniqueId = (() => {
    let currentId = 0;
    const map = new WeakMap();
    return (object) => {
        if (!map.has(object)) {
            map.set(object, ++currentId);
        }
        return map.get(object);
    };
})();
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
function DataClass(parent, fields, noWith = []) {
    // type dataType = { [k in keyof (typeof fields[number])]: T1[k] };
    // set static fields
    // we NEED to use Object.defineProperty here, otherwise js thinks we want to alter Data.staticFields, which would result in an error
    Object.defineProperty(parent, "staticFields", {
        value: [...parent.prototype.constructor.staticFields, ...fields],
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
            value: function (value) {
                if (value === this[field]) {
                    return this;
                }
                return new this.constructor({
                    ...this,
                    [field]: value,
                });
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
    return parent;
}
class Data {
    constructor(placeholder) {
        this.onConstructionFinished(Data);
    }
    static { this.staticFields = []; }
    static {
        DataClass(this, []);
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
    static makeImmutable() {
        Object.freeze(this);
        Object.freeze(this.prototype);
    }
    // public readonly fields: (this["field"])[] = [];
    onConstructionFinished(staticClass) {
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
    setFields(other) {
        for (let [k, v] of Object.entries(other)) {
            if (this.fields.includes(k)) {
                this[k] = v;
            }
            else {
                console.warn("You tried to set a field that is not present in this.fields!!!", "Your Field:", k, "Allowed fields:", this.fields);
            }
        }
    }
    equals(other, ...ignore) {
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
            const thisVal = this[field];
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
            }
            else if (Array.isArray(thisVal)) {
                //compare arrays
                if (!Array.isArray(otherVal)) {
                    return false;
                }
                if (!arrayEqualsContain(thisVal, otherVal)) {
                    return false;
                }
            }
            else {
                return false;
            }
        }
        return true;
    }
    ;
    toJSON() {
        return this.partialToJSON();
    }
    ;
    partialToJSON(...skip) {
        function transformObjectToJson(obj) {
            if (typeof obj === "object" && obj !== null && "toJSON" in obj) {
                return obj.toJSON();
            }
            else if (Array.isArray(obj)) {
                return obj.map(transformObjectToJson);
            }
            return obj;
        }
        const jsonObj = {};
        for (let i of this.fields) {
            if (skip.includes(i)) {
                continue;
            }
            // skip undefined values
            if (this[i] === undefined) {
                continue;
            }
            jsonObj[i] = transformObjectToJson(this[i]);
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
    withUpdate(other) {
        const thisAttrs = {};
        for (let [k, v] of Object.entries(this)) {
            if (this.fields.includes(k)) {
                thisAttrs[k] = v;
            }
        }
        // a bit of performance
        if (!Object.keys(thisAttrs).length) {
            return this;
        }
        const updated = new this.constructor({ ...thisAttrs, ...other });
        if (this.equals(updated)) {
            return this;
        }
        else {
            return updated;
        }
    }
    get fields() {
        return this.constructor.staticFields;
    }
    static {
        this.makeImmutable();
    }
}
class AbstractAddressableObject extends Data {
    constructor({ id, animationType }) {
        super();
        this.setFields({
            id: id,
            animationType: animationType,
        });
        // this.id = id;
        // this.animationType = animationType;
        this.onConstructionFinished(AbstractAddressableObject);
    }
    // public readonly id: string;
    // public readonly animationType: AnimationType;
    static {
        DataClass(AbstractAddressableObject, ["id", "animationType"], []);
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
class AbstractInlineObjectData extends Data {
    constructor({ x, y, animationType, position, type, hidden }) {
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
    static {
        DataClass(AbstractInlineObjectData, ["x", "y", "type", "position", "animationType", "hidden"], ['type']);
    }
    isClickable() {
        return this.type === "clickable";
    }
    isTextField() {
        return this.type === "text";
    }
    isCustom() {
        return this.type === "custom";
    }
    isAddressable() {
        return this instanceof AbstractAddressableInlineObjectData;
    }
    withType(type) {
        const constr = InlineObjectData.constructorFromType(type);
        return new constr(constr.default.withUpdate(this));
        // return new (this.constructor as typeof AbstractInlineObjectData)({...this, type: type}) as this;
    }
    static {
        this.makeImmutable();
    }
}
class AbstractAddressableInlineObjectData extends AbstractInlineObjectData {
    //
    // public readonly id: string;
    constructor({ id, ...base }) {
        super(base);
        this.setFields({
            id: id,
        });
        this.onConstructionFinished(AbstractAddressableInlineObjectData);
    }
    static {
        DataClass(this, ["id"]);
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
    static {
        this.makeImmutable();
    }
}
class AbstractActivatingInlineObjectData extends AbstractInlineObjectData {
    //
    // public readonly goto?: string;
    // public readonly targetType: AddressableObjects | "auto";
    // public readonly action: ActionType;
    // public readonly scroll: ScrollData;
    constructor({ goto, targetType, action, scroll, ...base }) {
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
        DataClass(this, ["goto", "targetType", "action", "scroll"]);
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
    Types: ["clickable", "text", "custom"],
    Positions: ["media", "page"],
    AnimationTypes: ["forward", "backward", "fade", "none"],
    fromJSON(json) {
        switch (json.type) {
            case "clickable":
                return ClickableData.fromJSON(json);
            case "text":
                return TextFieldData.fromJSON(json);
            case "custom":
                return CustomObjectData.fromJSON(json);
        }
    },
    constructorFromType(type) {
        switch (type) {
            case "clickable":
                return ClickableData;
            case "text":
                return TextFieldData;
            case "custom":
                return CustomObjectData;
        }
    },
    default() {
        return ClickableData.default;
    },
};
class ClickableData extends AbstractActivatingInlineObjectData {
    constructor({ title, icon, destinationScroll, ...r }) {
        super({ ...r, type: "clickable" });
        this.setFields({
            title: title,
            icon: icon,
            destinationScroll: typeof destinationScroll === "string" ? destinationScroll
                : Math.round(destinationScroll * 10 ** InlineObjectData.DestinationScrollDigits) / 10 ** InlineObjectData.DestinationScrollDigits,
        });
        this.onConstructionFinished(ClickableData);
    }
    static { this.Icons = ["arrow_l", "arrow_u", "arrow_r", "arrow_d"]; }
    static {
        DataClass(this, ["title", "icon", "destinationScroll"]);
    }
    static { this.default = new ClickableData({
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
        action: "activate",
        destinationScroll: "auto",
    }); }
    static fromJSON(json) {
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
class TextFieldData extends AbstractAddressableInlineObjectData {
    constructor({ title, content, cssClasses, size, ...base }) {
        super({ ...base, type: "text" });
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
    static { this.Sizes = ["small", "normal", "large", "x-large", "xx-large"]; }
    static {
        DataClass(this, ["title", "content", "cssClasses", "size"]);
    }
    static { this.default = new TextFieldData({
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
    }); }
    static fromJSON(json) {
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
class CustomObjectData extends AbstractInlineObjectData {
    constructor({ htmlId, ...base }) {
        super({ ...base, type: "custom" });
        this.setFields({ htmlId: htmlId });
        // this.htmlId = htmlId;
        this.onConstructionFinished(CustomObjectData);
    }
    static {
        DataClass(this, ["htmlId"]);
    }
    static { this.default = new CustomObjectData({
        type: "custom",
        hidden: false,
        x: 0,
        y: 0,
        animationType: "fade",
        position: "media",
        htmlId: "",
    }); }
    static fromJSON(json) {
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
class FileData extends Data {
    constructor(other) {
        super();
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
        this._outdated = false;
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
        DataClass(this, ["name", "size", "type", "file", "intrinsicWidth", "intrinsicHeight", "url"]);
    }
    static async fromFile(file) {
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
    static async computeWidthHeight(url, type) {
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
        return new Promise((resolve, reject) => {
            if (type === "img") {
                img.onload = () => {
                    resolve([img.naturalWidth, img.naturalHeight]);
                    // cleanup();
                };
                img.src = url;
                // res = [this.img.naturalWidth, this.img.naturalHeight];
            }
            else if (type === "video") {
                video.onloadeddata = () => {
                    resolve([video.videoWidth, video.videoHeight]);
                    // cleanup();
                };
                video.src = url;
                // res = [this.video.videoWidth, this.video.videoHeight]
            }
            else {
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
    static fromJSON(json) {
        const data = atob(json.data);
        const file = new File([data], json.name, { type: "media/image" });
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
    cleanup() {
        this._outdated = true;
        URL.revokeObjectURL(this.url);
    }
    async toJSON() {
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
    get outdated() {
        return this._outdated;
    }
    static {
        this.makeImmutable();
    }
}
class SourceData extends Data {
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
    constructor({ name, width, height, file, type, fileDoesNotExist }) {
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
        DataClass(this, ["name", "width", "height", "type", "file", "fileDoesNotExist"]);
    }
    static fromJSON(other) {
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
    static { this.default = new SourceData({
        type: "img",
        name: "baustelle.png",
        width: undefined,
        height: undefined,
    }); }
    static formatSrc(src) {
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
    static async fromFile(file) {
        const fileData = await FileData.fromFile(file);
        return this.fromFileData(fileData);
    }
    static fromFileData(fileData) {
        return new SourceData({
            name: fileData.name,
            file: fileData,
            fileDoesNotExist: false,
            width: fileData.intrinsicWidth ?? undefined,
            height: fileData.intrinsicHeight ?? undefined,
            type: MediaData.determineType("auto", fileData.name),
        });
    }
    complete(mediaContext) {
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
        return this.withFileDoesNotExist(true);
        // return SourceData.fromFile(await SourceData.loadMedia(this.name));
    }
    isComplete() {
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
    toJSON() {
        return this.partialToJSON("file", "fileDoesNotExist");
    }
    /**
     * Return a string which is a (valid) url to the source
     */
    url() {
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
class MediaData extends Data {
    constructor(other) {
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
    static { this.imgFileEndings = ["png", "jpeg", "jpg", "gif", "svg", "webp", "apng", "avif"]; }
    static { this.videoFileEndings = ["mp4", "webm", "ogg", "ogm", "ogv", "avi"]; }
    //this list is not exhaustive
    static { this.iframeUrlEndings = ["html", "htm", "com", "org", "edu", "net", "gov", "mil", "int", "de", "en", "eu", "us", "fr", "ch", "at", "au"]; }
    static { this.Types = ["img", "video", "iframe"]; }
    static {
        DataClass(this, ["src", "srcMin", "srcMax", "loading", "fetchPriority", "poster", "autoplay", "muted", "loop", "preload"]);
    }
    async complete(mediaContext) {
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
    static fromJSON(media) {
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
    static { this.default = new MediaData({
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
    }); }
    static determineType(value, src) {
        let res;
        if (value === "auto") {
            let fileSplit = src.split(".");
            let fileEnding = fileSplit[fileSplit.length - 1];
            if (MediaData.imgFileEndings.indexOf(fileEnding) > -1) {
                res = "img";
            }
            else if (MediaData.videoFileEndings.indexOf(fileEnding) > -1) {
                res = "video";
            }
            else if (MediaData.iframeUrlEndings.indexOf(fileEnding) > -1) {
                res = "iframe";
            }
            else {
                console.warn("Please add the file (or url) ending to the list\n'iframe' is used as default because there are endless different url endings\nFile Name which produced the Error:", src);
                res = "iframe";
            }
        }
        else {
            res = value;
        }
        return res;
    }
    allTypes() {
        return [this.src?.type, this.srcMin?.type, this.srcMax?.type].filter((value) => value != null);
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
    isComplete() {
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
class ScrollData extends Data {
    constructor(other) {
        super();
        this.setFields({
            start: other.start,
            destination: other.destination,
        });
        this.onConstructionFinished(ScrollData);
    }
    static {
        DataClass(this, ["start", "destination"]);
    }
    static fromJSON(json) {
        return new ScrollData({
            destination: json.destination,
            start: json.start,
        });
    }
    static { this.default = new ScrollData({
        destination: undefined,
        start: undefined,
    }); }
    static {
        this.makeImmutable();
    }
}
class PageData extends AbstractAddressableObject {
    // public readonly media: MediaData;
    // public readonly is360: boolean;
    // public readonly isPanorama: boolean;
    // public readonly initialDirection: number;
    // public readonly inlineObjects: readonly InlineObjectData[];
    constructor({ media, is360, isPanorama, centralPositions, inlineObjects, initialScroll, secondBeginning, ...base }) {
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
        DataClass(this, ["media", "is360", "isPanorama", "centralPositions", "inlineObjects", "initialScroll", "secondBeginning"], ["inlineObjects", "isPanorama", "is360"]);
    }
    static fromJSON(page) {
        const inlineObjects = page.inlineObjects?.map(InlineObjectData.fromJSON) ?? PageData.default.inlineObjects.slice();
        inlineObjects.push(...page.clickables?.map(ClickableData.fromJSON) ?? []);
        const media = MediaData.fromJSON(page.media);
        // defaults to false; iframes and videos cannot be 360 nor panorama
        const is360 = (page.is_360 ?? PageData.default.is360) && media.allTypes().includes("img");
        // defaults to false; iframes and videos cannot be 360 nor panorama
        const isPanorama = is360 || ((page.is_panorama ?? PageData.default.isPanorama) && media.allTypes().includes("img"));
        const initialScroll = page.initialScroll ? ScrollData.fromJSON(page.initialScroll) : ScrollData.default;
        let centralPositions;
        if (typeof page.centralPositions === "number") {
            centralPositions = [page.centralPositions];
        }
        else {
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
    static { this.default = new PageData({
        id: "badID",
        animationType: "forward",
        centralPositions: [],
        isPanorama: false,
        is360: false,
        inlineObjects: [],
        media: MediaData.default,
        initialScroll: ScrollData.default,
        secondBeginning: 100,
    }); }
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
    async complete(mediaContext) {
        let media = await this.media.complete(mediaContext);
        if (media !== this.media) {
            return this.withUpdate({
                media: media,
            });
        }
        return this;
    }
    isComplete() {
        return this.media.isComplete();
    }
    toJSON() {
        return {
            ...this.partialToJSON("isPanorama", "is360"),
            is_panorama: this.isPanorama,
            is_360: this.is360,
        };
    }
    equalsIgnoringInlineObjectPos(other) {
        if (!this.equals(other, "inlineObjects")) {
            return false;
        }
        const compare = (a, b) => {
            return a.equals(b, "x", "y");
        };
        return arrayEqualsContain(this.inlineObjects, other.inlineObjects, compare);
    }
    withInlineObjects(...inlineObjects) {
        return new PageData({ ...this, inlineObjects: inlineObjects.flat() });
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
    withIs360(is360) {
        if (this.is360 === is360) {
            return this;
        }
        return new PageData({ ...this, is360: is360, isPanorama: is360 || this.isPanorama });
    }
    withIsPanorama(isPanorama) {
        if (this.isPanorama === isPanorama) {
            return this;
        }
        return new PageData({ ...this, isPanorama: isPanorama, is360: isPanorama && this.is360 });
    }
    static {
        this.makeImmutable();
    }
}
class SchulTourConfigFile extends Data {
    // public readonly pages: readonly PageData[];
    // public readonly initialPage: string | undefined;
    // public readonly fullscreen: boolean;
    // public readonly colorTheme: "dark" | "light";
    // public readonly mode: "inline" | "normal";
    constructor(other) {
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
        DataClass(this, ["pages", "initialPage", "fullscreen", "colorTheme", "mode", "includeClickableHints"]);
    }
    static { this.default = new SchulTourConfigFile({
        pages: [],
        initialPage: undefined,
        fullscreen: true,
        colorTheme: "dark",
        mode: "normal",
        includeClickableHints: false,
    }); }
    static fromJSON(json) {
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
function hashString(str, seed = 0) {
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
export { Data, DataClass, SchulTourConfigFile, PageData, InlineObjectData, AbstractInlineObjectData, AbstractAddressableInlineObjectData, ClickableData, CustomObjectData, TextFieldData, MediaData, SourceData, FileData, hashString, uniqueId, };
//# sourceMappingURL=Data.js.map