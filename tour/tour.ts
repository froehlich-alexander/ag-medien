import {
    ClickableData,
    CustomObjectData,
    InlineObjectData,
    MediaData,
    PageData,
    SchulTourConfigFile,
    SourceData,
    TextFieldData,
} from "./Data.js";
import type {
    AnimationType,
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

let finished_last = true;
let idPrefix = "tour_pg_";
let imgFolder = "media";
let baustellenFotoUrl = imgFolder + "/baustelle.png";
// let animationDuration = 500;
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
    protected initialized: boolean = false;

    private _page?: Page;
    private _type!: MediaType;
    private visibilityObserver: IntersectionObserver;

    declare protected _html: JQuery<T>;

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
            this.html.attr("width", this.src.width);
            this.html.attr("height", this.src.height);
        }

        this.visibilityObserver.observe(this.html[0]);

        this.html.addClass("bg");
    }

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
        this.html.removeAttr("width")
            .removeAttr("height");
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
        console.log("on Resize", this.page?.id);
        this.applyRatio();
    }

    public triggerResize() {
        // console.log('trigger resize', this.page?.id);
        if (this.html.is(":visible") && this.page && this.src.width && this.src.height) {
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
        this._type = MediaData.determineType(value, this.srcString);
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

    constructor({src, autoplay, loop, muted, poster, preload}: {
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

        this.html.on("loadedmetadata", () => {
            console.log("Video loaded", this);
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
            this.html.trigger("loadedmetadata");
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

    constructor({src, loading, fetchPriority}:
                    { src: SourceData, loading: LoadingType, fetchPriority: FetchPriorityType }) {
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
            this.onSizeKnown();
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

        this.html.attr("src", this.srcString);
    }

    protected override onSizeKnown() {
        super.onSizeKnown();
    }

    protected override onResize(pageElements?: MutationRecord[]) {
        super.onResize();
        let panoramaAdded = false;

        //remove panorama if screen is big enough
        if (this.page!.is_panorama && this.src.width! <= window.innerWidth) {
            this.page!.is_panorama = false;
            this.page!.html.removeClass("pg_panorama");
        }
        // add panorama if screen is too small
        else if (!this.page!.is_panorama && this.src.width! > window.innerWidth) {
            this.page!.is_panorama = true;
            this.page!.html.addClass("pg_panorama");
            panoramaAdded = true;
        }
        console.log("onVisible", this.page!.id, this.page!.is_panorama, this.page!.is_360);

        // initial direction
        // only apply this when the page was NOT panorama before
        if (panoramaAdded || !this.initialized) {
            this.applyInitialDirection();
            this.initialized = true;
        }

        adjust_clickables();
    };

    private applyInitialDirection() {
        if (this.page!.is_panorama) {
            let initialDirection = (this.page!.initial_direction / 100) * this.src.width!;
            console.log("init dir", this.page!.initial_direction, initialDirection);
            if (this.page!.is_360 && initialDirection === 0) {
                console.log("init dir ===", initialDirection, this.src.width);
                initialDirection = this.html.width()!;
            }
            this.html.closest(".pg_wrapper").scrollLeft(initialDirection);
        }
    }
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
            .addClass("bg")
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

        this.html.on("load", () => {
            console.log("Iframe loaded", this);
        });

        // Add src after adding events so that they can get triggered
        this.html.attr("src", this.srcString);
    }
}

class Page extends AddressableObject() {
    public readonly id: string;
    public readonly media: Media;
    public secondaryImg?: Media;
    public is_panorama = false;
    public is_360 = false;
    public initial_direction: number;
    public readonly inlineObjects: InlineObject[];
    private readonly _html: JQuery<HTMLDivElement>;

    constructor(
        {
            id, initial_direction,
            media, inlineObjects,
            is_360, is_panorama,
        }: { id: string, media: Media, is_panorama: boolean, is_360: boolean, initial_direction: number, inlineObjects: InlineObject[] }) {
        super();
        this.id = id;
        this.media = media;
        this.media.page = this;
        this.is_360 = is_360;
        this.is_panorama = is_panorama;
        this.initial_direction = initial_direction;
        this.inlineObjects = inlineObjects.slice();
        this._html = $("<div></div>");
        this.html[0].addEventListener("animationend", this.handleAnimationEnd);
    }

    public static from(data: PageData): Page {
        return new Page({
            id: data.id,
            is_panorama: data.isPanorama,
            is_360: data.is360,
            initial_direction: data.initialDirection,
            media: Media.from(data.media),
            inlineObjects: data.inlineObjects.map(InlineObject.from),
        });
    }

    // event handler when the animation has ended
    private handleAnimationEnd = (event: AnimationEvent) => {

        // activation
        if (event.animationName.startsWith("activate")) {
            this.html
                .removeClass("activate-forward")
                .removeClass("activate-backward");
            this.activateRunning = false;
            // finished last only true if (de-) activation has finished on all pages
            finished_last = pages.map(page => !page.activateRunning && !page.deactivateRunning)
                .reduce((p, c) => p && c);
        }
        // deactivation
        if (event.animationName.startsWith("deactivate")) {
            this.html
                .removeClass("show")
                .removeClass("deactivate-forward")
                .removeClass("deactivate-backward");
            this.deactivateRunning = false;
            // finished last only true if (de-) activation has finished on all pages
            finished_last = pages.map(page => !page.activateRunning && !page.deactivateRunning)
                .reduce((p, c) => p && c);
        }
    };

    protected activateAllowed(): boolean {
        return finished_last && !this.activated && !this.activateRunning;
    }

    public activate(animationType: PageAnimations): boolean {
        if (!super.activate()) {
            return false;
        }
        finished_last = false;
        let prevPage: Page;
        this.html.addClass("show");
        adjust_clickables();

        // get prev page
        for (let page of pages) {
            if (page.activated && page.id !== this.id) {
                prevPage = page;
                break;
            }
        }

        // activate / show this page
        switch (animationType) {
            case "forward":
                this.html.addClass("activate-forward");
                break;
            case "backward":
                this.html.addClass("activate-backward");
                break;
        }
        // deactivate / start hide animation on prev page
        prevPage!.deactivate(animationType);

        window.location.hash = this.id;
        createLastestClickable(this.clickables.filter(v => v.data.goto === prevPage.id));

        // goTo(this.id, animationType);
        return true;
    }

    public deactivate(animationType?: AnimationType): boolean {
        if (!super.deactivate(animationType)) {
            return false;
        }
        this.media.pause();
        lastest = this.id;
        switch (animationType) {
            case "forward":
                this.html.addClass("deactivate-forward");
                break;
            case "backward":
                this.html.addClass("deactivate-backward");
                break;
        }
        return true;
    }

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

    public initialActivate(pages: Page[]): void {
        this.activated = true;
        this.html.addClass("show");

        // set lastest to any page with a matching clickable
        // backward animations need the lastest variable, otherwise they won't work
        for (let page of pages) {
            if (page.id === this.id) {
                continue;
            }
            let done = false;
            for (let c of page.clickables) {
                if (c.data.goto === this.id) {
                    lastest = page.id;
                    done = true;
                    break;
                }
            }
            if (done) {
                break;
            }
        }

        // since the user did not really come from the page which is now the lastest we could skip this ???
        createLastestClickable(this.clickables.filter(value => value.data.goto === lastest));
    }
}

function AddressableObject<T extends { new(...args: any[]): {} }>(baseClass?: T) {
    if (baseClass === undefined) {
        baseClass = class PlaceHolder {
        } as T;
    }
    return class AddressableObject extends baseClass {
        protected activated: boolean = false;
        protected activateRunning = false;
        protected deactivateRunning = false;

        protected activateAllowed(): boolean {
            return !this.activated && !this.activateRunning && !this.deactivateRunning;
        }

        protected deactivateAllowed(): boolean {
            return this.activated && !this.deactivateRunning && !this.activateRunning;
        }

        public activate(animationType?: AnimationType): boolean {
            if (!this.activateAllowed()) {
                return false;
            }
            this.activated = true;
            this.activateRunning = true;
            return true;
        }

        public deactivate(animationType?: AnimationType): boolean {
            if (!this.deactivateAllowed()) {
                return false;
            }
            this.activated = false;
            this.deactivateRunning = true;
            return true;
        }

        public toggle(value?: boolean, animationType?: AnimationType) {
            value ??= !this.activated;
            if (value) {
                this.activate(animationType);
            } else {
                this.deactivate(animationType);
            }
        }
    };
}

/**
 * An Interface for all objects which are placed in front of the main media of a page.
 * All classes which implement this interface (e.g. {@link Clickable}) are also such objects
 */
class InlineObject {
    public readonly data: InlineObjectData;

    private readonly _second: boolean;
    private readonly _html: JQuery;

    constructor(data: InlineObjectData, htmlTag: keyof HTMLElementTagNameMap | JQuery, isClone = false) {
        this.data = data;
        this._second = isClone;
        this._html = typeof htmlTag === "string" ? $(`<${htmlTag}/>`) : htmlTag;
        if (!this._second) {
            // this._html = $(`<${htmlTag}/>`);
            this.html.addClass("inlineObject");

            // by default everything is hidden via display none
            if (!data.hidden) {
                this.html.addClass("show");
            }

            // x and y coordinates
            if (this.data.x !== undefined) {
                this._html.css("left", this.data.x + "%");
            }
            if (this.data.y !== undefined) {
                this._html.css("top", this.data.y + "%");
            }
        }
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

    constructor(data: CustomObjectData, html?: JQuery<HTMLElement>) {
        super(data, html ?? $("#" + data.htmlId), html !== undefined);
        this.html.attr("data-animation", data.animationType);
    }
}

class TextField extends AddressableObject(InlineObject) {
    declare public readonly data: TextFieldData;

    constructor(data: TextFieldData, html?: JQuery<HTMLElement>) {
        super(data, html ?? "div", html !== undefined);

        this.activated = !data.hidden;
        let title: string | JQuery = "";

        if (data.title) {
            title = $("<div>")
                .addClass("text-field-title")
                .text(data.title);
        }
        const content = $("<div>")
            .addClass("text-field-content")
            .text(data.content);

        this.html.addClass("text-field")
            .addClass(data.size)
            .append(title, content);

        // add css classes

        for (let i of data.cssClasses) {
            this.html.addClass(i);
        }

        //animations
        this.html.attr("data-animation", data.animationType);
        this.html.on("animationend", (jEvent) => {
            const event = jEvent.originalEvent as AnimationEvent;
            if (event.animationName === "fade-in-animation") {
                this.activateRunning = false;
            }
            // name must be the same as in tour.scss
            if (event.animationName === "fade-out-animation") {
                this.html.removeClass("show")
                    .removeClass("beforeHide");
                this.deactivateRunning = false;
            }
        });
    }

    public static from(data: TextFieldData): TextField {
        return new TextField(data);
    }

    public override activate() {
        if (!super.activate()) {
            return false;
        }
        this.html.addClass("show");
        return true;
    }

    public deactivate(): boolean {
        if (!super.deactivate()) {
            return false;
        }
        this.html.addClass("beforeHide");
        return true;
    }
}

class Clickable extends InlineObject {
    declare public readonly data: ClickableData;

    constructor(data: ClickableData, html?: JQuery<HTMLElement>) {
        super(data, html ?? "div", html !== undefined);

        if (!this.second) {
            this.html.addClass("clickable")
                .attr("goto", this.data.goto!)//todo redundant
                .append($("<div></div>")
                    .addClass("title")
                    .text(this.data.title))
                .append($("<button></button>")
                    .addClass("icon")
                    .on("click", this.handleClick)
                    .addClass(this.data.icon));
        }
    }

    public static from(data: ClickableData): Clickable {
        return new Clickable(data);
    }

    private handleClick = () => {
        for (let page of pages) {
            if (page.id === this.data.goto) {
                page.activate(this.data.animationType as PageAnimations);
                break;
            }
            let done = false;
            for (let iObject of page.inlineObjects) {
                if (iObject.data.isTextField() && iObject.data.id === this.data.goto) {
                    this.performAction(iObject as TextField);
                    done = true;
                    break;
                }
            }
            if (done) {
                break;
            }
        }
    };

    // @ts-ignore
    private performAction(obj: AddressableObject): void {
        switch (this.data.action) {
            case "activate":
                obj.activate(this.data.animationType);
                break;
            case "deactivate":
                obj.deactivate(this.data.animationType);
                break;
            case "toggle":
                obj.toggle(undefined, this.data.animationType);
                break;
        }
    }
}

window.addEventListener("resize", function () {
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
        i.media.triggerResize();
    }
    adjust_clickables();
});

window.addEventListener("popstate", function () {
    let pgs = $(".page");
    pgs.removeClass("show");
    if (window.location.hash !== "")
        $("#" + idPrefix + window.location.hash.slice(1)).addClass("show");
    else
        pgs.eq(0).addClass("show");
});

// function goTo(pg: string | undefined, animationType: "backward"): void;
// function goTo(pg: string, animationType: PageAnimations): void;
// function goTo(pg: string | undefined, animationType: PageAnimations) {
//     if (finished_last) {
//         finished_last = false;
//
//         let prev = pages.find(v => v.id === $(".page.show").attr("id")!.substring(idPrefix.length))!;
//         let next: Page | undefined;
//         // next === lastest if animationType === backward
//         if (animationType === "backward") {
//             next = pages.find(v => v.id === lastest);
//         } else {
//             next = pages.find(v => v.id === pg!);
//         }
//
//         if (next === undefined) {
//             console.error("Cannot find target:", pg, "Animation:", animationType);
//             return;
//         }
//         //pause video
//         prev.media.pause();
//         next.html.addClass("show");
//         adjust_clickables();
//         lastest = prev.id;
//         if (animationType === "forward") {
//             prev.html.addClass("walk_in_out");
//             next.html.addClass("walk_in_in");
//             setTimeout(function () {
//                 $(".page.activate-forward").removeClass("activate-forward");
//                 $(".page.deactivate-forward").removeClass("show")
//                     .removeClass("deactivate-forward");
//                 finished_last = true;
//             }, animationDuration);
//         } else if (animationType === "backward") {
//             prev.html.addClass("walk_out_out");
//             next.html.addClass("walk_out_in");
//             setTimeout(function () {
//                 $(".page.activate-backward").removeClass("activate-backward");
//                 $(".page.deactivate-backward").removeClass("show")
//                     .removeClass("deactivate-backward");
//                 finished_last = true;
//             }, animationDuration);
//         }
//         window.location.hash = next.id;
//         createLastestClickable(next.clickables.filter(v => v.data.goto === prev.id));
//     }
// }

function adjust_clickables() {
    let clickables = $(".clickable");
    clickables.removeClass("right");
    for (let i = 0; i < clickables.length; i++) {
        if (clickables.eq(i).offset()!.left + clickables.eq(i).outerWidth(true)! > clickables.eq(i).parent().offset()!.left + clickables.eq(i).parent().outerWidth(true)!)
            clickables.eq(i).addClass("right");
    }
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
    let scrollSensitivity = 10;

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
        if ((!isDesktop) && page.media.isImage()) {
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

            // clickable.html.find("button")
            //     .on("click", gotoExists ? () => {
            //         goTo(clickable.data.goto, clickable.data.animationType as "backward");
            //     } : () => {
            //         console.error("Cannot go to next page because '" + clickable.data.goto + "' does not exist");
            //     });
        }

        // let event;
        // if (page.media.isImage() || page.media.isIframe())
        //     event = "load";
        // else if (page.media.isVideo()) {
        //     event = "loadedmetadata";
        // } else {
        //     console.error("cannot determine event type because Media Type is not known (or not implemented)\nContinuing with 'load' as event type, but FIX THIS");
        //     event = "load";
        // }
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
                .append(page.media.html)
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
            page.secondaryImg = page.media.clone();
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
                    if (this.scrollLeft - page.media.html.width()! < scrollSensitivity) {
                        return;
                    }
                    self.scrollLeft(this.scrollLeft - page.media.html.width()!);
                } else if (self.scrollLeft()! < scrollSensitivity) {
                    // if new scroll would trigger this event again
                    if (this.scrollWidth - this.clientWidth - (this.scrollLeft + page.media.html.width()!) < scrollSensitivity) {
                        return;
                    }
                    self.scrollLeft(this.scrollLeft + page.media.html.width()!);
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
function init(pagesJsonPath: string | JsonSchulTourConfigFile) {
    const callback = (json: JsonSchulTourConfigFile) => {
        console.log("done", json);
        const config = SchulTourConfigFile.fromJSON(json);
        createHtml(json.pages);
        let done = false;
        const location = window.location.hash.substring(1);
        // activate the page from the address line
        for (let page of pages) {
            if (page.id === location) {
                page.initialActivate(pages);
                done = true;
                break;
            }
        }

        // activate the page from the config file
        if (!done) {
            for (let page of pages) {
                if (page.id === config.initialPage) {
                    page.initialActivate(pages);
                    done = true;
                    break;
                }
            }
        }
        // page [0] as fallback
        if (!done) {
            pages[0].initialActivate(pages);
        }
    };
    if (typeof pagesJsonPath === "string") {
        $.getJSON(pagesJsonPath, callback);
    } else {
        callback(pagesJsonPath);
    }
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
