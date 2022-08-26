import type {MediaContextType} from "./tour-dev-tool/TourContexts";
import type {Complete, UnFlatArray} from "./tour-dev-tool/utils";
import type {
    AbstractJsonInlineObject, JsonActivating, AddressableObjects,
    AnimationType,
    CustomAnimations,
    FetchPriorityType,
    IconType,
    InlineObjectPosition,
    InlineObjectType,
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
    TextAnimations, TextFieldSize,
    VideoPreloadType,
} from "./types";


type DataType<T extends Data<any>> = Omit<{ [k in keyof T as T[k] extends Function ? never : k]: T[k] }, "excludeFromDataType" | T["excludeFromDataType"]>;

/**
 * Checks if the arrays are equal<br>
 * Ignores order of the items and if one item appears more often in one array than in the other
 * @param array1
 * @param array2
 */
function arrayEquals(array1: Array<any> | undefined, array2: Array<any> | undefined): array2 is typeof array1 {
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

abstract class Data<T extends Data<T>> {
    declare abstract excludeFromDataType: keyof T;

    public abstract equals(other: any | null | undefined): boolean;

    public abstract toJSON(): any;

    public withUpdate(other: Partial<DataType<T>>): T {
        // @ts-ignore
        return new (this.constructor as typeof T)({...this, ...other});
    }
}

class SchulTourConfigFile extends Data<SchulTourConfigFile> {
    public declare excludeFromDataType: "excludeFromDataType";

    public readonly pages: PageData[];

    constructor(other: DataType<SchulTourConfigFile>) {
        super();
        this.pages = other.pages;
    }

    public static default(): SchulTourConfigFile {
        return new SchulTourConfigFile({
            pages: [],
        });
    }

    public static fromJSON(json: JsonSchulTourConfigFile): SchulTourConfigFile {
        return new SchulTourConfigFile({
            pages: json.pages.map(PageData.fromJSON),
        });
    }

    public equals(other: null | undefined | DataType<SchulTourConfigFile>): boolean {
        return other != null && (this === other || arrayEquals(this.pages, other.pages));
    }

    public toJSON(): JsonSchulTourConfigFile {
        return {
            pages: this.pages.map(page => page.toJSON()),
        };
    }
}

class PageData extends Data<PageData> {
    public declare excludeFromDataType: "excludeFromDataType";

    public readonly media: MediaData;
    public readonly id: string;
    public readonly is360: boolean;
    public readonly isPanorama: boolean;
    public readonly initialDirection: number;
    public readonly inlineObjects: InlineObjectData[];

    constructor({media, id, is360, isPanorama, initialDirection, inlineObjects}: DataType<PageData>) {
        super();
        this.media = media;
        this.id = id;
        this.is360 = is360;
        this.isPanorama = isPanorama;
        this.initialDirection = initialDirection;
        this.inlineObjects = inlineObjects;
    }

    static fromJSON(page: JsonPage): PageData {
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

    public equals(other: DataType<PageData> | null | undefined): boolean {
        return other != null && (this === other || (
            this.media.equals(other.media) &&
            this.id === other.id &&
            this.is360 === other.is360 &&
            this.initialDirection === other.initialDirection &&
            this.isPanorama === other.isPanorama &&
            //@ts-ignore
            (this.inlineObjects.length === other.inlineObjects.length && this.inlineObjects.map(v => other.inlineObjects.find(value => value.equals(v)) !== undefined)
                .reduce((prev, now) => prev && now, true))
        ));
    }

    public withUpdate(other: Partial<PageData>): PageData {
        return new PageData({...this, ...other});
    }

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

    public toJSON(): JsonPage {
        return {
            id: this.id,
            media: this.media.toJSON(),
            inlineObjects: this.inlineObjects.map(value => value.toJSON()),
            is_panorama: this.isPanorama,
            is_360: this.is360,
            initial_direction: this.initialDirection,
        };
    }

    public withId(id: string): PageData {
        return new PageData({...this, id: id});
    }

    public withInlineObjects(...inlineObjects: UnFlatArray<InlineObjectData>): PageData {
        return new PageData({...this, inlineObjects: inlineObjects.flat()});
    }

    public withInitialDirection(initialDirection: number): PageData {
        if (this.initialDirection === initialDirection) {
            return this;
        }
        return new PageData({...this, initialDirection: initialDirection});
    }

    public withMedia(media: MediaData): PageData {
        if (this.media === media) {
            return this;
        }
        return new PageData({...this, media: media});
    }

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
}

class MediaData extends Data<MediaData> {
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

    declare excludeFromDataType: "fileDoesNotExist";

    constructor(
        other: DataType<MediaData>,
    ) {
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

    public async complete(mediaContext: MediaContextType): Promise<MediaData> {
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

    public allTypes(): Array<MediaType> {
        return [this.src?.type, this.srcMin?.type, this.srcMax?.type].filter((value): value is MediaType => value != null);
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

    public toJSON(): JsonMedia {
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

class AbstractInlineObjectData<T extends AbstractInlineObjectData<T, Json>, Json extends AbstractJsonInlineObject> extends Data<T> {
    public declare excludeFromDataType: "excludeFromDataType";

    // standard attributes
    public readonly x: number;
    public readonly y: number;
    public readonly type: InlineObjectType;
    public readonly position: InlineObjectPosition;
    public readonly animationType: AnimationType;
    public readonly hidden: boolean;

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
            hidden,
        }: DataType<AbstractInlineObjectData<T, Json>>,
    ) {
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

    public equals(other: DataType<AbstractInlineObjectData<T, Json>> | undefined | null): other is DataType<AbstractInlineObjectData<T, Json>> {
        return other != null && (this === other || (
            this.x === other.x &&
            this.y === other.y &&
            this.type === other.type &&
            this.position === other.position &&
            this.animationType === other.animationType &&
            this.hidden === other.hidden
        ));
    }

    public toJSON(): { [k in keyof Pick<Json, keyof AbstractJsonInlineObject>]: Json[k] } {
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

    public isClickable(): this is ClickableData {
        return this.type === "clickable";
    }

    public isTextField(): this is TextFieldData {
        return this.type === "text";
    }

    public isCustom(): this is CustomObjectData {
        return this.type === "custom";
    }

    public isAddressable(): this is AbstractAddressableInlineObjectData<T & AbstractAddressableInlineObjectData<any, any>, Json & JsonAddressableObject> {
        return this instanceof AbstractAddressableInlineObjectData;
    }

    public withType(type: T["type"]): this {
        return new (this.constructor as typeof AbstractInlineObjectData)({...this, type: type}) as this;
    }

    public withPosition(position: InlineObjectPosition): this {
        return new (this.constructor as typeof AbstractInlineObjectData)({...this, position: position}) as this;
    }

    public withX(x: number): this {
        return new (this.constructor as typeof AbstractInlineObjectData)({...this, x: x}) as this;
    }

    public withY(y: number): this {
        return new (this.constructor as typeof AbstractInlineObjectData)({...this, y: y}) as this;
    }

    public withAnimationType(animationType: AnimationType): this {
        return new (this.constructor as typeof AbstractInlineObjectData)({
            ...this,
            animationType: animationType,
        }) as this;
    }

    public withGoto(goto: string): this {
        return new (this.constructor as typeof AbstractInlineObjectData)({...this, goto: goto}) as this;
    }

    public withHidden(hidden: boolean): this {
        if (this.hidden === hidden) {
            return this;
        }
        return new (this.constructor as typeof AbstractInlineObjectData)({...this, hidden: hidden}) as this;
    }
}

class AbstractAddressableInlineObjectData<T extends AbstractAddressableInlineObjectData<T, Json>, Json extends AbstractJsonInlineObject & JsonAddressableObject> extends AbstractInlineObjectData<T, Json> {
    public declare excludeFromDataType: "excludeFromDataType";

    public readonly id: string;

    protected constructor({id, ...base}: DataType<AbstractAddressableInlineObjectData<T, Json>>) {
        super(base);
        this.id = id;
    }

    public equals(other: DataType<AbstractAddressableInlineObjectData<T, Json>> | undefined | null): other is DataType<AbstractAddressableInlineObjectData<T, Json>> {
        return super.equals(other)
            && this.id === other.id
            && this.hidden === other.hidden;
    }

    public toJSON(): { [k in keyof Pick<Json, keyof (AbstractJsonInlineObject & JsonAddressableObject)>]: Json[k] } {
        return {
            ...super.toJSON(),
            id: this.id,
        };
    }

    public withId(id: string): this {
        return new (this.constructor as typeof AbstractAddressableInlineObjectData)({...this, id: id}) as this;
    }
}

class AbstractActivatingInlineObjectData<T extends AbstractActivatingInlineObjectData<T, Json>, Json extends AbstractJsonInlineObject & JsonActivating> extends AbstractInlineObjectData<T, Json> {
    public declare excludeFromDataType: "excludeFromDataType";

    public readonly goto?: string;
    public readonly targetType: AddressableObjects;

    constructor({goto, targetType, ...base}: DataType<AbstractActivatingInlineObjectData<T, Json>>) {
        super(base);
        this.goto = goto;
        this.targetType = targetType;
    }

    public toJSON(): { [k in keyof Pick<Json, keyof (AbstractJsonInlineObject & JsonActivating)>]: Json[k] } {
        return {
            ...super.toJSON(),
            goto: this.goto,
            targetType: this.targetType,
        };
    }

    public equals(other: DataType<AbstractActivatingInlineObjectData<T, Json>> | undefined | null): other is DataType<AbstractActivatingInlineObjectData<T, Json>> {
        return super.equals(other)
            && this.goto === other.goto
            && this.targetType === other.targetType;
    }

    public withGoto(goto: string): this {
        if (this.goto === goto) {
            return this;
        }
        return new (this.constructor as typeof AbstractActivatingInlineObjectData)({...this, goto: goto}) as this;
    }

    public withTargetType(targetType: AddressableObjects): this {
        if (this.targetType === targetType) {
            return this;
        }
        return new (this.constructor as typeof AbstractActivatingInlineObjectData)({
            ...this,
            targetType: targetType,
        }) as this;
    }
}

const InlineObjectData = {
    Types: (["clickable", "text", "custom"] as Array<InlineObjectType>),
    Positions: (["media", "page"] as Array<InlineObjectPosition>),
    AnimationTypes: (["forward", "backward"] as Array<AnimationType>),

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

class ClickableData extends AbstractActivatingInlineObjectData<ClickableData, JsonClickable> {
    public declare excludeFromDataType: "excludeFromDataType";

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
    }

    public static default: ClickableData = new ClickableData({
        icon: "arrow_l",
        title: "",
        animationType: "forward",
        goto: "",
        targetType: "page", // TODO 26.08.22 thats not good add auto detection!!!
        x: 0,
        y: 0,
        type: "clickable",
        position: "media",
        hidden: false,
    });

    public static fromJSON(json: Omit<JsonClickable, "type">): ClickableData {
        return new ClickableData({
            type: "clickable",
            title: json.title,
            icon: json.icon ?? ClickableData.default.icon,
            x: typeof json.x === "number" ? json.x : parseFloat(json.x),
            y: typeof json.y === "number" ? json.y : parseFloat(json.y),
            goto: json.goto,
            targetType: json.targetType ?? ClickableData.default.targetType,
            position: json.position ?? ClickableData.default.position,
            animationType: json.animationType ?? ClickableData.default.animationType,
            hidden: json.hidden ?? ClickableData.default.hidden,
        });
    }

    public equals(other: DataType<ClickableData> | undefined | null): other is DataType<ClickableData> {
        return super.equals(other)
            && this.title === other.title
            && this.icon === other.icon;
    }

    public toJSON(): JsonClickable {
        return {
            ...super.toJSON(),
            title: this.title,
            icon: this.icon,
        } as JsonClickable;
        // we need to cast here because JsonActivating is dynamic
    }

    public withIcon(icon: IconType): ClickableData {
        return new ClickableData({...this, icon: icon});
    }

    public withTitle(title: string): ClickableData {
        return new ClickableData({...this, title: title});
    }
}

class TextFieldData extends AbstractAddressableInlineObjectData<TextFieldData, JsonTextField> {
    public declare excludeFromDataType: "excludeFromDataType";

    public readonly title?: string;
    public readonly content: string;
    public readonly cssClasses: string[];
    public readonly size: TextFieldSize;
    // public readonly id: string;

    declare public readonly type: "text";
    declare public readonly animationType: TextAnimations;

    constructor(
        {title, content, cssClasses, size, ...base}: DataType<TextFieldData>,
    ) {
        super({...base, type: "text"});
        this.title = title;
        this.content = content;
        this.cssClasses = cssClasses;
        this.size = size;
        // this.id = id;
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

    public equals(other: DataType<TextFieldData> | undefined | null): other is DataType<TextFieldData> {
        return super.equals(other) &&
            this.title === other.title &&
            this.content === other.content &&
            this.size === other.size &&
            // this.id === other.id &&
            arrayEquals(this.cssClasses, other.cssClasses);
    }

    public toJSON(): JsonTextField {
        return {
            ...super.toJSON(),
            title: this.title,
            content: this.content,
            cssClasses: this.cssClasses,
            size: this.size,
        };
    }

    public withTitle(title: string): TextFieldData {
        return new TextFieldData({...this, title: title});
    }

    public withContent(content: string): TextFieldData {
        return new TextFieldData({...this, content: content});
    }

    public withCssClasses(cssClasses: string[]): TextFieldData {
        return new TextFieldData({...this, cssClasses: cssClasses});
    }

    public withFooter(footer: string | undefined): TextFieldData {
        return new TextFieldData({...this, footer: footer});
    }
}

class CustomObjectData extends AbstractInlineObjectData<CustomObjectData, JsonCustomObject> {
    public declare excludeFromDataType: "excludeFromDataType";

    public readonly htmlId: string;

    declare public readonly type: "custom";
    declare public readonly animationType: CustomAnimations;

    constructor(
        {htmlId, ...base}: DataType<CustomObjectData>,
    ) {
        super({...base, type: "custom"});
        this.htmlId = htmlId;
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

class SourceData extends Data<SourceData> {
    public declare excludeFromDataType: "excludeFromDataType";

    public readonly name: string;
    // natural width
    public readonly width?: number;
    // natural height
    public readonly height?: number;

    public readonly type: MediaType;

    // create tool only
    public readonly file?: FileData;
    public readonly fileDoesNotExist?: boolean;

    // static readonly sourceUrl = "media/";

    constructor({name, width, height, file, type, fileDoesNotExist}: DataType<SourceData>) {
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

    public complete(mediaContext: MediaContextType): SourceData {
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

    public toJSON(): JsonSource {
        return {
            name: this.name,
            type: this.type,
            height: this.height,
            width: this.width,
        };
    }

    public withType(type: MediaType): SourceData {
        if (this.type === type) {
            return this;
        }
        return new SourceData({...this, type: type});
    }

    public withWidth(width: number | undefined): SourceData {
        if (this.width === width) {
            return this;
        }
        return new SourceData({...this, width: width});
    }

    public withHeight(height: number | undefined): SourceData {
        if (this.height === height) {
            return this;
        }
        return new SourceData({...this, height: height});
    }

    public withFileDoesNotExist(fileDoesNotExist: boolean): SourceData {
        if (this.fileDoesNotExist === fileDoesNotExist) {
            return this;
        }
        return new SourceData({...this, fileDoesNotExist: fileDoesNotExist});
    }
}


class FileData extends Data<FileData> {
    public declare excludeFromDataType: "excludeFromDataType" | "outdated";

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

    protected constructor({
                              name, file, size, type, intrinsicWidth, intrinsicHeight, url,
                          }: DataType<FileData>) {
        super();
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

    public equals(other: null | undefined | DataType<FileData>): boolean {
        return other != null && (this === other || (
            this.name === other.name
            && this.type === other.type
            && this.size === other.size
            // && this.hash === other.hash
        ));
    }

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
};
