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
        if (array2.some(value => value !== item && !value.equals?.(item))) {
            return false;
        }
    }
    for (let item of array2) {
        if (array1.some(value => value !== item && !value.equals?.(item))) {
            return false;
        }
    }
    return true;
}
class Data {
    withUpdate(other) {
        // @ts-ignore
        return new this.constructor({ ...this, ...other });
    }
}
class SchulTourConfigFile extends Data {
    constructor(other) {
        super();
        this.pages = other.pages;
        this.initialPage = other.initialPage;
    }
    static default() {
        return new SchulTourConfigFile({
            pages: [],
            initialPage: undefined,
        });
    }
    static fromJSON(json) {
        const pages = json.pages.map(PageData.fromJSON);
        return new SchulTourConfigFile({
            pages: pages,
            initialPage: json.initialPage,
        });
    }
    equals(other) {
        return other != null && (this === other || (arrayEquals(this.pages, other.pages)
            && this.initialPage === other.initialPage));
    }
    toJSON() {
        return {
            pages: this.pages.map(page => page.toJSON()),
            initialPage: this.initialPage,
        };
    }
}
class PageData extends Data {
    constructor({ media, id, is360, isPanorama, initialDirection, inlineObjects }) {
        super();
        this.media = media;
        this.id = id;
        this.is360 = is360;
        this.isPanorama = isPanorama;
        this.initialDirection = initialDirection;
        this.inlineObjects = inlineObjects;
    }
    static fromJSON(page) {
        const inlineObjects = page.inlineObjects?.map(InlineObjectData.fromJSON) ?? [];
        inlineObjects.push(...page.clickables?.map(ClickableData.fromJSON) ?? []);
        const media = MediaData.fromJSON(page.media);
        // defaults to false; iframes cannot be 360 nor panorama
        const is360 = (page.is_360 ?? false) && (media.type === "img" || media.type === "video");
        // defaults to false; iframes cannot be 360 nor panorama
        const isPanorama = is360 || ((page.is_panorama ?? false) && (media.type === "img" || media.type === "video"));
        return new PageData({
            media: media,
            id: page.id,
            is360: is360,
            isPanorama: isPanorama,
            initialDirection: page.initial_direction ?? 0,
            inlineObjects: inlineObjects,
        });
    }
    equals(other) {
        return other != null && (this === other || (this.media.equals(other.media) &&
            this.id === other.id &&
            this.is360 === other.is360 &&
            this.initialDirection === other.initialDirection &&
            this.isPanorama === other.isPanorama &&
            //@ts-ignore
            (this.inlineObjects.length === other.inlineObjects.length && this.inlineObjects.map(v => other.inlineObjects.find(value => value.equals(v)) !== undefined)
                .reduce((prev, now) => prev && now, true))));
    }
    withUpdate(other) {
        return new PageData({ ...this, ...other });
    }
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
            id: this.id,
            media: this.media.toJSON(),
            inlineObjects: this.inlineObjects.map(value => value.toJSON()),
            is_panorama: this.isPanorama,
            is_360: this.is360,
            initial_direction: this.initialDirection,
        };
    }
    withId(id) {
        return new PageData({ ...this, id: id });
    }
    withInlineObjects(...inlineObjects) {
        return new PageData({ ...this, inlineObjects: inlineObjects.flat() });
    }
    withInitialDirection(initialDirection) {
        if (this.initialDirection === initialDirection) {
            return this;
        }
        return new PageData({ ...this, initialDirection: initialDirection });
    }
    withMedia(media) {
        if (this.media === media) {
            return this;
        }
        return new PageData({ ...this, media: media });
    }
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
class MediaData extends Data {
    constructor(other) {
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
    }
    async complete(mediaContext) {
        const src = await this.src?.complete(mediaContext);
        const srcMin = await this.srcMin?.complete(mediaContext);
        const srcMax = await this.srcMax?.complete(mediaContext);
        if (src !== this.src && srcMin !== this.srcMin && srcMax !== this.srcMax) {
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
            loading: media.loading ?? "auto",
            type: MediaData.determineType(media.type ?? "auto", (src ?? srcMin ?? srcMax).name),
            fetchPriority: media.fetchPriority ?? "auto",
            poster: media.poster,
            autoplay: media.autoplay ?? false,
            muted: media.muted ?? false,
            loop: media.loop ?? false,
            preload: media.preload ?? "auto",
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
    equals(other) {
        return this === other || (this.src === other.src &&
            this.srcMax === other.srcMax &&
            this.srcMin === other.srcMin &&
            this.preload === other.preload &&
            this.autoplay === other.autoplay &&
            this.fetchPriority === other.fetchPriority &&
            this.loading === other.loading &&
            this.loop === other.loop &&
            this.muted === other.muted &&
            this.poster === other.poster &&
            this.type === other.type);
    }
    withUpdate(other) {
        return new MediaData({ ...this, ...other });
    }
    isComplete() {
        return (this.src?.isComplete() ?? true) &&
            (this.srcMin?.isComplete() ?? true) &&
            (this.srcMax?.isComplete() ?? true);
    }
    toJSON() {
        return {
            type: this.type,
            src: this.src?.toJSON(),
            srcMin: this.srcMin?.toJSON(),
            srcMax: this.srcMax?.toJSON(),
            fetchPriority: this.fetchPriority,
            loading: this.loading,
            loop: this.loop,
            muted: this.muted,
            preload: this.preload,
            poster: this.poster,
            autoplay: this.autoplay,
        };
    }
}
MediaData.imgFileEndings = ["png", "jpeg", "jpg", "gif", "svg", "webp", "apng", "avif"];
MediaData.videoFileEndings = ["mp4", "webm", "ogg", "ogm", "ogv", "avi"];
//this list is not exhaustive
MediaData.iframeUrlEndings = ["html", "htm", "com", "org", "edu", "net", "gov", "mil", "int", "de", "en", "eu", "us", "fr", "ch", "at", "au"];
MediaData.Types = ["img", "video", "iframe"];
class AbstractInlineObjectData extends Data {
    // // clickable attrs
    // public readonly title?: string;
    // public readonly icon?: IconType;
    // test field
    // public readonly title?: string;
    // public readonly content?: string;
    // public readonly footer?: string;
    // public readonly cssClasses?: string[] | string; // ["class-a", "class-b"] OR "class-a class-b"
    //
    // // custom
    // public readonly htmlId?: string;
    constructor({ x, y, animationType, position, type, hidden, }) {
        super();
        // standard
        this.x = x;
        this.y = y;
        this.type = type;
        this.position = position;
        this.animationType = animationType;
        this.hidden = hidden;
        // // clickable
        // this.title = title;
        // this.icon = icon;
        // //text
        // // this.title = title;
        // this.content = content;
        // this.footer = footer;
        // this.cssClasses = cssClasses;
        // // custom
        // this.htmlId = htmlId;
    }
    // let position = json.position;
    // const extras: Mutable<Partial<DataType<InlineObjectData>>> = {};
    // // apply default position depending on inline object type
    // switch (json.type) {
    //     case "clickable":
    //         position ??= "media";
    //         extras.title = json.title;
    //         extras.icon = json.icon ?? "arrow_l";
    //         break;
    //     case "text":
    //         position ??= "media";
    //         extras.cssClasses = json.cssClasses ?? "";
    //         extras.title = json.title;
    //         extras.content = json.content;
    //         extras.footer = json.footer;
    //         break;
    //     case "custom":
    //         position ??= "media";
    //         extras.htmlId = json.htmlId;
    //         break;
    // }
    //
    // return new InlineObjectData({
    //     ...extras,
    //     x: typeof json.x === "number" ? json.x : parseFloat(json.x),
    //     y: typeof json.y === "number" ? json.y : parseFloat(json.y),
    //     type: json.type,
    //     goto: json.goto,
    //     position: position,
    //     animationType: json.animationType ?? "forward",
    // });
    equals(other) {
        return other != null && (this === other || (this.x === other.x &&
            this.y === other.y &&
            this.type === other.type &&
            this.position === other.position &&
            this.animationType === other.animationType &&
            this.hidden === other.hidden));
    }
    toJSON() {
        return {
            x: this.x,
            y: this.y,
            type: this.type,
            position: this.position,
            animationType: this.animationType,
            hidden: this.hidden,
            // title: this.title,
            // icon: this.icon,
            // content: this.content,
            // footer: this.footer,
            // cssClasses: this.cssClasses,
            // htmlId: this.htmlId,
        };
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
        return new this.constructor({ ...this, type: type });
    }
    withPosition(position) {
        return new this.constructor({ ...this, position: position });
    }
    withX(x) {
        return new this.constructor({ ...this, x: x });
    }
    withY(y) {
        return new this.constructor({ ...this, y: y });
    }
    withAnimationType(animationType) {
        return new this.constructor({
            ...this,
            animationType: animationType,
        });
    }
    withGoto(goto) {
        return new this.constructor({ ...this, goto: goto });
    }
    withHidden(hidden) {
        if (this.hidden === hidden) {
            return this;
        }
        return new this.constructor({ ...this, hidden: hidden });
    }
}
class AbstractAddressableInlineObjectData extends AbstractInlineObjectData {
    constructor({ id, ...base }) {
        super(base);
        this.id = id;
    }
    equals(other) {
        return super.equals(other)
            && this.id === other.id
            && this.hidden === other.hidden;
    }
    toJSON() {
        return {
            ...super.toJSON(),
            id: this.id,
        };
    }
    withId(id) {
        return new this.constructor({ ...this, id: id });
    }
}
class AbstractActivatingInlineObjectData extends AbstractInlineObjectData {
    constructor({ goto, targetType, action, ...base }) {
        super(base);
        this.goto = goto;
        this.targetType = targetType;
        this.action = action;
    }
    toJSON() {
        return {
            ...super.toJSON(),
            goto: this.goto,
            targetType: this.targetType,
            action: this.action,
        };
    }
    equals(other) {
        return super.equals(other)
            && this.goto === other.goto
            && this.targetType === other.targetType;
    }
    withGoto(goto) {
        if (this.goto === goto) {
            return this;
        }
        return new this.constructor({ ...this, goto: goto });
    }
    withTargetType(targetType) {
        if (this.targetType === targetType) {
            return this;
        }
        return new this.constructor({
            ...this,
            targetType: targetType,
        });
    }
}
const InlineObjectData = {
    Types: ["clickable", "text", "custom"],
    Positions: ["media", "page"],
    AnimationTypes: ["forward", "backward"],
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
        this.title = title;
        this.icon = icon;
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
    equals(other) {
        return super.equals(other)
            && this.title === other.title
            && this.icon === other.icon;
    }
    toJSON() {
        return {
            ...super.toJSON(),
            title: this.title,
            icon: this.icon,
        };
        // we need to cast here because JsonActivating is dynamic
    }
    withIcon(icon) {
        return new ClickableData({ ...this, icon: icon });
    }
    withTitle(title) {
        return new ClickableData({ ...this, title: title });
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
class TextFieldData extends AbstractAddressableInlineObjectData {
    constructor({ title, content, cssClasses, size, ...base }) {
        super({ ...base, type: "text" });
        this.title = title;
        this.content = content;
        this.cssClasses = cssClasses;
        this.size = size;
        // this.id = id;
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
    equals(other) {
        return super.equals(other) &&
            this.title === other.title &&
            this.content === other.content &&
            this.size === other.size &&
            // this.id === other.id &&
            arrayEquals(this.cssClasses, other.cssClasses);
    }
    toJSON() {
        return {
            ...super.toJSON(),
            title: this.title,
            content: this.content,
            cssClasses: this.cssClasses,
            size: this.size,
        };
    }
    withTitle(title) {
        return new TextFieldData({ ...this, title: title });
    }
    withContent(content) {
        return new TextFieldData({ ...this, content: content });
    }
    withCssClasses(cssClasses) {
        return new TextFieldData({ ...this, cssClasses: cssClasses });
    }
    withFooter(footer) {
        return new TextFieldData({ ...this, footer: footer });
    }
}
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
class CustomObjectData extends AbstractInlineObjectData {
    constructor({ htmlId, ...base }) {
        super({ ...base, type: "custom" });
        this.htmlId = htmlId;
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
    equals(other) {
        return super.equals(other) &&
            this.htmlId === other.htmlId;
    }
    toJSON() {
        return {
            ...super.toJSON(),
            htmlId: this.htmlId,
        };
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
class SourceData extends Data {
    // static readonly sourceUrl = "media/";
    constructor({ name, width, height, file, type, fileDoesNotExist }) {
        super();
        this.name = name;
        this.file = file;
        this.fileDoesNotExist = fileDoesNotExist;
        // const srcNotExistent: boolean = media.src != null && mediaContext.mediaFiles.find(v => v.name === media.src!.name) === undefined;
        this.width = width;
        this.height = height;
        this.type = type;
        // if (!width || !height) {
        //     this.file?.computeWidthHeight()
        //         .then(([w, h]) => {
        //             console.log("w, h", w, h);
        //             this.width = w;
        //             this.height = h;
        //         });
        // }
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
    withType(type) {
        if (this.type === type) {
            return this;
        }
        return new SourceData({ ...this, type: type });
    }
    withWidth(width) {
        if (this.width === width) {
            return this;
        }
        return new SourceData({ ...this, width: width });
    }
    withHeight(height) {
        if (this.height === height) {
            return this;
        }
        return new SourceData({ ...this, height: height });
    }
    withFileDoesNotExist(fileDoesNotExist) {
        if (this.fileDoesNotExist === fileDoesNotExist) {
            return this;
        }
        return new SourceData({ ...this, fileDoesNotExist: fileDoesNotExist });
    }
}
class FileData extends Data {
    constructor({ name, file, size, type, intrinsicWidth, intrinsicHeight, url, }) {
        super();
        // we would need to get the complete file content and that need way too much time
        // public readonly hash: number;
        // public readonly base64: string;
        this._outdated = false;
        this.name = name;
        this.size = size;
        this.type = type;
        this.file = file;
        this.intrinsicWidth = intrinsicWidth;
        this.intrinsicHeight = intrinsicHeight;
        this.url = url;
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
    equals(other) {
        return other != null && (this === other || (this.name === other.name
            && this.type === other.type
            && this.size === other.size
        // && this.hash === other.hash
        ));
    }
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
export { Data, SchulTourConfigFile, PageData, InlineObjectData, AbstractInlineObjectData, ClickableData, CustomObjectData, TextFieldData, MediaData, SourceData, FileData, hashString, };
//# sourceMappingURL=Data.js.map