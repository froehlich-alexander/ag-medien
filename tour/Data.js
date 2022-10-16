export const mediaFolder = "media";
/**
 * Checks if the arrays are equal<br>
 * Ignores order of the items and if one item appears more often in one array than in the other
 * @param array1
 * @param array2
 */
function arrayEquals(array1, array2) {
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
    const map = new WeakMap();
    return (object) => {
        if (!map.has(object)) {
            map.set(object, ++currentId);
        }
        return map.get(object);
    };
})();
function DataClass(parent, fields, noWith = []) {
    // type dataType = { [k in keyof (typeof fields[number])]: T1[k] };
    parent.staticFields = [...parent.prototype.constructor.staticFields, ...fields];
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
                return new this.constructor({ ...this, [field]: value });
            },
            writable: false,
        });
    }
    return parent;
}
class Data {
    constructor(placeholder) {
        this.onConstructionFinished(Data);
    }
    // public readonly fields: (this["field"])[] = [];
    onConstructionFinished(prototype) {
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
    /**
     * only allowed in constructor
     * @protected
     */
    setFields(other) {
        for (let [k, v] of Object.entries(other)) {
            if (this.fields.includes(k)) {
                this[k] = v;
            }
        }
    }
    equals(other, ...ignore) {
        if (other == null) {
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
            }
            else if (Array.isArray(thisVal)) {
                //compare arrays
                if (!Array.isArray(otherVal)) {
                    return false;
                }
                if (!arrayEquals(thisVal, otherVal)) {
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
        const jsonObj = {};
        for (let i of this.fields) {
            if (typeof this[i] === "object" && "toJSON" in this[i]) {
                jsonObj[i] = this[i].toJSON();
            }
            else {
                jsonObj[i] = this[i];
            }
            // jsonObj[i] = this[i]?.toJSON?.() ?? this[i];
        }
        return jsonObj;
    }
    ;
    withUpdate(other) {
        // @ts-ignore
        const updated = new this.constructor({ ...this, ...other });
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
}
Data.staticFields = [];
class AbstractAddressableObject extends Data {
    constructor({ id, animationType, ...base }) {
        super(base);
        this.setFields({
            id: id,
            animationType: animationType,
        });
        // this.id = id;
        // this.animationType = animationType;
        this.onConstructionFinished(AbstractAddressableObject);
    }
}
//
// public readonly id: string;
// public readonly animationType: AnimationType;
(() => {
    DataClass(AbstractAddressableObject, ["id", "animationType"], []);
})();
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
}
//
// // standard attributes
// public readonly x: number;
// public readonly y: number;
// public readonly type: InlineObjectType;
// public readonly position: InlineObjectPosition;
// public readonly animationType: AnimationType;
// public readonly hidden: boolean;
(() => {
    DataClass(AbstractInlineObjectData, ["x", "y", "type", "position", "animationType", "hidden"], []);
})();
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
}
DataClass(AbstractAddressableInlineObjectData, ["id"], []);
class ScrollData extends Data {
    // public readonly start: number;
    // public readonly end: number;
    // public readonly time: number;
    constructor(other) {
        super();
        this.setFields({
            start: other.start,
            end: other.end,
            time: other.time,
        });
        this.onConstructionFinished(ScrollData);
    }
}
DataClass(ScrollData, ["start", "end", "time"]);
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
}
DataClass(AbstractActivatingInlineObjectData, ["goto", "targetType", "action", "scroll"]);
// type AbstractActivatingInlineObjectData = DataClassType<AbstractActivatingInlineObjectData>;
const InlineObjectData = {
    CoordinateDigits: 3,
    InitialDirectionDigits: 3,
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
        return ClickableData.fromJSON(ClickableData.default);
    },
};
class ClickableData extends AbstractActivatingInlineObjectData {
    constructor({ title, icon, ...r }) {
        super({ ...r, type: "clickable" });
        this.setFields({
            title: title,
            icon: icon,
        });
        // this.title = title;
        // this.icon = icon;
        this.onConstructionFinished(ClickableData);
    }
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
        });
    }
}
// declare public readonly animationType: PageAnimations;
// declare public readonly goto?: string;
ClickableData.Icons = ["arrow_l", "arrow_u", "arrow_r", "arrow_d"];
ClickableData.default = {
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
DataClass(ClickableData, ["title", "icon"]);
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
}
TextFieldData.Sizes = ["small", "normal", "large", "x-large", "xx-large"];
TextFieldData.default = {
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
DataClass(TextFieldData, ["title", "content", "cssClasses", "size"]);
class CustomObjectData extends AbstractInlineObjectData {
    constructor({ htmlId, ...base }) {
        super({ ...base, type: "custom" });
        this.setFields({ htmlId: htmlId });
        // this.htmlId = htmlId;
        this.onConstructionFinished(CustomObjectData);
    }
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
}
CustomObjectData.default = {
    type: "custom",
    hidden: false,
    x: 0,
    y: 0,
    animationType: "fade",
    position: "media",
    htmlId: "",
};
DataClass(CustomObjectData, ["htmlId"]);
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
}
DataClass(FileData, ["name", "size", "type", "file", "intrinsicWidth", "intrinsicHeight", "url"]);
class SourceData extends Data {
    // declare public readonly field: keyof DataTypeWithoutFields<this>;
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
    equals(other) {
        return other != null && (this === other || (this.height === other.height &&
            this.width === other.width &&
            this.name === other.name &&
            this.type === other.type &&
            (this.file === other.file || (this.file?.equals(other.file) ?? false))));
    }
    toJSON() {
        return {
            name: this.name,
            type: this.type,
            height: this.height,
            width: this.width,
        };
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
}
SourceData.default = new SourceData({
    type: "img",
    name: "baustelle.png",
    width: undefined,
    height: undefined,
});
DataClass(SourceData, ["name", "width", "height", "type", "file", "fileDoesNotExist"]);
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
            type: MediaData.determineType(media.type ?? "auto", (src ?? srcMin ?? srcMax).name),
            fetchPriority: media.fetchPriority ?? MediaData.default.fetchPriority,
            poster: media.poster,
            autoplay: media.autoplay ?? MediaData.default.autoplay,
            muted: media.muted ?? MediaData.default.muted,
            loop: media.loop ?? MediaData.default.loop,
            preload: media.preload ?? MediaData.default.preload,
        });
    }
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
}
MediaData.imgFileEndings = ["png", "jpeg", "jpg", "gif", "svg", "webp", "apng", "avif"];
MediaData.videoFileEndings = ["mp4", "webm", "ogg", "ogm", "ogv", "avi"];
//this list is not exhaustive
MediaData.iframeUrlEndings = ["html", "htm", "com", "org", "edu", "net", "gov", "mil", "int", "de", "en", "eu", "us", "fr", "ch", "at", "au"];
MediaData.Types = ["img", "video", "iframe"];
MediaData.default = new MediaData({
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
DataClass(MediaData, ["src", "srcMin", "srcMax", "loading", "type", "fetchPriority", "poster", "autoplay", "muted", "loop", "preload"]);
class PageData extends AbstractAddressableObject {
    // public readonly media: MediaData;
    // public readonly is360: boolean;
    // public readonly isPanorama: boolean;
    // public readonly initialDirection: number;
    // public readonly inlineObjects: readonly InlineObjectData[];
    constructor({ media, is360, isPanorama, initialDirection, inlineObjects, ...base }) {
        super(base);
        this.setFields({
            media: media,
            is360: is360,
            isPanorama: isPanorama,
            initialDirection: Math.round(initialDirection * 10 ** InlineObjectData.InitialDirectionDigits) / 10 ** InlineObjectData.InitialDirectionDigits,
            inlineObjects: inlineObjects,
        });
        // this.media = media;
        // this.is360 = is360;
        // this.isPanorama = isPanorama;
        // this.initialDirection = Math.round(initialDirection * 10 ** InlineObjectData.InitialDirectionDigits) / 10 ** InlineObjectData.InitialDirectionDigits;
        // this.inlineObjects = inlineObjects;
        this.onConstructionFinished(PageData);
    }
    static fromJSON(page) {
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
            ...super.toJSON(),
            media: this.media.toJSON(),
            inlineObjects: this.inlineObjects.map(value => value.toJSON()),
            is_panorama: this.isPanorama,
            is_360: this.is360,
            initial_direction: this.initialDirection,
        };
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
}
(() => {
    DataClass(PageData, ["media", "is360", "isPanorama", "initialDirection", "inlineObjects"], ["inlineObjects", "withIsPanorama", "withIs360"]);
})();
PageData.default = new PageData({
    id: "badID",
    animationType: "forward",
    initialDirection: 0,
    isPanorama: false,
    is360: false,
    inlineObjects: [],
    media: MediaData.default,
});
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
    static default() {
        return new SchulTourConfigFile({
            pages: [],
            initialPage: undefined,
            fullscreen: true,
            colorTheme: "dark",
            mode: "normal",
        });
    }
    static fromJSON(json) {
        const pages = json.pages.map(PageData.fromJSON);
        return new SchulTourConfigFile({
            pages: pages,
            initialPage: json.initialPage,
            fullscreen: json.fullscreen ?? true,
            colorTheme: json.colorTheme ?? "dark",
            mode: json.mode ?? "normal",
        });
    }
}
(() => {
    DataClass(SchulTourConfigFile, ["pages", "initialPage", "fullscreen", "colorTheme", "mode"]);
})();
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
export { Data, DataClass, SchulTourConfigFile, PageData, InlineObjectData, AbstractInlineObjectData, AbstractAddressableInlineObjectData, ClickableData, CustomObjectData, TextFieldData, MediaData, SourceData, FileData, hashString, uniqueId, arrayEquals, };
//# sourceMappingURL=Data.js.map