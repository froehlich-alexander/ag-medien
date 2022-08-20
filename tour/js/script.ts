import {
    ClickableData,
    CustomObjectData,
    InlineObjectData,
    MediaData,
    PageData,
    SourceData,
    TextFieldData,
} from "./Data.js";
import type {
    FetchPriorityType,
    JsonClickable,
    JsonCustomObject,
    JsonInlineObject,
    JsonPage,
    JsonSchulTourConfigFile,
    JsonTextField,
    LoadingType,
    MediaType,
    PageAnimations,
    VideoPreloadType,
} from "./types";

var finished_last = true;
let idPrefix = "tour_pg_";
let imgFolder = "media";
let baustellenFotoUrl = imgFolder + "/baustelle.png";
let animationDuration = 500;
let lastest = "";
let pages: Page[] = [];
let isDesktop = window.innerWidth > 768;

/**
 * This class holds the media element for the page. This could be an image, a video, etc. (see {@link MediaType} for more options)<br>
 */
class Media<T extends HTMLImageElement | HTMLVideoElement | HTMLIFrameElement = HTMLImageElement | HTMLVideoElement | HTMLIFrameElement> {
    // the actual string which is used as src attr of the <img> <video>, etc. tag
    public readonly srcString: string;
    protected _src: SourceData;
    private _page?: Page;

    private _type!: MediaType;
    private visibilityObserver: IntersectionObserver;

    declare protected _html: JQuery<T>;

    public static readonly imgFileEndings = ["png", "jpeg", "jpg", "gif", "svg", "webp", "apng", "avif"];
    public static readonly videoFileEndings = ["mp4", "webm", "ogg", "ogm", "ogv", "avi"];
    //this list is not exhaustive
    public static readonly iframeUrlEndings = ["html", "htm", "com", "org", "edu", "net", "gov", "mil", "int", "de", "en", "eu", "us", "fr", "ch", "at", "au"];

    // constructor(src: string, type: MediaType | "auto", poster: string, autoplay: boolean, loop: boolean, muted: boolean) {
    //     this.src = src;
    //     this.autoplay = autoplay;
    //     this.loop = loop;
    //     this.muted = muted;
    //     this.poster = poster;
    //     this.type = type;
    //     if (this.type === "img") {
    //         this._html = $("<img>")
    //             .prop("alt", "Could not load Image :(") as JQuery<HTMLImageElement>;
    //     } else if (this.type === "video") {
    //         this._html = $("<video></video>")
    //             .text("HTML Video is not supported / Could not load video")
    //             .attr("poster", this.poster)
    //             .prop("autoplay", this.autoplay)
    //             .prop("loop", this.loop)
    //             .prop("muted", this.muted) as JQuery<HTMLVideoElement>;
    //     } else {
    //         throw "Type not specified"
    //     }
    // }

    protected constructor(src: SourceData) {
        this._src = src;
        this.srcString = Media.formatSrc(src.name);
        this._type = src.type;

        this.visibilityObserver = new IntersectionObserver(() => {
            this.triggerResize();
        }, {
            root: null,
            threshold: 0,
        });
    }

    /**
     * Create a {@link Media} object from a {@link MediaData} object
     * @param data
     */
    public static from(data: MediaData): Media {
        // higher / lower resolution and loading type depend on device (=connection bandwidth)
        let src: SourceData;
        let loading: LoadingType;
        // if (window.innerWidth > 768) {
        if (isDesktop) {
            //desktop
            src = data.srcMax ?? (data.src ?? data.srcMin)!;
            loading = "eager";
        } else {
            //mobile
            src = data.srcMin ?? (data.src ?? data.srcMax)!;
            loading = "lazy";
        }

        switch (data.type) {
            case "img":
                return new ImageMedia({
                    src: src,
                    loading: loading,
                    fetchPriority: data.fetchPriority,
                });
            case "video":
                return new VideoMedia({
                    ...data,
                    src: src,
                });
            case "iframe":
                return new IframeMedia({
                    src: src,
                    loading: loading,
                    fetchPriority: data.fetchPriority,
                });

        }
    }

    /**
     * Here we are doing actions regardless of the media type
     * @private
     */
    protected prepareHTML() {
        // Error logging
        this.html.on("error", () => {
            console.error("error");
            console.warn("Error loading Media", this);
        });

        // add width and height from json
        if (this.src.width && this.src.height) {
            this.html.attr('width', this.src.width);
            this.html.attr('height', this.src.height);
        }

        this.visibilityObserver.observe(this.html[0]);

        this.html.addClass("bg");
    }

    // public static fromJson(jsonMedia: JsonMedia): Media {
    //     //check for mistakes
    //     if (jsonMedia == null)
    //         throw `Media is ${jsonMedia}`;
    //     if (!jsonMedia.src && !jsonMedia.srcMin && !jsonMedia.srcMax)
    //         console.error(`Media source is not given in media object: `, jsonMedia);
    //
    //     //higher / lower resolution and loading type depend on device (=connection bandwidth)
    //     let src;
    //     let loading: LoadingType;
    //     // if (window.innerWidth > 768) {
    //     if (isDesktop) {
    //         //desktop
    //         src = jsonMedia.srcMax ?? (jsonMedia.src ?? jsonMedia.srcMin);
    //         loading = "eager";
    //     } else {
    //         //mobile
    //         src = jsonMedia.srcMin ?? (jsonMedia.src ?? jsonMedia.srcMax);
    //         loading = "lazy";
    //     }
    //
    //     //loading
    //     if (jsonMedia.loading !== "auto" && jsonMedia.loading !== undefined) {
    //         loading = jsonMedia.loading;
    //     }
    //
    //     //check src
    //     if (src == null) {
    //         console.error("src == ", src, "Json Media:", jsonMedia);
    //     }
    //
    //     switch (this.determineType(jsonMedia.type ?? "auto", src!)) {
    //         case "img":
    //             return new ImageMedia(src!, loading, jsonMedia.fetchPriority ?? "auto");
    //         case "video":
    //             return new VideoMedia(src!, jsonMedia.poster ?? "", jsonMedia.autoplay ?? false,
    //                 jsonMedia.loop ?? false, jsonMedia.muted ?? false, jsonMedia.preload ?? "metadata");
    //         case "iframe":
    //             return new IframeMedia(src!, loading, jsonMedia.fetchPriority ?? "auto");
    //     }
    //
    //     //default parameters on absence
    //     // return new Media(src!, jsonMedia.type ?? "auto", jsonMedia.poster ?? "", jsonMedia.autoplay ?? false, jsonMedia.loop ?? false, jsonMedia.muted ?? false);
    // }

