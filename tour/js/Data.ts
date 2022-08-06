import {
    AbstractJsonInlineObject,
    AnimationType,
    CustomAnimations,
    FetchPriorityType, IconType,
    InlineObjectPosition,
    InlineObjectType, JsonClickable, JsonCustomObject, JsonInlineObject, JsonMedia,
    JsonPage, JsonSource, JsonTextField,
    LoadingType,
    MediaType,
    PageAnimations, TextAnimations,
    VideoPreloadType,
} from "./types.js";

type DataType<T> = Omit<{ [k in keyof T as T[k] extends Function ? never : k]: T[k] }, never>;
type PageDataType = DataType<PageData>;
type Mutable<T> = { -readonly [k in keyof T]: T[k] };

function arrayEquals(array1: Array<any> | undefined, array2: Array<any> | undefined): array2 is typeof array1 {
    if (array1 === array2) {
        return true;
    }
    if (array1 === undefined || array2 === undefined) {
        // s.o. they are not equal (and undefined === undefined is always true)
        return false;
    }
    if (array1.length !== array2.length) {
        return false;
    }
    for (let i = 0; i < array1.length; i++) {
        if (array1[i] !== array2[i]) {
            return false;
        }
    }
    return true;
}

abstract class Data<T extends Data<T>> {
    public abstract equals(other: any | null | undefined): boolean;

    public abstract toJSON(): any;

    public withUpdate(other: Partial<DataType<T>>): T {
        // @ts-ignore
        return new (this.constructor as typeof T)({...this, ...other});
    }
}

class PageData {
    public readonly media: MediaData;
    public readonly id: string;
    public readonly is360: boolean;
    public readonly isPanorama: boolean;
    public readonly initialDirection: number;
    public readonly inlineObjects: InlineObjectData[];

    constructor({
                    media,
                    id,
                    is360,
                    isPanorama,
                    initialDirection,
                    inlineObjects,
                }: PageDataType) {
        this.media = media;
        this.id = id;
        this.is360 = is360;
        this.isPanorama = isPanorama;
        this.initialDirection = initialDirection;
        this.inlineObjects = inlineObjects;
    }

    static fromJSON(page: JsonPage): PageData {
        return new PageData({
            media: MediaData.fromJSON(page.img),
            id: page.id,
            is360: page.is_360 ?? false,
            isPanorama: page.is_panorama ?? false,
            initialDirection: page.initial_direction ?? 0,
            inlineObjects: page.inlineObjects?.map(InlineObjectData.fromJSON) ?? [],
        });
    }

    public equals(other: DataType<PageData> | null | undefined): boolean {
        return other != null && (this === other || (
            this.media.equals(other.media) &&
            this.id === other.id &&
            this.is360 === other.is360 &&
            this.initialDirection === other.initialDirection &&
            this.isPanorama === other.isPanorama &&
            (this.inlineObjects.length === other.inlineObjects.length && this.inlineObjects.map(v => other.inlineObjects.find(value => value.equals(v)) !== undefined)
                .reduce((prev, now) => prev && now, true))
        ));
    }

    public withUpdate(other: Partial<PageData>): PageData {
        return new PageData({...this, ...other});
    }

    public async complete(): Promise<PageData> {
        let media = await this.media.complete();
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
}

class MediaData {
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

    public static readonly imgFileEndings = ["png", "jpeg", "jpg", "gif", "svg", "webp", "apng", "avif"];
    public static readonly videoFileEndings = ["mp4", "webm", "ogg", "ogm", "ogv", "avi"];
    //this list is not exhaustive
    public static readonly iframeUrlEndings = ["html", "htm", "com", "org", "edu", "net", "gov", "mil", "int", "de", "en", "eu", "us", "fr", "ch", "at", "au"];

    constructor(
        other: DataType<MediaData>,
    ) {
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
    }

    public async complete(): Promise<MediaData> {
        const src = await this.src?.complete();
        const srcMin = await this.srcMin?.complete();
        const srcMax = await this.srcMax?.complete();
        if (src !== this.src && srcMin !== this.srcMin && srcMax !== this.srcMax) {
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
            loading: media.loading ?? "auto",
            type: MediaData.determineType(media.type ?? "auto", (src ?? srcMin ?? srcMax)!.name),
            fetchPriority: media.fetchPriority ?? "auto",
            poster: media.poster,
            autoplay: media.autoplay ?? false,
            muted: media.muted ?? false,
            loop: media.loop ?? false,
            preload: media.preload ?? "auto",
        });
    }

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

    public equals(other: DataType<MediaData>): boolean {
        return this === other || (
            this.src === other.src &&
            this.srcMax === other.srcMax &&
            this.srcMin === other.srcMin &&
            this.preload === other.preload &&
            this.autoplay === other.autoplay &&
            this.fetchPriority === other.fetchPriority &&
            this.loading === other.loading &&
            this.loop === other.loop &&
            this.muted === other.muted &&
            this.poster === other.poster &&
            this.type === other.type
        );
    }

    public withUpdate(other: Partial<DataType<MediaData>>): MediaData {
        return new MediaData({...this, ...other});
    }

    public isComplete(): boolean {
        return (this.src?.isComplete() ?? true) &&
            (this.srcMin?.isComplete() ?? true) &&
            (this.srcMax?.isComplete() ?? true);
    }
}

class AbstractInlineObjectData<T extends AbstractInlineObjectData<T, Json>, Json extends AbstractJsonInlineObject> extends Data<T> {
    // standard attributes
    public readonly x: number;
    public readonly y: number;
    public readonly type: InlineObjectType;
    public readonly goto?: string;
    public readonly position: InlineObjectPosition;
    public readonly animationType: AnimationType;

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

    protected constructor(
        {
            x,
            y,
            animationType,
            position,
            type,
            goto,
            // /* clickable */     title, icon,
            // /* text title */    content, footer, cssClasses,
            // /* custom */        htmlId,
        }: DataType<AbstractInlineObjectData<T, Json>>,
    ) {
        super();
        // standard
        this.x = x;
        this.y = y;
        this.type = type;
        this.goto = goto;
        this.position = position;
        this.animationType = animationType;
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

    public equals(other: DataType<AbstractInlineObjectData<T, Json>> | undefined | null): other is DataType<AbstractInlineObjectData<T, Json>> {
        return other != null && (this === other || (
            this.x === other.x &&
            this.y === other.y &&
            this.type === other.type &&
            this.position === other.position &&
            this.animationType === other.animationType &&
            this.goto === other.goto
        ));
    }

    public toJSON(): { [k in keyof Pick<Json, keyof AbstractJsonInlineObject>]: Json[k] } {
        return {
            x: this.x,
            y: this.y,
            type: this.type,
            goto: this.goto,
            position: this.position,
            animationType: this.animationType,
            // title: this.title,
            // icon: this.icon,
            // content: this.content,
            // footer: this.footer,
            // cssClasses: this.cssClasses,
            // htmlId: this.htmlId,
        };
    }
}

const InlineObjectData = {
    fromJSON: function (json: JsonInlineObject): InlineObjectData {
        switch (json.type) {
            case "clickable":
                return ClickableData.fromJSON(json);
            case "text":
                return TextFieldData.fromJSON(json);
            case "custom":
                return CustomObjectData.fromJSON(json);
        }
    },
};

type InlineObjectData = ClickableData | CustomObjectData | TextFieldData;

class ClickableData extends AbstractInlineObjectData<ClickableData,JsonClickable> {
    public readonly title: string;
    public readonly icon: IconType;

    declare public readonly type: "clickable";
    declare public readonly animationType: PageAnimations;

    constructor(
        {title, icon, ...r}: DataType<ClickableData>,
    ) {
        super(r);
        this.title = title;
        this.icon = icon;
    }

    public static fromJSON(json: Omit<JsonClickable, "type">): ClickableData {
        return new ClickableData({
            type: "clickable",
            title: json.title,
            icon: json.icon ?? "arrow_l",
            x: typeof json.x === "number" ? json.x : parseFloat(json.x),
            y: typeof json.y === "number" ? json.y : parseFloat(json.y),
            goto: json.goto,
            position: json.position ?? "media",
            animationType: json.animationType ?? "forward",
        });
    }

    public equals(other: DataType<ClickableData> | undefined | null): other is DataType<ClickableData> {
        return super.equals(other) &&
            this.title === other.title &&
            this.icon === other.icon;
    }

    public toJSON(): JsonClickable {
        return {
            ...super.toJSON(),
            title: this.title,
            icon: this.icon,
        };
    }
}

class TextFieldData extends AbstractInlineObjectData<TextFieldData,JsonTextField> {
    public readonly title?: string;
    public readonly content: string;
    public readonly footer?: string;
    public readonly cssClasses: string[];
    public readonly id: string;

    declare public readonly type: "text";
    declare public readonly animationType: TextAnimations;

    constructor(
        {title, content, footer, cssClasses, id, ...base}: DataType<TextFieldData>,
    ) {
        super(base);
        this.title = title;
        this.content = content;
        this.footer = footer;
        this.cssClasses = cssClasses;
        this.id = id;
    }

    public static fromJSON(json: Omit<JsonTextField, "type">): TextFieldData {
        return new TextFieldData({
            type: "text",
            title: json.title,
            content: json.content,
            cssClasses: typeof json.cssClasses === "string" ? json.cssClasses.split(" ") : json.cssClasses ?? [],
            footer: json.footer,
            id: json.id,
            x: typeof json.x === "number" ? json.x : parseFloat(json.x),
            y: typeof json.y === "number" ? json.y : parseFloat(json.y),
            goto: json.goto,
            position: json.position ?? "media",
            animationType: json.animationType ?? undefined,
        });
    }

    public equals(other: DataType<TextFieldData> | undefined | null): other is DataType<TextFieldData> {
        return super.equals(other) &&
            this.title === other.title &&
            this.content === other.content &&
            this.footer === other.footer &&
            this.id === other.id &&
            arrayEquals(this.cssClasses, other.cssClasses);
    }