    public clone(): Media {
        // let n = new Media(this.src, this.type, this.poster, this.autoplay, this.loop, this.muted);
        let n = new Media(this._src);
        n._html = this._html.clone(true);
        return n;
    }

    // @ts-ignore
    public get page(): Page | undefined {
        return this._page;
    }

    public set page(value: Page) {
        this._page = value;
        this.onPageSet();
    }

    /**
     * Override this method to do things when we know the natural intrinsic size of this media<br>
     * This method is called each time the intrinsic size changes, that means
     * 1. eventually at the construction (if width and height is specified in json file),
     * and 2. when the file is fully loaded
     * @protected
     */
    protected onSizeKnown() {
        // remove eventually previously added width and height specified from json file, because that could be wrong
        this.html.removeAttr('width')
            .removeAttr('height');
        this.triggerResize();
    }

    protected onPageSet(): void {
        if (this.src.width && this.src.height) {
            this.onSizeKnown();
        }
    }

    /**
     * This method gets called when the media gets visible the first time or when the page is resized or when the visibility changes<br>
     * {@link SourceData.width} and {@link SourceData.height} will available here
     * You can override this method
     * @protected
     */
    protected onResize(): void {
        console.log('on Resize', this.page?.id);
        //todo call this when resized!!!
        this.applyRatio();
    }

    public triggerResize() {
        // console.log('trigger resize', this.page?.id);
        if (this.html.is(':visible') && this.page && this.src.width && this.src.height) {
            this.onResize();
        }
    }

    public isImage(self: JQuery<HTMLImageElement | HTMLVideoElement | HTMLIFrameElement> = this.html): self is JQuery<HTMLImageElement> {
        return this._type === "img";
    }

    public isVideo(self: JQuery<HTMLImageElement | HTMLVideoElement | HTMLIFrameElement> = this.html): self is JQuery<HTMLVideoElement> {
        return this._type === "video";
    }

    public isIframe(self: JQuery<HTMLImageElement | HTMLVideoElement | HTMLIFrameElement> = this.html): self is JQuery<HTMLIFrameElement> {
        return this._type === "iframe";
    }

    get html() {
        return this._html;
    }

    public get src(): SourceData {
        return this._src;
    }

    get type(): MediaType {
        return this._type;
    }

    set type(value: MediaType | "auto") {
        this._type = Media.determineType(value, this.srcString);
    }

    /**
     * Toggles classes depending on the ratio of this media and the ratio of the viewport (window)
     * @private
     */
    protected applyRatio() {
        const screenRatio = window.innerWidth / window.innerHeight;
        let mediaRatio = this._src.width! / this._src.height!;
        if (mediaRatio > screenRatio) {
            this.html.addClass("fill-width")
                .removeClass("fill-height");
        } else {
            this.html.addClass("fill-height")
                .removeClass("fill-width");
        }
    }