    public toJSON(): JsonTextField {
        return {
            ...super.toJSON(),
            title: this.title,
            content: this.content,
            footer: this.footer,
            cssClasses: this.cssClasses,
            id: this.id,
        };
    }
}


class CustomObjectData extends AbstractInlineObjectData<CustomObjectData,JsonCustomObject> {
    public readonly htmlId: string;

    declare public readonly type: "custom";
    declare public readonly animationType: CustomAnimations;

    constructor(
        {htmlId, ...base}: DataType<CustomObjectData>,
    ) {
        super(base);
        this.htmlId = htmlId;
    }

    public static fromJSON(json: Omit<JsonCustomObject, "type">): CustomObjectData {
        return new CustomObjectData({
            type: "custom",
            htmlId: json.htmlId,
            x: typeof json.x === "number" ? json.x : parseFloat(json.x),
            y: typeof json.y === "number" ? json.y : parseFloat(json.y),
            goto: json.goto,
            position: json.position ?? "media",
            animationType: json.animationType ?? undefined,
        });
    }

    public equals(other: DataType<CustomObjectData> | undefined | null): other is DataType<CustomObjectData> {
        return super.equals(other) &&
            this.htmlId === other.htmlId;
    }

    public toJSON(): JsonCustomObject {
        return {
            ...super.toJSON(),
            htmlId: this.htmlId,
        };
    }
}

class SourceData {
    readonly name: string;
    // natural width
    readonly width?: number;
    // natural height
    readonly height?: number;

    readonly type: MediaType;

    // create tool only
    readonly file?: FileData;

    static readonly sourceUrl = "media/";

    constructor({name, width, height, file, type}: DataType<SourceData>) {
        this.name = name;
        this.file = file;
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

    public async complete(): Promise<SourceData> {
        if (this.file != null) {
            if (this.height != null && this.width != null) {
                return this;
            }
            return SourceData.fromFile(this.file.file);
        }
        return SourceData.fromFile(await SourceData.loadMedia(this.name));
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

    public static async loadMedia(name: string): Promise<File> {
        const url = SourceData.sourceUrl + name;
        return fetch(url)
            .then(value => value.blob())
            .then(value => new File([value], name));
        // const canvas = document.createElement("canvas")
        // let ctx = canvas.getContext("2d");
        // ctx.drawImage()
        // document.body.append(objectElement);
    }

    public static async fromFile(file: File): Promise<SourceData> {
        const fileData = FileData.fromFile(file);
        const [width, height] = await fileData.computeWidthHeight();
        return new SourceData({
            name: file.name,
            file: fileData,
            width: width,
            height: height,
            type: MediaData.determineType("auto", file.name),
        });
    }

    public isComplete(): boolean {
        return this.width != null &&
            this.height != null &&
            this.file != null;
    }

    public withUpdate(other: Partial<DataType<SourceData>>): SourceData {
        return new SourceData({...this, ...other});
    }

    public withType(type: MediaType): SourceData {
        return new SourceData({...this, type: type});
    }
}

class FileData {
    name: string;
    size: number;
    type: MediaType;
    file: File;
    private readonly img: HTMLImageElement;
    private readonly video: HTMLVideoElement;

    protected constructor({name, file, size, type}: DataType<FileData>) {
        this.name = name;
        this.size = size;
        this.type = type;
        this.file = file;
        this.img = document.createElement("img");
        // this.img.style.display = "none";
        this.video = document.createElement("video");
        this.video.style.display = "none";
        this.video.preload = "metadata";
        // document.body.append(this.img, this.video);
    }

    public static fromFile(file: File): FileData {
        return new FileData({
            name: file.name,
            size: file.size,
            file: file,
            type: MediaData.determineType("auto", file.name),
        });
    }

    public async computeWidthHeight(): Promise<[number, number]> {
        if (!this.type) {
            this.type = MediaData.determineType("auto", this.name);
        }

        let res: [number, number] | undefined;

        const url = URL.createObjectURL(this.file);
        console.log("media url:", url);

        const cleanup = () => {
            console.log(this.img.naturalWidth);
            URL.revokeObjectURL(url);
            this.video.src = "";
            this.img.src = "";
        };

        return new Promise<[number, number]>((resolve, reject) => {
            if (this.type === "img") {
                this.img.onload = () => {
                    resolve([this.img.naturalWidth, this.img.naturalHeight]);
                    cleanup();
                };
                this.img.src = url;
                // res = [this.img.naturalWidth, this.img.naturalHeight];
            } else if (this.type === "video") {
                this.video.onloadeddata = () => {
                    resolve([this.video.videoWidth, this.video.videoHeight]);
                    cleanup();
                };
                this.video.src = url;
                // res = [this.video.videoWidth, this.video.videoHeight]
            } else {
                cleanup();
                reject();
            }
        });
        // clean up
        // this.img.src = "";
        // this.video.src = "";
        // URL.revokeObjectURL(url);
        // return res;
    }
}

export {
    DataType,
    PageData,
    InlineObjectData,
    ClickableData,
    CustomObjectData,
    TextFieldData,
    MediaData,
    PageDataType,
    SourceData,
    FileData,
};