    public static determineType(value: MediaType | "auto", src: string): MediaType {
        let res: MediaType;
        if (value === "auto") {
            let fileSplit = src.split(".");
            let fileEnding = fileSplit[fileSplit.length - 1];
            if (Media.imgFileEndings.indexOf(fileEnding) > -1) {
                res = "img";
            } else if (Media.videoFileEndings.indexOf(fileEnding) > -1) {
                res = "video";
            } else if (Media.iframeUrlEndings.indexOf(fileEnding) > -1) {
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
        return imgFolder + "/" + src;
    }

    public pause(): void {
    }
}

class VideoMedia extends Media<HTMLVideoElement> {
    public readonly poster?: string;
    public readonly autoplay: boolean;
    public readonly loop: boolean;
    public readonly muted: boolean;
    public readonly preload: VideoPreloadType;

    declare protected _html: JQuery<HTMLVideoElement>;

    constructor(
        {
            src, autoplay, loop, muted, poster, preload,
        }: {
            src: SourceData,
            poster?: string,
            autoplay: boolean,
            loop: boolean,
            muted: boolean,
            preload: VideoPreloadType,
        }) {
        super(src.withType("video"));
        this.poster = poster;
        this.autoplay = autoplay;
        this.loop = loop;
        this.muted = muted;
        this.preload = preload;
        this._html = $("<video></video>")
            .text("HTML Video is not supported")
            .attr("poster", this.poster ?? "")
            .prop("autoplay", this.autoplay)
            .prop("loop", this.loop)
            .prop("muted", this.muted)
            .prop("preload", this.preload) as JQuery<HTMLVideoElement>;

        this.prepareHTML();
        // error handling
        this.html.on("error", () => {
            this.html.attr("poster", baustellenFotoUrl)
                .prop("controls", false);
            // .removeAttr("src")
            // .removeAttr("preload")
            // .removeAttr("type");
        });

        this.html.on('loadedmetadata', () => {
            console.log('Video loaded', this);
            this._src = this.src.withUpdate({
                width: this.html[0].videoWidth,
                height: this.html[0].videoHeight,
            });
            this.onSizeKnown();
        });

        this.html
            .prop("controls", true)
            .append($("<source>"));

        //firefox dispatches error events on last <source> tag, so we need to handle them there
        this.html.find("source").last()
            .on("error", e => this.html.trigger("error", e));

        //add src last so that we won't trigger error event too early
        this.html.find("source").last().attr("type", "video/mp4")
            .attr("src", this.srcString);

        //should be redundant
        if ((this.html.get(0) as HTMLVideoElement).readyState > 0) {
            this.html.trigger('loadedmetadata');
        }
    }

    public clone(): VideoMedia {
        let n = new VideoMedia(this);
        n._html = this.html.clone(true);
        return n;
    }

    public pause() {
        this._html[0].pause();
    }
}

class ImageMedia extends Media<HTMLImageElement> {
    public readonly loading: LoadingType;
    public readonly fetchPriority: FetchPriorityType;

    constructor(
        {src, loading, fetchPriority}: { src: SourceData, loading: LoadingType, fetchPriority: FetchPriorityType }) {
        super(src.withType("img"));
        this.loading = loading;
        this.fetchPriority = fetchPriority;
        this._html = $("<img>")
            .attr("alt", "Could not load Image :(")
            .attr("loading", this.loading)
            .attr("fetchPriority", this.fetchPriority) as JQuery<HTMLImageElement>;

        this.prepareHTML();
        // console.log('img w, h', this.src.name, this.html[0].naturalWidth, this.html[0].height);

        // Error Handling
        this.html.on("error", () => {
            this.html.attr("src", baustellenFotoUrl);
        });

        this.html.on("load", () => {
            console.log(`Media Loaded: ${this.srcString}`);
            this._src = this.src.withUpdate({
                width: this.html[0].naturalWidth,
                height: this.html[0].naturalHeight,
            });
            this.onSizeKnown()
            // this.applyRatio();
            //
            // //remove panorama if screen is big enough
            // if (this.page!.is_panorama && this.src.width! <= window.innerWidth) {
            //     this.page!.is_panorama = false;
            //     this.page!.html.removeClass("pg_panorama");
            // }
            //
            // // let onVisible = (pageElements?: MutationRecord[], observer?: MutationObserver) => {
            // //     // console.log("st")
            // //     // console.info("onVisible params", pageElements, "B:", observer);
            // //
            // //     if (this.html.is(":hidden")) {
            // //         return;
            // //     }
            // //     console.log("onVisible", this.page!.id, this.page!.is_panorama, this.page!.is_360);
            // //     //initial direction
            // //     if (this.page!.is_panorama) {
            // //         let initialDirection = (this.page!.initial_direction / 100) * this.html.width()!;
            // //         console.log("init dir", this.page!.initial_direction, initialDirection);
            // //         if (this.page!.is_360 && initialDirection === 0) {
            // //             console.log("init dir ===", initialDirection, this.html.width());
            // //             initialDirection = this.html.width()!;
            // //         }
            // //         this.html.closest(".pg_wrapper").scrollLeft(initialDirection);
            // //     }
            // //     adjust_clickables();
            // //     //disconnect observer
            // //     if (observer) {
            // //         observer.disconnect();
            // //         // console.info("disconnected observer");
            // //     }
            // // };
            // if (this.html.is(":visible")) {
            //     this.onVisible();
            // } else {
            //     // console.log("obsever")
            //     let observer = new MutationObserver(this.onVisible);
            //     observer.observe(this.page!.html.get(0)!, {
            //         attributeFilter: ["style", "class"],
            //     });
            // }
        });

        this.html.attr('src', this.srcString);
    }

    protected override onSizeKnown() {
        super.onSizeKnown();

        // let onVisible = (pageElements?: MutationRecord[], observer?: MutationObserver) => {
        //     // console.log("st")
        //     // console.info("onVisible params", pageElements, "B:", observer);
        //
        //     if (this.html.is(":hidden")) {
        //         return;
        //     }
        //     console.log("onVisible", this.page!.id, this.page!.is_panorama, this.page!.is_360);
        //     //initial direction
        //     if (this.page!.is_panorama) {
        //         let initialDirection = (this.page!.initial_direction / 100) * this.html.width()!;
        //         console.log("init dir", this.page!.initial_direction, initialDirection);
        //         if (this.page!.is_360 && initialDirection === 0) {
        //             console.log("init dir ===", initialDirection, this.html.width());
        //             initialDirection = this.html.width()!;
        //         }
        //         this.html.closest(".pg_wrapper").scrollLeft(initialDirection);
        //     }
        //     adjust_clickables();
        //     //disconnect observer
        //     if (observer) {
        //         observer.disconnect();
        //         // console.info("disconnected observer");
        //     }
        // };
        // if (this.html.is(":visible")) {
        //     this.onVisible();
        // } else {
        //     // console.log("observer")
        //     let observer = new MutationObserver(this.onVisible);
        //     observer.observe(this.page!.html.get(0)!, {
        //         attributeFilter: ["style", "class"],
        //     });
        // }
    }

    protected override onResize(pageElements?: MutationRecord[]) {
        super.onResize();

        //remove panorama if screen is big enough
        if (this.page!.is_panorama && this.src.width! <= window.innerWidth) {
            this.page!.is_panorama = false;
            this.page!.html.removeClass("pg_panorama");
        }
        // console.log("st")
        // console.info("onVisible params", pageElements, "B:", observer);

        // if (this.html.is(":hidden")) {
        //     return;
        // }
        console.log("onVisible", this.page!.id, this.page!.is_panorama, this.page!.is_360);
        //initial direction
        if (this.page!.is_panorama) {
            let initialDirection = (this.page!.initial_direction / 100) * this.html.width()!;
            console.log("init dir", this.page!.initial_direction, initialDirection);
            if (this.page!.is_360 && initialDirection === 0) {
                console.log("init dir ===", initialDirection, this.html.width());
                initialDirection = this.html.width()!;
            }
            this.html.closest(".pg_wrapper").scrollLeft(initialDirection);
        }
        adjust_clickables();
    };
}

class IframeMedia extends Media<HTMLIFrameElement> {
    public readonly loading: LoadingType;
    public readonly fetchPriority: FetchPriorityType;

    /**
     * @param src
     * @param loading
     * @param fetchPriority
     */
    constructor({src, loading, fetchPriority}:
                    { src: SourceData, loading: LoadingType, fetchPriority: FetchPriorityType }) {
        super(src.withType("iframe"));
        this.loading = loading;
        this.fetchPriority = fetchPriority;
        this._html = $("<iframe></iframe>")
            .addClass('bg')
            .attr("loading", this.loading)
            .attr("fetchPriority", this.fetchPriority) as JQuery<HTMLIFrameElement>;

        this.prepareHTML();

        // Error Handling
        this.html.on("error", () => {
            //the plain html text
            this.html.attr("srcdoc", "<!DOCTYPE html>" +
                "<html lang=\"de\">" +
                "<head>" +
                "    <meta charset=\"UTF-8\">" +
                "    <title>Baustelle</title>" +
                "</head>" +
                "<body>" +
                "<img src=\"./img1/baustelle.png\" alt=\"Baustelle :)\" style=\"width: 100%;height: 100%;\">" +
                "</body>" +
                "</html>");
        });

        this.html.on('load', () => {
            console.log('Iframe loaded', this);
            0;
        });

        // Add src after adding events so that they can get triggered
        this.html.attr("src", this.srcString);
    }
}

class Page {
    public readonly id: string;
    public readonly media: Media;
    public secondaryImg?: Media;
    public is_panorama = false;
    public is_360 = false;
    public initial_direction: number;
    public readonly inlineObjects: InlineObject[];
    private readonly _html: JQuery<HTMLDivElement> = $("<div></div>");

    constructor(
        {
            id, initial_direction,
            media, inlineObjects,
            is_360, is_panorama,
        }: { id: string, media: Media, is_panorama: boolean, is_360: boolean, initial_direction: number, inlineObjects: InlineObject[] }) {
        this.id = id;
        this.media = media;
        this.items.page = this;
        this.is_360 = is_360;
        this.is_panorama = is_panorama;
        this.initial_direction = initial_direction;
        this.inlineObjects = inlineObjects.slice();
    }

    public static from(data: PageData): Page {
        return new Page({
            id: data.id,
            is_panorama: data.isPanorama,
            is_360: data.is360,
            initial_direction: data.initialDirection,
            items: Media.from(data.items),
            inlineObjects: data.inlineObjects.map(InlineObject.from),
        });
    }

    // public static fromJson(jsonPage: JsonPage): Page {
    //     //check if everything is well formatted / check for mistakes
    //     if (typeof jsonPage.id !== "string" || jsonPage.id.length <= 0)
    //         console.error(`Id wrong formatted in page object: `, jsonPage);
    //
    //     //default arguments
    //     return new Page(jsonPage.id, Media.fromJson(jsonPage.img), jsonPage.is_panorama ?? false,
    //         jsonPage.is_360 ?? false, jsonPage.initial_direction ?? 0, ...jsonPage.inlineObjects?.map(v => InlineObject.fromJson(v)) ?? [], ...jsonPage.clickables?.map(v => Clickable.fromJson(v)) ?? []);
    // }

    /**
     * In 360deg IMGs there exists always 2 similar clickables and all of them will be returned
     */
    get clickables(): Clickable[] {
        return this.inlineObjects.filter((v): v is Clickable => v.data.type === "clickable");
    }

    /**
     * Add {@link InlineObject}<br>
     * A {@link Clickable} is also an {@link InlineObject}
     * @param inlineObjects
     */
    public addInlineObjects(...inlineObjects: InlineObject[]) {
        this.inlineObjects.push(...inlineObjects);
    }

    get html() {
        return this._html;
    }
}

/**
 * An Interface for all objects which are placed in front of the main media of a page.
 * All classes which implement this interface (e.g. {@link Clickable}) are also such objects
 */
abstract class InlineObject {
    public readonly data: InlineObjectData;
    // public readonly x?: number;
    // public readonly y?: number;
    // public readonly position: InlineObjectPosition;
    // public readonly type: InlineObjectType;
    // public readonly animationType: AnimationType;
    // public readonly goto?: string;
    private readonly _second: boolean;
    private readonly _html: JQuery;

    protected constructor(
        // {type, animationType, position, x, y, html}:
        //     { position: InlineObjectPosition, html: JQuery, type: InlineObjectType, animationType: AnimationType, x?: number, y?: number }) {
        data: InlineObjectData, htmlTag: keyof HTMLElementTagNameMap | JQuery, isClone = false) {
        // this.position = position;
        // this._html = html;
        // this._second = false;
        // this.type = type;
        // this.x = x;
        // this.y = y;
        // this.animationType = animationType;
        this.data = data;
        this._second = isClone;
        this._html = typeof htmlTag === "string" ? $(`<${htmlTag}/>`) : htmlTag;
        if (!this._second) {
            // console.assert(typeof htmlTag !== "string", "A string must be given when you are creating a new instance");
            // this._html = $(`<${htmlTag}/>`);
            // x and y coordinates
            if (this.data.x !== undefined) {
                this._html.css("left", this.data.x + "%");
            }
            if (this.data.y !== undefined) {
                this._html.css("top", this.data.y + "%");
            }
        } else {
            // console.assert(typeof htmlTag === "object", "A jquery object must be given when you clone a previously created instance");
            // this._html = htmlTag as JQuery;
        }
    }

    // protected clone(newObjectToClone?: InlineObject): InlineObject {
    //     if (newObjectToClone === undefined) {
    //         newObjectToClone = new InlineObject(this.position, this.html.clone(true), this.type, this.animationType, this.x, this.y);
    //     }
    //     newObjectToClone._html = this.html.clone(true);
    //     newObjectToClone._second = true;
    //     return newObjectToClone;
    // }

    protected clonee<T extends { new(data: TData, html?: JQuery<HTMLElement>): TRet }, TData extends InlineObjectData, TRet extends InlineObject>(constructor: T): TRet {
        return new constructor(this.data as TData, this._html.clone(true));
    }

    /**
     * Clones and returns this inline Object (also clones all its events)
     */
    public clone(): this {
        type T = this;
        const constructor = (this.constructor as { new(data: InlineObjectData, html?: JQuery<HTMLElement>): T });
        return new constructor(this.data, this._html.clone(true));
    }

    public get html(): JQuery {
        return this._html;
    }

    public get second(): boolean {
        return this._second;
    }

    public static from(data: InlineObjectData): InlineObject {
        switch (data.type) {
            case "clickable":
                return Clickable.from(data);
            case "custom":
                return CustomObject.from(data);
            case "text":
                return TextField.from(data);
        }
    }

    public static fromJson(jsonInlineObject: JsonInlineObject): InlineObject {
        switch (jsonInlineObject.type) {
            case "clickable":
                return Clickable.fromJson(jsonInlineObject as JsonClickable);
            case "text":
                return TextField.fromJson(jsonInlineObject as JsonTextField);
            case "custom":
                return CustomObject.fromJson(jsonInlineObject as JsonCustomObject);
        }
    }
}

/**
 * This can be any js Object
 */
class CustomObject extends InlineObject {
    declare public readonly data: CustomObjectData;
    // declare public readonly x: number;
    // declare public readonly y: number;
    // declare public readonly animationType: CustomAnimations;
    // public readonly id: string;

    constructor(data: CustomObjectData, html?: JQuery<HTMLElement>) {
        super(data, html ?? $("#" + data.htmlId), html !== undefined);
    }

    // {position, id, animationType, x, y}:
    //     { id: string, position: InlineObjectPosition, x: number, y: number, animationType?: CustomAnimations }) {
    // super({
    //     position: position,
    //     html: $("#" + id),
    //     type: "custom",
    //     animationType: animationType,
    //     x: x,
    //     y: y,
    // });
    // this.id = id;
    // }

    // public override clone(n?: CustomObject): CustomObject {
    //     if (n === undefined) {
    //         n = new CustomObject({
    //             id: this.id,
    //             position: this.position,
    //             x: this.x,
    //             y: this.y,
    //             animationType: this.animationType,
    //         });
    //     }
    //     return super.clone(n) as CustomObject;
    // }
    // public override clone(): CustomObject {
    //     // return super.clone<CustomObject, CustomObjectData, CustomObject>(CustomObject) as CustomObject;
    //     return super.clone();
    // }
}

class TextField extends InlineObject {
    declare public readonly data: TextFieldData;
    // public readonly content: string;
    // public readonly title?: string;
    // public readonly footer?: string;
    // public readonly cssClasses?: string[];
    // declare public readonly animationType: TextAnimations;

    // constructor(content: string, position?: InlineObjectPosition, title?: string, footer?: string, cssClasses?: string[], animationType?: TextAnimations, x?: number, y?: number) {
    //     super({
    //         position: position ?? "page",
    //         html: $("<div/>"),
    //         type: "text",
    //         animationType: animationType ?? undefined,
    //         x: x,
    //         y: y,
    //     });
    //     this.content = content;
    //     this.title = title;
    //     this.footer = footer;
    //     this.cssClasses = cssClasses;
    // }
    constructor(data: TextFieldData, html?: JQuery<HTMLElement>) {
        super(data, html ?? "div", html !== undefined);
    }

    // public static fromJson(json: JsonTextField): TextField {
    //     return new TextField(json.content, "page", json.title, json.footer,
    //         typeof json.cssClasses === "string" ? json.cssClasses.split(" ") : json.cssClasses, json.animationType,
    //         typeof json.x === "string" ? parseFloat(json.x) : json.x, typeof json.x === "string" ? parseFloat(json.x) : json.x);
    // }

    // public override clone(n?: TextField): TextField {
    //     if (n === undefined) {
    //         n = new TextField(this.content, this.position, this.title, this.footer, this.cssClasses, this.animationType, this.x, this.y);
    //     }
    //     return super.clone(n) as TextField;
    // }
}

class Clickable extends InlineObject {
    declare public readonly data: ClickableData;
    // public readonly title: string;
    // declare public readonly x: number;
    // declare public readonly y: number;
    // declare public readonly animationType: PageAnimations;
    // declare public readonly goto: string;
    // public readonly second: boolean; //360deg img
    // public icon: IconType = "arrow_l";

    // constructor({position, y, x, animationType, title, goto, icon}:
    //                 { title: string, x: number, y: number, goto: string, icon: IconType, animationType?: PageAnimations, position?: InlineObjectPosition }) {
    constructor(data: ClickableData, html?: JQuery<HTMLElement>) {
        // super({
        //     position: position ?? "media",
        //     html: $("<div></div>"),
        //     type: "clickable",
        //     animationType: animationType ?? "forward",
        //     x: x,
        //     y: y,
        // });
        super(data, html ?? "div", html !== undefined);
        // this.title = title;
        // // this.x = x;
        // // this.y = y;
        // this.goto = goto;
        // this.icon = icon;

        if (!this.second) {
            this.html.addClass("clickable")
                .attr("goto", this.data.goto!)//todo redundant
                .append($("<div></div>")
                    .addClass("title")
                    .text(this.data.title))
                .append($("<button></button>")
                    .addClass("icon")
                    .addClass(this.data.icon));
        }
    }

    public static from(data: ClickableData): Clickable {
        return new Clickable(data);
        // return new Clickable({
        //     x: data.x,
        //     y: data.y,
        //     icon: data.icon,
        //     title: data.title,
        //     goto: data.goto,
        //     animationType: data.animationType,
        //     position: data.position,
        // });
    }

    /**
     * Creates a {@link Clickable} object from an {@link JsonClickable} object
     * @param jsonClickable
     */
    // public static fromJson(jsonClickable: JsonClickable): Clickable {
    //     //check for mistakes
    //     {
    //         if (jsonClickable == null)
    //             throw `Clickable is ${jsonClickable}`;
    //
    //         if (typeof jsonClickable.title !== "string" || jsonClickable.title.length <= 0)
    //             console.error("Clickable id wrong formatted in json clickable: ", jsonClickable);
    //         if (typeof jsonClickable.x !== "number") {
    //             let error = true;
    //             if (typeof jsonClickable.x === "string") {
    //                 try {
    //                     jsonClickable.x = Number.parseFloat(jsonClickable.x);
    //                     error = false;
    //                 } catch (e) {
    //                 }
    //             }
    //             if (error)
    //                 console.error("Clickable x wrong formatted in json clickable: ", jsonClickable);
    //         }
    //         if (typeof jsonClickable.y !== "number") {
    //             let error = true;
    //             if (typeof jsonClickable.y === "string") {
    //                 try {
    //                     jsonClickable.y = Number.parseFloat(jsonClickable.y);
    //                     error = false;
    //                 } catch (e) {
    //                 }
    //             }
    //             if (error)
    //                 console.error("Clickable y wrong formatted in json clickable: ", jsonClickable);
    //         }
    //     }
    //
    //     //default arguments
    //     return new Clickable(jsonClickable.title, jsonClickable.x as number, jsonClickable.y as number,
    //         jsonClickable.goto, jsonClickable.icon ?? "arrow_l", jsonClickable.animationType ?? (jsonClickable.backward ? "backward" : "forward"), jsonClickable.position);
    // }

    // public override clone(): Clickable {
    //     return super.clone(Clickable) as Clickable;
    // }
}

window.addEventListener('resize', function () {
    let bgImgs: JQuery<HTMLImageElement> = $(".bg");
    bgImgs.removeClass("fill-width");
    bgImgs.removeClass("fill-height");
    bgImgs.each(function () {
        let imgRatio = this.naturalWidth / this.naturalHeight;
        let screenRatio = window.innerWidth / window.innerHeight;
        if (imgRatio > screenRatio) {
            $(this).addClass("fill-width");
        } else {
            $(this).addClass("fill-height");
        }
    });
    for (let i of pages) {
        i.items.triggerResize();
    }
    adjust_clickables();
});

window.addEventListener('popstate', function () {
    let pgs = $(".page");
    pgs.removeClass("show");
    if (window.location.hash !== "")
        $("#" + idPrefix + window.location.hash.slice(1)).addClass("show");
    else
        pgs.eq(0).addClass("show");
});

function goTo(pg: string | undefined, animationType: "backward"): void;
function goTo(pg: string, animationType: PageAnimations): void;
function goTo(pg: string | undefined, animationType: PageAnimations) {
    if (finished_last) {
        finished_last = false;

        let next = pages.find(v => v.id === pg!.substring(idPrefix.length))!;
        let prev = pages.find(v => v.id === $(".page.show").attr("id")!.substring(idPrefix.length))!;
        //pause video
        prev.items.pause();
        next.html.addClass("show");
        adjust_clickables();
        lastest = prev.id;
        if (animationType == "forward") {
            prev.html.addClass("walk_in_out");
            next.html.addClass("walk_in_in");
            setTimeout(function () {
                $(".page.walk_in_in").removeClass("walk_in_in");
                $(".page.walk_in_out").removeClass("show")
                    .removeClass("walk_in_out");
                finished_last = true;
            }, animationDuration);
        } else if (animationType == "backward") {
            prev.html.addClass("walk_out_out");
            next.html.addClass("walk_out_in");
            setTimeout(function () {
                $(".page.walk_out_in").removeClass("walk_out_in");
                $(".page.walk_out_out").removeClass("show")
                    .removeClass("walk_out_out");
                finished_last = true;
            }, animationDuration);
        }
        window.location.hash = next.id;
        createLastestClickable(next.clickables.filter(v => v.data.goto === prev.id));
    }
}

function adjust_clickables() {
    let clickables = $(".clickable");
    clickables.removeClass("right");
    for (let i = 0; i < clickables.length; i++) {
        // let clickables = $(".clickable");
        if (clickables.eq(i).offset()!.left + clickables.eq(i).outerWidth(true)! > clickables.eq(i).parent().offset()!.left + clickables.eq(i).parent().outerWidth(true)!)
            clickables.eq(i).addClass("right");
    }
    // for (var a = 0; a < clickables.length; ++a) {
    //     if ($(".clickable:eq(" + a + ")").offset().left + $(".clickable:eq(" + a + ")").outerWidth(true) > $(".clickable:eq(" + a + ")").parent().offset().left + $(".clickable:eq(" + a + ")").parent().outerWidth(true))
    //         $(".clickable:eq(" + a + ")").addClass("right");
    // }
}

/**
 * @param clickables {Clickable[]}
 */
function createLastestClickable(clickables: Clickable[]) {
    $(".clickable").removeClass("lastest-clickable");
    for (let i of clickables) {
        console.log("lastest lclickable", i.data.goto, i.data.goto === lastest, i);
        i?.html.addClass("lastest-clickable");
    }
}

function createHtml(json: JsonPage[]) {
    let scrollSensitivity = 20;

    for (let pageData of json.map(PageData.fromJSON)) {
        let page = Page.from(pageData);
        // let page = new Page(jsonPage.id, Media.fromJson(jsonPage.img));
        //let page = new Page(jsonPage.id, new Image(jsonPage.img));

        pages.push(page);

        // page.is_360 = page.is_360 != null ? page.is_360 : false;
        // page.is_panorama = (page.is_panorama != null ? page.is_panorama : false) || page.is_360;

        //is mobile device
        //via user agent
        // if (/(iPhone|iPod|iPad|blackberry|android|Kindle|htc|lg|midp|mmp|mobile|nokia|opera mini|palm|pocket|psp|sgh|smartphone|symbian|treo mini|Playstation Portable|SonyEricsson|Samsung|MobileExplorer|PalmSource|Benq|Windows Phone|Windows Mobile|IEMobile|Windows CE|Nintendo Wii)/.test(navigator.userAgent))
        //or via screen size
        if ((!isDesktop) && page.items.isImage()) {
            page.is_panorama = true;
        }
        // console.log("page", page);

        // for (let clickable of jsonPage.clickables.map(jsonClickable => new Clickable(jsonClickable.title,
        //     jsonClickable.x, jsonClickable.y, jsonClickable.goto, jsonClickable.icon, jsonClickable.backward))) {
        //     page.clickables.push(clickable);
        for (let clickable of page.clickables) {
            let gotoExists = json.filter(value => value.id === clickable.data.goto).length > 0;
            if (!gotoExists) {
                console.log("Id '" + clickable.data.goto + "' does not exist");
            }
            // console.log(clickable.data.title, clickable.data.goto);
            // console.log(page.inlineObjects);

            clickable.html.find("button")
                .on("click", gotoExists ? () => {
                    goTo(clickable.data.goto && (idPrefix + clickable.data.goto), clickable.data.animationType);
                } : () => {
                    console.error("Cannot go to next page because '" + clickable.data.goto + "' does not exist");
                });

            // clickable.html
            //     .addClass("clickable")
            //     .attr("goto", clickable.goto!)//todo redundant
            //     .append($("<div></div>")
            //         .addClass("title")
            //         .text(clickable.title))
            //     .append($("<button></button>")
            //         .addClass("icon")
            //         .addClass(clickable.icon)
            //         .on("click", gotoExists ? () => {
            //             goTo(idPrefix + clickable.goto, clickable.backward);
            //         } : () => {
            //             console.error("Cannot go to next page because '" + clickable.goto + "' does not exist");
            //         }))
            //     .css("left", clickable.x + "%")
            //     .css("top", clickable.y + "%");
            // .attr("data-backward", clickable.backward != null ? clickable.backward : null);
        }

        let event;
        if (page.items.isImage() || page.items.isIframe())
            event = "load";
        else if (page.items.isVideo()) {
            event = "loadedmetadata";
        } else {
            console.error("cannot determine event type because Media Type is not known (or not implemented)\nContinuing with 'load' as event type, but FIX THIS");
            event = "load";
        }
        // page.media.html
        //     .addClass("bg")
        //     // .attr("initial_direction", page.initial_direction)
        //     .on(event, function () {
        //         console.log(`Media Loaded: ${page.media.srcString}`);
        //         // let self = $(this);
        //         let self = page.media.html;
        //
        //         self.removeClass("fill-width");
        //         self.removeClass("fill-height");
        //         let imgRatio: number;
        //         if (page.media.isImage(self)) {
        //             imgRatio = self.get(0)!.naturalWidth / self.get(0)!.naturalHeight;
        //             //remove panorama if screen is big enough
        //             if (page.is_panorama && self.get(0)!.naturalWidth <= window.innerWidth) {
        //                 page.is_panorama = false;
        //                 page.html.removeClass("pg_panorama");
        //             }
        //
        //             let onVisible = (pageElements?: MutationRecord[], observer?: MutationObserver) => {
        //                 // console.log("st")
        //                 // console.info("onVisible params", pageElements, "B:", observer);
        //
        //                 if (self.is(":hidden")) {
        //                     return;
        //                 }
        //                 console.log("onVisible", page.id, page.is_panorama, page.is_360);
        //                 //initial direction
        //                 if (page.is_panorama) {
        //                     let initialDirection = (page.initial_direction / 100) * self.width()!;
        //                     console.log("init dir", page.initial_direction, initialDirection);
        //                     if (page.is_360 && initialDirection === 0) {
        //                         console.log("init dir ===", initialDirection, self.width());
        //                         initialDirection = self.width()!;
        //                     }
        //                     self.closest(".pg_wrapper").scrollLeft(initialDirection);
        //                 }
        //                 adjust_clickables();
        //                 //disconnect observer
        //                 if (observer) {
        //                     observer.disconnect();
        //                     // console.info("disconnected observer");
        //                 }
        //             };
        //             if (self.is(":visible")) {
        //                 onVisible();
        //             } else {
        //                 // console.log("obsever")
        //                 let observer = new MutationObserver(onVisible);
        //                 observer.observe(page.html.get(0)!, {
        //                     attributeFilter: ["style", "class"],
        //                 });
        //             }
        //
        //         } else if (page.media.isVideo(self)) {
        //             imgRatio = self.get(0)!.videoWidth / self.get(0)!.videoHeight;
        //         } else if (page.media.isIframe()) {
        //             return; //all resizing has to be done by the iframe itself
        //         } else {
        //             console.error("Need to add handling for MediaType:", page.media.type);
        //             return;
        //         }
        //         let screenRatio = window.innerWidth / window.innerHeight;
        //         if (imgRatio > screenRatio)
        //             self.addClass("fill-width");
        //         else
        //             self.addClass("fill-height");
        //     })
        // .on("error", function () {
        //     console.error("error");
        //     console.warn("Error loading Media", page.media);
        //     if (page.media.isImage())
        //         page.media.html.attr("src", baustellenFotoUrl);
        //     else if (page.media.isVideo()) {
        //         page.media.html
        //             .attr("poster", baustellenFotoUrl)
        //             .prop("controls", false);
        //         // .removeAttr("src")
        //         // .removeAttr("preload")
        //         // .removeAttr("type");
        //     } else if (page.media.isIframe()) {
        //         page.media.html
        //             //the plain html text
        //             .attr("srcdoc", "<!DOCTYPE html>" +
        //                 "<html lang=\"de\">" +
        //                 "<head>" +
        //                 "    <meta charset=\"UTF-8\">" +
        //                 "    <title>Baustelle</title>" +
        //                 "</head>" +
        //                 "<body>" +
        //                 "<img src=\"./img1/baustelle.png\" alt=\"Baustelle :)\" style=\"width: 100%;height: 100%;\">" +
        //                 "</body>" +
        //                 "</html>");
        //     }
        // });
        //add src last so that error and load events aren't triggered before we add the event handler
        // if (page.media.isImage()) {
        //     page.media.html.attr("src", page.media.srcString);
        // } else if (page.media.isVideo()) {
        //     page.media.html
        //         .prop("controls", true)
        //         .append($("<source>"));
        //
        //     //firefox dispatches error events on last <source> tag, so we need to handle them there
        //     page.media.html.find("source").last()
        //         .on("error", e => page.media.html.trigger("error", e));
        //
        //     //add src last so that we won't trigger error event too early
        //     page.media.html.find("source").last().attr("type", "video/mp4")
        //         .attr("src", page.media.srcString);
        //
        //     //should be redundant
        //     if ((page.media.html.get(0) as HTMLVideoElement).readyState > 0) {
        //         page.media.html.trigger(event);
        //     }
        // }
        //iframes src is already added in constructor of IframeMedia obj

        // .each(function () {
        //     if (page.img.isImage() && page.img.html[0].complete || page.img.isVideo() && page.img.html.wid) {
        //         page.img.html.trigger('load');
        //     }
        // });

        // if (page.is_panorama || page.is_360) {
        //     img.attr("initial_direction", page.initial_direction);
        // }

        page.html
            .addClass("page")
            .attr("id", idPrefix + page.id)
            .toggleClass("pg_panorama", page.is_panorama)
            .toggleClass("deg360", page.is_360)
            .append(
                $("<div></div>")
                    .addClass("pg_wrapper"));

        //first img
        page.html.children(".pg_wrapper")
            .append($("<div></div>")
                .addClass("bg_container")
                .append(page.items.html)
                .append(page.inlineObjects
                    .filter(v => v.data.position == "media" && (!v.second))
                    .map(v => v.html)))
            .append(page.inlineObjects
                .filter(v => v.data.position == "page")
                .map(v => v.html));

        if (page.is_360) {
            console.log("is_360");
            //add second clickables for second img in 360deg IMGs
            page.addInlineObjects(...page.clickables.filter(v => v.data.position == "media" && (!v.second)).map(v => v.clone()));
            page.secondaryImg = page.items.clone();
            //second img
            let bgContainer1 = $("<div></div>")
                .addClass("bg_container")
                .append(page.secondaryImg.html)
                .append(page.inlineObjects
                    .filter(v => v.data.position === "media" && v.second)
                    .map(v => v.html));

            page.html.children(".pg_wrapper")
                .append(bgContainer1);

            page.html.find(".pg_wrapper").on("scroll", function () {
                console.log("scroll", this.scrollLeft);
                let self = $(this);
                if (this.scrollWidth - this.clientWidth - this.scrollLeft < scrollSensitivity) {
                    // if new scroll would trigger this event again
                    if (this.scrollLeft - page.items.html.width()! < scrollSensitivity) {
                        return;
                    }
                    self.scrollLeft(this.scrollLeft - page.items.html.width()!);
                } else if (self.scrollLeft()! < scrollSensitivity) {
                    // if new scroll would trigger this event again
                    if (this.scrollWidth - this.clientWidth - (this.scrollLeft + page.items.html.width()!) < scrollSensitivity) {
                        return;
                    }
                    self.scrollLeft(this.scrollLeft + page.items.html.width()!);
                }
            });
        }
        page.html.appendTo("body");
    }
    console.log(json);
    adjust_clickables();
}

/**
 * Ajax requests to file:// endpoints do not work in chrome base browsers<br>
 * That's only relevant for testing
 * @param pagesJsonPath
 */
function init(pagesJsonPath: string) {
    //@ts-ignore
    $.getJSON(pagesJsonPath, (json: JsonSchulTourConfigFile) => {
        console.log("done", json);
        createHtml(json.pages);
        if (window.location.hash !== "") {
            $("#" + idPrefix + window.location.hash.slice(1)).addClass("show");
        } else {
            $(".page").eq(0).addClass("show");
        }
    });
    // $.ajax(pagesJsonPath)
    //     .done(function (data) {
    //         //testing...
    //         // let json = data;
    //         $(() => {
    //             createHtml(json);
    //             if (window.location.hash !== "") {
    //                 $("#" + idPrefix + window.location.hash.slice(1)).addClass("show");
    //             } else {
    //                 $(".page").eq(0).addClass("show");
    //             }
    //         });
    //     })
    //     .catch(function () {
    //             console.log("Error fetching the json file");
    //             //    for testing
    //             $(() => {
    //                 createHtml(json);
    //                 if (window.location.hash !== "") {
    //                     $("#" + idPrefix + window.location.hash.slice(1)).addClass("show");
    //                 } else {
    //                     $(".page").eq(0).addClass("show");
    //                 }
    //             });
    //         }
    //     );
}

const Tour = {
    init: init,
};

Object.defineProperty(window, "Tour", {
    writable: false,
    configurable: false,
    value: Tour,
});

export default Tour;
export {init};

// init("pages.json");
