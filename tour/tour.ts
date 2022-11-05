// import * as $ from "jquery";
import {
    ClickableData,
    CustomObjectData,
    DataType,
    InlineObjectData,
    MediaData,
    mediaFolder,
    PageData,
    SchulTourConfigFile,
    SourceData,
    TextFieldData,
    uniqueId,
} from "./Data.js";
import {Mutable} from "./tour-dev-tool/utils";
import type {
    AnimationType, InlineObjectType,
    JsonClickable,
    JsonCustomObject,
    JsonInlineObject,
    JsonSchulTourConfigFile,
    JsonTextField,
    LoadingType,
    MediaType,
    PageAnimations,
} from "./types";

let finished_last = true;
const idPrefix = "tour_pg_";
const baustellenFotoUrl = mediaFolder + "/baustelle.png";
let lastest = "";
const isDesktop = window.innerWidth > 768;
const scrollSensitivity = 10;
const devTool = {
    dataTransferTypes: {
        // values MUST be lowercase (because the browser will always lower it which can lead to bugs)
        inlineObject: {
            size: "tour/inline_object/size",
            offset: "tour/inline_object/offset",
            data: "tour/inline_object/data",
            id: "tour/inline_object/id",
        },
        centralPositionMarker: {
            index: "tour/central_position_marker/index",
            position: "tour/central_position_marker/position",
        },
    },
};

/**
 * This class holds the media element for the page. This could be an image, a video, etc. (see {@link MediaType} for more options)<br>
 */
class Media<T extends HTMLImageElement | HTMLVideoElement | HTMLIFrameElement = HTMLImageElement | HTMLVideoElement | HTMLIFrameElement> {
    protected static initialized: boolean = false;

    public readonly data: MediaData;
    public readonly loading: LoadingType;

    // the actual string which is used as src attr of the <img> <video>, etc. tag
    public readonly srcUrl: string;

    protected _src: SourceData;
    // protected initialized: boolean = false;

    private _page?: Page;
    private _type!: MediaType;
    private visibilityObserver: IntersectionObserver;
    private loadingErrorOccurred: boolean = false;

    declare protected readonly _html: JQuery<T>;

    // dev tool
    public handleDrop?: (inlineObjectId: number, inlineObjectData: InlineObjectData) => void;

    protected constructor(data: MediaData, htmlTag: keyof HTMLElementTagNameMap | JQuery<T>) {
        const {source, loading} = Media.computeSourceAndLoading(data);

        this._src = source;
        this.srcUrl = source.url();
        this.loading = loading;
        this._type = source.type;
        this.data = data;
        this._html = typeof htmlTag === "string" ? $(`<${htmlTag}/>`) : htmlTag;

        this.visibilityObserver = new IntersectionObserver(() => {
            this.triggerResize();
        }, {
            root: null,
            threshold: 0,
        });
    }

    /**
     * Computes the source and the loading type depending on the platform of the client (desktop or mobile)
     * @param data
     */
    public static computeSourceAndLoading(data: MediaData): { source: SourceData, loading: LoadingType } {
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
        return {
            source: src,
            loading: loading,
        };
    }

    /**
     * Create a {@link Media} object from a {@link MediaData} object
     * @param data
     */
    public static from(data: MediaData): Media {
        const {source} = Media.computeSourceAndLoading(data);
        switch (source.type) {
            case "img":
                return ImageMedia.from(data);
            case "video":
                return VideoMedia.from(data);
            case "iframe":
                return IframeMedia.from(data);
        }
    }

    /**
     * Here we are doing actions regardless of the media type
     * @private
     */
    protected prepareHTML() {
        // Error logging
        this.html.on("error", () => {
            console.error("Error loading Media", this);
            if (!this.loadingErrorOccurred) {
                this.onLoadingError();
            }
        });

        // add width and height from json
        if (this.src.width && this.src.height) {
            this.html.attr("width", this.src.width);
            this.html.attr("height", this.src.height);
        }

        this.visibilityObserver.observe(this.html[0]);
        this.html.addClass("bg");

        if (Tour.devTool) {
            this.html.on("dragover", (event) => {
                const transferTypes = event.originalEvent!.dataTransfer!.types;
                if (transferTypes.includes(devTool.dataTransferTypes.inlineObject.data)
                    || transferTypes.includes(devTool.dataTransferTypes.centralPositionMarker.index)) {
                    event.preventDefault();
                }
            });

            /**
             * @param type
             * @param coord relative to document
             * @param closestSize size of parent element
             * @param closestOffset offset of parent element (space between document 0 and parent start) (aka. parent coord)
             * @param size the width or height of the inline Object
             */
            const getRelativeCoordinate = (type: InlineObjectType, coord: number, closestSize: number, closestOffset: number, size?: number): number => {
                // Durchmesser in rem
                let iconDurchmesser = 3;
                iconDurchmesser = iconDurchmesser / 2 * parseFloat($(".clickable").css("fontSize"));

                // in px; wie weit das object mit translate nach links verschoben wird bzw. wie sehr wir das ausgleichen müssen
                let translation;
                if (type === "clickable") {
                    translation = iconDurchmesser;
                } else {
                    if (!size) {
                        console.error("Size cannot be undefined or 0 if type != clickable", size);
                    }
                    translation = size! / 2;
                }
                return ((coord - closestOffset + translation) / closestSize) * 100;
            };

            this.html.on("drop", (event) => {
                console.log("drop event");
                event.preventDefault();
                const transferTypes = event.originalEvent!.dataTransfer!.types;
                if (transferTypes.includes(devTool.dataTransferTypes.inlineObject.data)) {
                    const inlineObjectData = InlineObjectData.fromJSON(JSON.parse(
                        event.originalEvent!.dataTransfer!.getData(devTool.dataTransferTypes.inlineObject.data),
                    ) as JsonInlineObject);
                    const inlineObjectId = parseInt(event.originalEvent!.dataTransfer!.getData(devTool.dataTransferTypes.inlineObject.id));
                    const inlineObjectOffset = event.originalEvent!.dataTransfer!.getData(devTool.dataTransferTypes.inlineObject.offset)
                        .split(" ").map(parseFloat);
                    const inlineObjectSize = event.originalEvent!.dataTransfer!.getData(devTool.dataTransferTypes.inlineObject.size)
                        .split(" ").map(parseFloat);

                    let referenceHTML: JQuery;
                    if (inlineObjectData.position === "media") {
                        // inlineObject is placed in bg_container (same size as img)
                        referenceHTML = this.html.closest(".bg_container");
                    } else if (inlineObjectData.position === "page") {
                        // inline Object is placed directly inside page_wrapper (NOT same size as img)
                        referenceHTML = this.html.closest(".page");
                    } else {
                        console.error("Inline object has no / an unknown position property", inlineObjectData.position);
                        return;
                    }
                    this.handleDrop!(inlineObjectId, inlineObjectData.withUpdate({
                        x: getRelativeCoordinate(inlineObjectData.type, event.clientX!, referenceHTML.width()!,
                            referenceHTML.offset()!.left + inlineObjectOffset[0], inlineObjectSize[0]),
                        y: getRelativeCoordinate(inlineObjectData.type, event.clientY!, referenceHTML.height()!,
                            referenceHTML.offset()!.top + inlineObjectOffset[1], inlineObjectSize[1]),
                    }));
                } else if (transferTypes.includes(devTool.dataTransferTypes.centralPositionMarker.index)) {
                    const index = parseInt(event.originalEvent!.dataTransfer!.getData(devTool.dataTransferTypes.centralPositionMarker.index));
                    const referenceHtml = this.html.closest(".bg_container");
                    const absolutePosition = event.clientX! - referenceHtml.offset()!.left;
                    const relativePosition = absolutePosition / this.html.width()!;
                    this.page!.onCentralPositionChange!(relativePosition * 100, index);
                } else {
                    throw new Error("unknown transfer type");
                }
            });
        }
    }

    /**
     * Clones and returns this Media Object (also clones all its events)
     */
    public clone(): this {
        type T1 = this;
        const constructor = (this.constructor as { new(data: MediaData, html?: JQuery<HTMLElement>): T1 });
        return new constructor(this.data, this._html.clone(true));
    }

    // @ts-ignore
    public get page(): Page | undefined {
        return this._page;
    }

    public set page(value: Page) {
        this._page = value;
        this.onPageSet();
    }

    protected onLoadingError() {
        this.loadingErrorOccurred = true;
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
        this.html.attr("width", this.src.width!)
            .attr("height", this.src.height!);
        this.triggerResize();
    }

    protected onPageSet(): void {
        if (this.src.width && this.src.height) {
            this.onSizeKnown();
        }
    }

    /**
     * This method gets called when the media gets visible or when the page is resized<br>
     * {@link SourceData.width}, {@link SourceData.height} and {@link this.page} will available here
     * You can override this method
     * @protected
     */
    protected onResize(): void {
        console.log("on Resize", this.page?.id);
        this.applyRatio();
        this.page!.onShowOrResize();
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
        this._type = MediaData.determineType(value, this.srcUrl);
    }

    /**
     * Toggles classes depending on the ratio of this media and the ratio of the viewport (window)
     * @private
     */
    protected applyRatio() {
        const tourElement = this.html.closest(".schul-tour");
        const screenRatio = tourElement.width()! / tourElement.height()!;
        let mediaRatio = this._src.width! / this._src.height!;
        if (mediaRatio > screenRatio) {
            this.html.closest(".bg_container").addClass("fill-width")
                .removeClass("fill-height");
        } else {
            this.html.closest(".bg_container").addClass("fill-height")
                .removeClass("fill-width");
        }
    }

    public pause(): void {
    }
}

class VideoMedia extends Media<HTMLVideoElement> {
    declare protected _html: JQuery<HTMLVideoElement>;

    constructor(data: MediaData, html?: JQuery<HTMLVideoElement>) {
        super(data, html ?? "video");
        this._html.text("HTML Video is not supported")
            .attr("poster", this.data.poster ?? "")
            .prop("autoplay", this.data.autoplay)
            .prop("loop", this.data.loop)
            .prop("muted", this.data.muted)
            .prop("preload", this.data.preload);

        this.prepareHTML();

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
            .attr("src", this.srcUrl);

        //should be redundant
        if ((this.html.get(0) as HTMLVideoElement).readyState > 0) {
            this.html.trigger("loadedmetadata");
        }
    }

    public static override from(data: MediaData) {
        return new VideoMedia(data);
    }

    protected override onLoadingError(): void {
        super.onLoadingError();

        this.html.attr("poster", baustellenFotoUrl)
            .prop("controls", false);
    }

    public override pause() {
        this._html[0].pause();
    }
}

class ImageMedia extends Media<HTMLImageElement> {
    declare public readonly loading: LoadingType;

    constructor(data: MediaData, htmlTag?: JQuery<HTMLImageElement>) {
        super(data, htmlTag ?? "img");
        this._html
            .attr("alt", "Could not load Image :(")
            .attr("loading", this.loading)
            .attr("fetchPriority", this.data.fetchPriority);

        this.prepareHTML();

        this.html.on("load", () => {
            console.log(`Media Loaded: ${this.srcUrl}`);
            this._src = this.src.withUpdate({
                width: this.html[0].naturalWidth,
                height: this.html[0].naturalHeight,
            });
            this.onSizeKnown();
        });

        this.html.attr("src", this.srcUrl);
    }

    public static override from(data: MediaData) {
        return new ImageMedia(data);
    }

    protected override onLoadingError(): void {
        super.onLoadingError();

        this.html.attr("src", baustellenFotoUrl);
    }

    protected override onSizeKnown() {
        super.onSizeKnown();
    }

    protected override onResize(pageElements?: MutationRecord[]) {
        super.onResize();
        let panoramaAdded = false;

        //remove panorama if screen is big enough
        if (this.page!.is_panorama && this.src.width! <= this.html.closest(".schul-tour").width()!) {
            this.page!.is_panorama = false;
            this.page!.html.removeClass("pg_panorama");
        }
        // add panorama if screen is too small
        else if (!this.page!.is_panorama && this.src.width! > this.html.closest(".schul-tour").width()!) {
            this.page!.is_panorama = true;
            this.page!.html.addClass("pg_panorama");
            panoramaAdded = true;
        }
        console.log("onVisible", this.page!.id, this.page!.is_panorama, this.page!.is_360);

        // // initial direction
        // // only apply this when the page was NOT panorama before
        // if (panoramaAdded || !this.initialized) {
        //     this.applyInitialDirection();
        //     this.initialized = true;
        // }

        // initial direction
        // only apply this when the page was NOT panorama before
        if (panoramaAdded || !Tour.initialized) {
            this.applyInitialDirection();
            Tour.initialized = true;
        }

        adjust_clickables();
    }

    public applyInitialDirection() {
        if (this.page?.is_panorama) {
            const pgWrapper = this.html.closest(".pg_wrapper")[0];
            const mediaWidth = this.html.width()!;

            if (Tour.devTool && this.page?.devToolScrollPercent) {
                pgWrapper.scrollTo({
                    left: this.page.devToolScrollPercent * 0.01 * mediaWidth,
                });
                return;
            }

            let scrollStart = this.page.data.initialScroll.start;
            if (scrollStart != null) {
                // if (this.page.is_360 && scrollStart === 0) {
                //     scrollStart = 100;
                // }

                this.page.scroll(scrollStart);
                // pgWrapper.scrollTo({
                //     left: scrollStart * 0.01 * mediaWidth,
                // });
            }

            setTimeout(() => {
                let scrollDestination = this.page!.data.initialScroll.destination;
                if (scrollDestination != null) {
                    // scroll 0 is not good in 360 because then the user cannot scroll to left and
                    // the scroll event cannot be triggered
                    if (this.page!.is_360 && scrollDestination === 0) {
                        scrollDestination = 100;
                    }
                    this.page!.scroll(scrollDestination, true);
                    // pgWrapper.scrollTo({
                    //     left: scrollDestination * 0.01 * mediaWidth,
                    //     behavior: "smooth",
                    // });
                } else if (this.page!.centralPositionAbsolute != null) {
                    this.page!.scrollAbsolute(this.page!.centralPositionAbsolute, true);
                    // pgWrapper.scrollTo({
                    //     left: this.page!.centralPositionAbsolute,
                    //     behavior: "smooth",
                    // });
                }
            }, 500);

            // let initialDirection = (this.page!.initial_direction / 100) * this.html.width()!;
            // console.log("init dir", this.page!.initial_direction, initialDirection);
            // if (this.page!.is_360 && initialDirection === 0) {
            //     console.log("init dir ===", initialDirection, this.html.width());
            //     initialDirection = this.html.width()!;
            // }
            // // if init dir is too high
            // else if (this.page!.is_360 && initialDirection > pgWrapper[0].scrollWidth) {
            //     // = init dir = n * width of img
            //     // if init dir === 0
            //     initialDirection = pgWrapper[0].scrollWidth % this.html.width()! || this.html.width()!;
            // }
            // pgWrapper.scrollLeft(initialDirection);
        }
    }
}

class IframeMedia extends Media<HTMLIFrameElement> {
    declare public readonly loading: LoadingType;

    constructor(data: MediaData, htmlTag?: JQuery<HTMLIFrameElement>) {
        super(data, htmlTag ?? "iframe");
        this._html.addClass("bg")
            .attr("loading", this.loading)
            .attr("fetchPriority", this.data.fetchPriority);

        this.prepareHTML();

        this.html.on("load", () => {
            console.log("Iframe loaded", this);
        });

        // Add src after adding events so that they can get triggered
        this.html.attr("src", this.srcUrl);
    }

    public static override from(data: MediaData) {
        return new IframeMedia(data);
    }

    protected override onLoadingError(): void {
        super.onLoadingError();

        //the plain html text
        this.html.attr("srcdoc",
            `<!DOCTYPE html>
            <html lang="de">
                <head> 
                   <meta charset="UTF-8"> 
                   <title>Baustelle</title>
               </head>
               <body>
                   <img src="${baustellenFotoUrl}" alt="Baustelle :)" style="width: 100%;height: 100%;">
               </body>
           </html>`,
        );
    }
}

class SchulTour {
    public readonly data: SchulTourConfigFile;

    public readonly html: JQuery<HTMLDivElement>;
    public readonly pages: Page[];

    constructor(data: SchulTourConfigFile) {
        this.data = data;
        this.pages = [];
        this.html = $("<div/>")
            .addClass("schul-tour")
            .attr("data-color-theme", data.colorTheme)
            .attr("data-tour-mode", data.mode)
            .toggleClass("fullscreen", data.fullscreen) as JQuery<HTMLDivElement>;

        for (let pageData of data.pages) {
            let page = Page.from(pageData, this.data);

            this.pages.push(page);
            this.html.append(page.html);
        }
    }

    /**
     * Appends this element to the html body and sets the global {@link Tour.pages} object<br>
     * Do <b>NOT</b> call this method more than <b>ONE</b> time
     */
    public init(initPage?: string) {
        Tour.pages = this.pages;
        this.html.appendTo(document.body);

        let startPage: Page | undefined = undefined;
        // activate the page from the address line (initPage param)
        for (let page of this.pages) {
            if (page.id === initPage) {
                startPage = page;
                break;
            }
        }

        // activate the page from the config file
        if (!startPage) {
            for (let page of this.pages) {
                if (page.id === this.data.initialPage) {
                    startPage = page;
                    break;
                }
            }
        }

        // page [0] as fallback
        if (!startPage) {
            startPage = this.pages[0];
        }
        startPage.initialActivate(this.pages);
        Tour.startPage = startPage;

        adjust_clickables();
    }

    public static from(data: SchulTourConfigFile): SchulTour {
        return new SchulTour(data);
    }
}

class Page extends AddressableObject() {
    declare public readonly data: PageData;

    public readonly config: SchulTourConfigFile;

    public readonly id: string;
    public readonly media: Media;
    public secondaryImg?: Media;
    public is_panorama = false;
    public is_360 = false;
    // the position (middle of page) which is our current absolute central position
    public centralPositionAbsolute?: number | null = undefined;
    public readonly inlineObjects: InlineObject[];
    public readonly animationType: PageAnimations;
    public readonly clickableHints: readonly ClickableHint[];

    declare public readonly html: JQuery<HTMLDivElement>;

    // dev tool
    public handleUpdate?: (page: Partial<DataType<PageData>>) => void;
    public handleInlineObjectEditClick?: (index: number, inlineObject: InlineObjectData) => void;
    public onCurrentPageChange?: (pageId: string) => void;
    public onScroll?: (scrollPercent: number) => void;
    public devToolScrollPercent?: number;
    // central positions edit mode
    public onCentralPositionsSelect?: (index: number) => void;
    public onCentralPositionChange?: (position: number, index: number) => void;

    /**
     * @param data
     * @param media
     * @param inlineObjects
     * @param scrollPercent dev tool only
     * @param config
     */
    constructor(
        {
            data,
            media,
            inlineObjects,
            scrollPercent,
        }: { data: PageData, media: Media, inlineObjects: InlineObject[], scrollPercent?: number },
        config: SchulTourConfigFile) {
        super();
        this.data = data;
        this.config = config;

        this.id = data.id;
        this.media = media;
        this.media.page = this;
        this.is_360 = data.is360;
        this.is_panorama = data.isPanorama;
        this.animationType = data.animationType;
        this.inlineObjects = inlineObjects.slice();

        this.html = $("<div></div>");
        // this.html[0].addEventListener("animationend", this.handleAnimationEnd);
        this.prepareHTML();

        if ((!isDesktop) && this.media.isImage()) {
            this.is_panorama = true;
        }

        if (this.config.includeClickableHints) {
            // clickables relative to media get a clickable-hint
            this.clickableHints = this.inlineObjects
                .filter((v): v is Clickable => v.data.position === "media" && v.data.isClickable())
                .map(v => new ClickableHint(v));
        } else {
            this.clickableHints = [];
        }

        this.html
            .addClass("page")
            .attr("id", idPrefix + this.id)
            .toggleClass("pg_panorama", this.is_panorama)
            .toggleClass("deg360", this.is_360)
            .append(
                $("<div></div>")
                    .addClass("pg_wrapper"))
            .append(this.inlineObjects
                .filter(v => v.data.position === "page")
                .map(v => v.html))
            .append(this.clickableHints.map(v => v.html));

        if (this.config.includeClickableHints) {
            // register scroll event
            this.html.find(".pg_wrapper").on("scroll", () => {
                for (let hint of this.clickableHints) {
                    // we want it asynchronous to prevent performance loss
                    setTimeout(() => {
                        hint.startComputingPosition();
                    });
                }
            });
        }

        //first img
        this.html.children(".pg_wrapper")
            .append($("<div></div>")
                .addClass("bg_container")
                .append(this.media.html)
                .append(this.inlineObjects
                    .filter(v => v.data.position === "media" && (!v.cloned))
                    .map(v => v.html)));

        if (this.is_360) {
            console.log("is_360");
            //add second clickables for second img in 360deg IMGs
            this.addInlineObjects(...this.clickables.filter(v => v.data.position === "media" && (!v.cloned)).map(v => v.clone()));
            this.secondaryImg = this.media.clone();
            //second img
            let bgContainer1 = $("<div></div>")
                .addClass("bg_container")
                .append(this.secondaryImg.html)
                .append(this.inlineObjects
                    .filter(v => v.data.position === "media" && v.cloned)
                    .map(v => v.html));

            this.html.children(".pg_wrapper")
                .append(bgContainer1);

            this.html.find(".pg_wrapper").on("scroll", () => {
                const pgWrapper = this.html.find(".pg_wrapper");
                const pgWrapperElement = pgWrapper[0];
                if (pgWrapperElement.scrollWidth - pgWrapperElement.clientWidth - pgWrapperElement.scrollLeft < scrollSensitivity) {
                    // if new scroll would trigger this event again
                    if (pgWrapperElement.scrollLeft - this.media.html.width()! < scrollSensitivity) {
                        return;
                    }
                    pgWrapper.scrollLeft(pgWrapperElement.scrollLeft - this.media.html.width()!);
                } else if (pgWrapperElement.scrollLeft! < scrollSensitivity) {
                    // if new scroll would trigger this event again
                    if (pgWrapperElement.scrollWidth - pgWrapperElement.clientWidth - (pgWrapperElement.scrollLeft + this.media.html.width()!) < scrollSensitivity) {
                        return;
                    }
                    pgWrapper.scrollLeft(pgWrapperElement.scrollLeft + this.media.html.width()!);
                }
            });
        }

        if (Tour.devTool) {
            this.devToolScrollPercent = scrollPercent;
            const wrapper = this.html.find(".pg_wrapper");

            // if (scrollPercent) {
            //     this.initial_direction = scrollPercent;
            // }
            this.media.handleDrop = (inlineObjectId, inlineObjectData) => {
                const newInlineObjects: InlineObject[] = this.inlineObjects.filter(v => !v.cloned);
                const newInlineObjectsData = newInlineObjects.map(v => v.data);
                newInlineObjectsData[newInlineObjects.findIndex(v => uniqueId(v.html) === inlineObjectId)] = inlineObjectData;
                let pageData = {
                    inlineObjects: newInlineObjectsData,
                };
                this.handleUpdate!(pageData);
                this.inlineObjects.filter(v => uniqueId(v.originHtml) === inlineObjectId)
                    .forEach(v => v.html
                        .css("left", inlineObjectData.x + "%")
                        .css("top", inlineObjectData.y + "%"));
            };
            for (let i of this.inlineObjects) {
                i.handleEditClick = (inlineObjectId, inlineObjectData) => {
                    const index = this.inlineObjects.findIndex(value => uniqueId(value.html) === inlineObjectId);
                    this.handleInlineObjectEditClick!(index, inlineObjectData);
                };
            }

            wrapper.on("scroll", (event) => {
                let scrollLeft = event.target.scrollLeft;
                if (scrollLeft > this.media.html.width()!) {
                    scrollLeft = scrollLeft - this.media.html.width()!;
                }
                // console.log("original scroll event", scrollLeft, this.media.html.width()!);
                this.onScroll?.(scrollLeft / this.media.html.width()!);
            });

            // central-positions-edit-mode
            for (let bg_container of wrapper.find(".bg_container")) {
                let index = 0;
                for (let position of this.data.centralPositions) {
                    const centralPositionMarker = new CentralPositionMarker(position, index);
                    centralPositionMarker.onCentralPositionsSelect = (index: number) => {
                        this.onCentralPositionsSelect!(index);
                    };
                    centralPositionMarker.html.appendTo(bg_container);
                    // const index = i;
                    // $("<div/>")
                    //     .addClass("central-position-marker")
                    //     .css("left", `${position}%`)
                    //     .attr('index', index)
                    //     .prop('draggable', true)
                    //     .on("click", () => {
                    //         this.html.find(`.central-position-marker`).removeClass("selected")
                    //             .filter(`.central-position-marker[index=${index}]`).addClass("selected");
                    //         this.onCentralPositionsSelect!(index);
                    //     })
                    //     .appendTo(bg_container);
                    index++;
                }
            }
        }
    }

    /**
     * Creates a new {@link Page} instance
     * @param data
     * @param config
     * @param scrollPercent dev tool only
     */
    public static from(data: PageData, config: SchulTourConfigFile, scrollPercent?: number): Page {
        return new Page({
            data: data,
            media: Media.from(data.media),
            inlineObjects: data.inlineObjects.map(InlineObject.from),
            scrollPercent: scrollPercent,
        }, config);
    }

    /**
     * computes and sets {@link this.centralPositionAbsolute}
     */
    public computeCentralPosition() {
        const tourWidth = this.html.closest(".schul-tour").width()!;
        const imgWidth = this.media.html.width()!;
        // convert to absolute positions
        const positions: number[] = this.data.centralPositions.map(v => v * 0.01 * imgWidth);

        let res = {
            scrollLeft: 0,
            posCount: 0,
        };

        for (let pos of positions) {
            // range where positions can be
            const start = pos;
            const end = start + tourWidth;

            const matchingPositions = positions.filter(v =>
                // pos between start and end
                (v >= start && v <= end) ||
                // 360 deg => pos can also be lower than end - imgWidth, because that part of the img is also showed
                (this.is_360 && v <= end - imgWidth),
            );
            if (matchingPositions.length > res.posCount) {
                // the distance between the last position and the end
                const paddingEnd = end - matchingPositions.reduce((a, b) => a > b ? a : b, 0)!;
                res = {
                    // split the paddingEnd to end and start
                    scrollLeft: start - paddingEnd / 2,
                    posCount: matchingPositions.length,
                };
            }
        }
        if (res.posCount) {
            if (this.is_360) {
                if (res.scrollLeft <= 0) {
                    res.scrollLeft += imgWidth;
                } else if (res.scrollLeft > imgWidth) {
                    res.scrollLeft -= imgWidth;
                }
            } else {
                if (res.scrollLeft < 0) {
                    res.scrollLeft = 0;
                }
            }
            this.centralPositionAbsolute = res.scrollLeft + tourWidth / 2;
        } else {
            this.centralPositionAbsolute = null;
        }
    }

    public onShowOrResize() {
        this.computeCentralPosition();
    }

    /**
     * This method scrolls to a given point (only if media is an img and panorama is enabled)
     * @param relativePosition the position we want to scroll to <b>in percent</b>
     * @param smooth
     */
    public scroll(relativePosition: number, smooth: boolean = false) {
        let absolutePosition = relativePosition * 0.01 * this.media.html.width()!;
        return this.scrollAbsolute(absolutePosition, smooth);
    }

    /**
     * This method scrolls to a given point (only if media is an img and panorama is enabled)
     * @param absolutePosition the position we want to scroll to <b>in pixel</b>
     * @param smooth
     */
    public scrollAbsolute(absolutePosition: number, smooth: boolean = false) {
        if (!this.is_panorama) {
            console.error("cannot scroll on non panorama pages");
            return;
        }
        const wrapper = this.html.find(".pg_wrapper")[0];
        // scrollWidth = this.media.html.width()!;

        // minus half screen width = scroll element to middle of screen
        const halfScreen = wrapper.closest(".schul-tour")!.clientWidth / 2;
        const imgWidth = this.media.html.width()!;
        console.log("scroll meth", halfScreen);

        if (this.is_360) {
            if (absolutePosition < scrollSensitivity) {
                absolutePosition += imgWidth;
            } else if (absolutePosition > imgWidth + scrollSensitivity) {
                absolutePosition -= imgWidth;
            }
        }

        wrapper.scrollTo({
            left: absolutePosition - halfScreen,
            behavior: smooth ? "smooth" : "auto",
        });
    }

    /**
     * Returns the current scroll position in percent. <br>
     * The returned position is the position in the middle of the screen.<br>
     * Opposite to {@link scroll}<br>
     * This is used by the dev tool.<br>
     */
    public getCurrentScroll(): number {
        if (!this.is_panorama) {
            console.error("cannot get current scroll of non panorama page");
            return 0;
        }

        const wrapper = this.html.find(".pg_wrapper")[0];
        const halfScreen = wrapper.closest(".schul-tour")!.clientWidth / 2;
        const scrollWidth = this.media.html.width()!;
        let absScroll = wrapper.scrollLeft;

        if (absScroll > scrollWidth) {
            absScroll -= scrollWidth;
        }

        return (Math.min(absScroll + halfScreen, scrollWidth) / scrollWidth) * 100;
    }

    // event handler when the animation has ended
    protected override handleAnimationEnd(event: AnimationEvent): boolean {
        if (!super.handleAnimationEnd(event)) {
            return false;
        }
        // if (event.target !== this.html[0]) {
        //     return;
        // }
        //
        // // activation
        // if (event.animationName.startsWith("activate")) {
        //     this.html
        //         .removeClass("activate-forward")
        //         .removeClass("activate-backward");
        //     this.activateRunning = false;
        //     // finished last only true if (de-) activation has finished on all pages
        //     finished_last = Tour.pages.map(page => !page.activateRunning && !page.deactivateRunning)
        //         .reduce((p, c) => p && c);
        // }
        // // deactivation
        // if (event.animationName.startsWith("deactivate")) {
        //     this.html
        //         .removeClass("show")
        //         .removeClass("deactivate-forward")
        //         .removeClass("deactivate-backward");
        //     this.deactivateRunning = false;
        //     // finished last only true if (de-) activation has finished on all pages
        //     finished_last = Tour.pages.map(page => !page.activateRunning && !page.deactivateRunning)
        //         .reduce((p, c) => p && c);
        // }

        // finished last only true if (de-) activation has finished on all pages
        finished_last = Tour.pages.map(page => !page.activateRunning && !page.deactivateRunning)
            .reduce((p, c) => p && c);

        if (this.activated) {
            // const wrapper = this.html.find(".pg_wrapper")[0];
            setTimeout(() => {
                if (this.centralPositionAbsolute != null) {
                    this.scrollAbsolute(this.centralPositionAbsolute, true);
                    //     wrapper.scrollTo({
                    //         left: this.centralPositionAbsolute,
                    //         behavior: "smooth",
                    //     });
                }
                // this.scroll(this.data.centralPositions, true);
                // wrapper.scrollTo({
                //     left: this.data.initialDirection * 0.01 * this.html.width()!,
                //     behavior: "smooth",
                // });
            }, 500);
        }

        return true;
    };

    protected override activateAllowed(): boolean {
        return finished_last && !this.activated && !this.activateRunning;
    }

    public override activate(animationType?: PageAnimations, options?: { destinationScroll?: number }): boolean {
        if (!super.activate(animationType)) {
            return false;
        }
        finished_last = false;
        let prevPage: Page;

        // this.html.addClass("show");
        adjust_clickables();

        // get prev page
        for (let page of Tour.pages) {
            if (page.activated && page.id !== this.id) {
                prevPage = page;
                break;
            }
        }

        // activate / show this page
        // switch (animationType) {
        //     case "forward":
        //         this.html.addClass("activate-forward");
        //         break;
        //     case "backward":
        //         this.html.addClass("activate-backward");
        //         break;
        // }
        // deactivate / start hide animation on prev page
        prevPage!.deactivate(animationType ?? this.data.animationType);

        // scroll instantly (even before the animation has finished) to the position passed form the clickable
        if (options?.destinationScroll !== undefined) {
            console.log("destinationScroll:", options.destinationScroll);
            this.scroll(options.destinationScroll);
        }

        window.location.hash = this.id;
        createLatestClickable(this.clickables.filter(v => v.data.goto === prevPage.id));
        this.onCurrentPageChange?.(this.id);

        return true;
    }

    public override deactivate(animationType?: AnimationType): boolean {
        if (!super.deactivate(animationType)) {
            return false;
        }
        this.media.pause();
        lastest = this.id;
        // switch (animationType) {
        //     case "forward":
        //         this.html.addClass("deactivate-forward");
        //         break;
        //     case "backward":
        //         this.html.addClass("deactivate-backward");
        //         break;
        //     case undefined:
        //         this.html.removeClass("show");
        //         this.deactivateRunning = false;
        // }

        // finished last only true if (de-) activation has finished on all pages
        finished_last = Tour.pages.map(page => !page.activateRunning && !page.deactivateRunning)
            .reduce((p, c) => p && c);
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

    /**
     * Activate (show) this page immediately (without animations etc.)
     * This should be used only 1 time at the beginning
     * @param pages
     */
    public initialActivate(pages: readonly Page[]): void {
        this.activated = true;
        this.html.addClass("show");
        Tour.initialized = false;

        // set lastest to any page with a matching clickable
        // backward animations need the lastest variable, otherwise they won't work
        for (let page of pages) {
            if (page.id === this.id) {
                continue;
            }
            page.deactivate();
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
        createLatestClickable(this.clickables.filter(value => value.data.goto === lastest));
    }

    /**
     * Dev tool
     */
    public get centralPositionsEditMode() {
        return this.html.hasClass("central-position-edit-mode");
    }

    /**
     * Dev tool
     * @param value
     */
    public set centralPositionsEditMode(value: boolean) {
        this.html.toggleClass("central-position-edit-mode", value);
    }

    // public get data(): PageData {
    //     return new PageData({
    //         id: this.id,
    //         media: this.media.data,
    //         inlineObjects: this.inlineObjects.map(v => v.data),
    //         is360: this.is_360,
    //         isPanorama: this.is_panorama,
    //         initialDirection: this.initial_direction,
    //         animationType: this.animationType,
    //     });
    // }
}

class CentralPositionMarker {
    public readonly html: JQuery;
    public readonly index: number;
    public readonly position: number;
    public onCentralPositionsSelect!: (index: number) => void;

    constructor(position: number, index: number) {
        this.position = position;
        this.index = index;
        this.html = $("<div/>")
            .addClass("central-position-marker")
            .css("left", `${position}%`)
            .attr("index", index)
            .prop("draggable", true)
            .on("click", () => {
                this.html.closest(".page").find(`.central-position-marker`).removeClass("selected")
                    .filter(`.central-position-marker[index=${index}]`).addClass("selected");
                this.onCentralPositionsSelect!(index);
            })
            .on("dragstart", (event) => {
                event.originalEvent!.dataTransfer!.dropEffect = "move";
                event.originalEvent!.dataTransfer!.setData(devTool.dataTransferTypes.centralPositionMarker.index, String(this.index));
                event.originalEvent!.dataTransfer!.setData(devTool.dataTransferTypes.centralPositionMarker.position, String(this.position));
            });
    }
}

function AddressableObject<T extends { new(...args: any[]): {} }>(baseClass?: T) {
    if (baseClass === undefined) {
        baseClass = class PlaceHolder {
        } as T;
    }

    class AddressableObject extends baseClass {
        declare public readonly html: JQuery;
        declare public readonly data: { animationType: AnimationType };

        public activated: boolean = false;
        protected activateRunning = false;
        protected deactivateRunning = false;

        protected prepareHTML() {
            this.html.addClass("addressable");
            //animations
            this.html.attr("data-tour-animation", this.data.animationType);
            this.html[0].addEventListener("animationend", (event) => this.handleAnimationEnd(event));
        }

        protected handleAnimationEnd(event: AnimationEvent): boolean {
            // we do not want to bubble up
            if (event.target !== this.html[0]) {
                return false;
            }

            console.log("animationend textfield", event.animationName);
            if (this.html.attr("data-tour-animation-onetime") !== undefined) {
                this.html.removeAttr("data-tour-animation-onetime");
            }
            if (event.animationName.startsWith("activate")) {
                this.html.removeClass("before-show");
                this.activateRunning = false;
            }
            // name must be the same as in tour.scss
            else if (event.animationName.startsWith("deactivate")) {
                console.log(this.html);
                this.html.removeClass("before-hide")
                    .removeClass("show");
                this.deactivateRunning = false;
            }
            return true;
        };

        protected activateAllowed(): boolean {
            return !this.activated && !this.activateRunning && !this.deactivateRunning;
        }

        protected deactivateAllowed(): boolean {
            return this.activated && !this.deactivateRunning && !this.activateRunning;
        }

        public activate(animationType?: AnimationType, options?: {}): boolean {
            if (!this.activateAllowed()) {
                return false;
            }
            this.activated = true;
            this.activateRunning = true;

            if (animationType !== undefined && animationType !== this.data.animationType) {
                this.html.attr("data-tour-animation-onetime", animationType);
            }

            this.html
                .addClass("show")
                .addClass("before-show");

            return true;
        }

        public deactivate(animationType?: AnimationType, options?: {}): boolean {
            if (!this.deactivateAllowed()) {
                return false;
            }
            this.activated = false;
            this.deactivateRunning = true;

            if (animationType !== undefined && animationType !== this.data.animationType) {
                this.html.attr("data-tour-animation-onetime", animationType);
            }

            this.html
                .addClass("before-hide");
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
    }

    return AddressableObject;
}

/**
 * An Interface for all objects which are placed in front of the main media of a page.
 * All classes which implement this interface (e.g. {@link Clickable}) are also such objects
 */
class InlineObject {
    public readonly data: InlineObjectData;

    private readonly _cloned: boolean;
    // holds the origin inlineObject html
    // if this._cloned == true, it holds the html it was cloned from
    // if this._cloned == false, it holds the same value as this._html
    public readonly originHtml: JQuery;
    private readonly _html: JQuery;

    // dev tool
    public handleEditClick?: (inlineObjectId: number, inlineObject: InlineObjectData) => void;

    constructor(data: InlineObjectData, htmlTag: JQuery, isClone: true);
    constructor(data: InlineObjectData, htmlTag: keyof HTMLElementTagNameMap | JQuery, isClone: boolean);
    constructor(data: InlineObjectData, htmlTag: keyof HTMLElementTagNameMap | JQuery, isClone = false) {
        this.data = data;
        this._cloned = isClone;

        if (typeof htmlTag === "string") {
            this._html = $(`<${htmlTag}/>`);
            this.originHtml = this._html;
        } else {
            this.originHtml = htmlTag;
            if (isClone) {
                this._html = htmlTag.clone(true);
            } else {
                this._html = htmlTag;
            }
        }
        if (!this._cloned) {
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

            if (Tour.devTool) {
                this.html
                    .prop("draggable", true);

                this.html.on("dragstart", (event) => {
                    console.log("dragstart");
                    event.originalEvent!.dataTransfer!.dropEffect = "move";
                    event.originalEvent!.dataTransfer!.setData(devTool.dataTransferTypes.inlineObject.data, JSON.stringify(this.data));
                    event.originalEvent!.dataTransfer!.setData(devTool.dataTransferTypes.inlineObject.id, String(uniqueId(this.originHtml)));
                    event.originalEvent!.dataTransfer!.setData(devTool.dataTransferTypes.inlineObject.offset,
                        [event.clientX! - this.html.offset()!.left, event.clientY! - this.html.offset()!.top].join(" "));
                    event.originalEvent!.dataTransfer!.setData(devTool.dataTransferTypes.inlineObject.size,
                        [this.html.outerWidth(), this.html.outerHeight()].join(" "));
                    console.log("IO Size", this.html.outerWidth(), this.html.outerHeight());
                });

                // edit icon (material icons required)
                this.html.append($("<div/>")
                    .text("edit")
                    .addClass("material-icons dev-tool-edit-icon")
                    .on("click", () => {
                        this.handleEditClick!(uniqueId(this.originHtml), this.data);
                    }));
            }
        }
    }

    /**
     * Clones and returns this inline Object (also clones all its events)
     */
    public clone(): this {
        type T = this;
        const constructor = (this.constructor as { new(data: InlineObjectData, html?: JQuery<HTMLElement>): T });
        return new constructor(this.data, this.html);
        // return new constructor(this.data, this._html.clone(true));
    }

    public get html(): JQuery {
        return this._html;
    }

    public get cloned(): boolean {
        return this._cloned;
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

        this.prepareHTML();
        //animations
        // this.html.attr("data-tour-animation", data.animationType);
        // this.html.on("animationend", (jEvent) => {
        //     const event = jEvent.originalEvent as AnimationEvent;
        //     console.log("animationend textfield", event.animationName);
        //     if (this.html.attr("data-tour-animation-onetime") !== undefined) {
        //         this.html.removeAttr("data-tour-animation-onetime");
        //     }
        //     if (event.animationName.startsWith("activate")) {
        //         this.html.removeClass("before-show");
        //         this.activateRunning = false;
        //     }
        //     // name must be the same as in tour.scss
        //     else if (event.animationName.startsWith("deactivate")) {
        //         console.log(this.html);
        //         this.html.removeClass("before-hide")
        //             .removeClass("show");
        //         this.deactivateRunning = false;
        //     }
        // });
    }

    public static override from(data: TextFieldData): TextField {
        return new TextField(data);
    }

    // public override activate(animationType?: AnimationType) {
    //     if (!super.activate()) {
    //         return false;
    //     }
    //     // if (animationType !== undefined) {
    //     //     this.html.attr("data-tour-animation-onetime", animationType);
    //     // }
    //     //
    //     // this.html
    //     //     .addClass("show")
    //     //     .addClass("before-show");
    //     return true;
    // }
    //
    // public deactivate(animationType?: AnimationType): boolean {
    //     if (!super.deactivate()) {
    //         return false;
    //     }
    //     // if (animationType !== undefined) {
    //     //     this.html.attr("data-tour-animation-onetime", animationType);
    //     // }
    //     // this.html.addClass("before-hide");
    //     return true;
    // }
}

class Clickable extends InlineObject {
    declare public readonly data: ClickableData;
    // the absolute scroll position on the goto target
    public readonly destinationScroll: number | undefined;

    constructor(data: ClickableData, html?: JQuery<HTMLElement>) {
        super(data, html ?? "div", html !== undefined);

        if (!this.cloned) {
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

    public static override from(data: ClickableData): Clickable {
        return new Clickable(data);
    }

    public computeDestinationPosition() {
        if (this.data.targetType !== "page") {
            return;
        }

        for (let destinationPage of Tour.pages) {
            // clickable addresses a page obj
            if (destinationPage.id === this.data.goto) {
                // the position on the next page where the user will arrive
                let destinationScroll: number | "auto" | undefined = this.data.destinationScroll ?? "auto";

                // we do not need to compute anything on non panorama pages
                if (!destinationPage.is_panorama) {
                    destinationScroll = undefined;
                }
                // if destinationScroll is not explicitly set, compute it
                else if (destinationScroll === "auto") {
                    const currentPage = Tour.pages.find(v => v.activated)!;
                    // the clickable that is the opposite of this clickable
                    const clickable = destinationPage.data.inlineObjects.find(v => v.isClickable() && v.goto === currentPage.id);
                    // console.log("dest scroll clickable", destinationScroll, clickable);
                    const pictureWidthUntilRepeat = destinationPage.data.secondBeginning;
                    if (clickable) {
                        switch (this.data.animationType) {
                            case "forward":
                                // we take the position of the clickable (in percent)
                                // then we add 50 to it to get the position one would look at when coming from that clickable
                                destinationScroll = clickable.x + pictureWidthUntilRepeat / 2;
                                break;
                            case "backward":
                                destinationScroll = clickable.x;
                                break;
                            case "fade":
                            case "none":
                                destinationScroll = undefined;
                                break;
                        }
                        if (destinationScroll !== undefined && destinationScroll > pictureWidthUntilRepeat) {
                            destinationScroll -= pictureWidthUntilRepeat;
                        }
                    } else {
                        destinationScroll = undefined;
                    }
                }
                (this.destinationScroll as Mutable<typeof this.destinationScroll>) = destinationScroll;
                break;
            }
        }
    }

    private handleClick = () => {
        for (let destinationPage of Tour.pages) {
            // clickable addresses a page obj
            if (destinationPage.id === this.data.goto) {
                // the position on the next page where the user will arrive
                let destinationScroll: number | "auto" | undefined = this.data.destinationScroll ?? "auto";

                // we do not need to compute anything on non panorama pages
                if (!destinationPage.is_panorama) {
                    destinationScroll = undefined;
                }
                // if destinationScroll is not explicitly set, compute it
                else if (destinationScroll === "auto") {
                    const currentPage = Tour.pages.find(v => v.activated)!;
                    // the clickable that is the opposite of this clickable
                    const clickable = destinationPage.data.inlineObjects.find(v => v.isClickable() && v.goto === currentPage.id);
                    // console.log("dest scroll clickable", destinationScroll, clickable);
                    const pictureWidthUntilRepeat = destinationPage.data.secondBeginning;
                    if (clickable) {
                        switch (this.data.animationType) {
                            case "forward":
                                // we take the position of the clickable (in percent)
                                // then we add 50 to it to get the position one would look at when coming from that clickable
                                destinationScroll = clickable.x + pictureWidthUntilRepeat / 2;
                                break;
                            case "backward":
                                destinationScroll = clickable.x;
                                break;
                            case "fade":
                            case "none":
                                destinationScroll = undefined;
                                break;
                        }
                        if (destinationScroll !== undefined && destinationScroll > pictureWidthUntilRepeat) {
                            destinationScroll -= pictureWidthUntilRepeat;
                        }
                    } else {
                        destinationScroll = undefined;
                    }
                }
                console.assert(destinationScroll === this.destinationScroll, "destination scroll not equal", destinationScroll, this.destinationScroll);

                destinationPage.activate(this.data.animationType, {destinationScroll: destinationScroll});
                break;
            }
            let done = false;
            // clickable addresses a text-field
            for (let iObject of destinationPage.inlineObjects) {
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

    /**
     * This is called when the user clicks this clickable<br>
     * Currently only applies to text-fields!
     * @param destinationObj the {@link TextField} whose id matches the goto of this clickable
     * @private
     */
    private performAction(destinationObj: TextField): void {
        switch (this.data.action) {
            case "activate":
                destinationObj.activate(this.data.animationType);
                break;
            case "deactivate":
                destinationObj.deactivate(this.data.animationType);
                break;
            case "toggle":
                destinationObj.toggle(undefined, this.data.animationType);
                break;
        }
    }
}

type Position = {
    x: number,
    y: number,
}

/**
 * This class represents the small hints, that are displayed at the border of the screen,
 * when a {@link Clickable} is not in the viewport (because of scroll)<br>
 * - They move depending on the position of the clickable<br>
 * - They must be placed directly inside the page element (or some other element that does <b>not</b> scroll)
 * - They rotate according to the position of the clickable
 */
class ClickableHint {
    public readonly html: JQuery<HTMLDivElement>;
    public readonly clickable: Clickable;
    private readonly observer: IntersectionObserver;
    // own visibility
    private visible: boolean = false;

    constructor(clickable: Clickable, clonedClickable?: Clickable) {
        this.clickable = clickable;
        this.html = $("<div/>");
        this.html.addClass("clickable-hint");

        this.observer = new IntersectionObserver((event) => {
            if (event[0].isIntersecting) {
                this.onClickableVisible();
            } else {
                this.onClickableHidden();
            }
        }, {
            root: null,
            threshold: 0.1,
        });
        this.observer.observe(clickable.html[0]);
    }

    /**
     * Called when the clickable is scrolled
     */
    public startComputingPosition() {
        if (!this.visible) {
            return;
        }
        const clickablePosAbsolute = this.clickable.html.offset();
        const pageElement = this.clickable.html.closest(".page");
        const pagePos = pageElement.offset();
        const pageSize = {x: pageElement.outerWidth()!, y: pageElement.outerHeight()!};

        // position of the middle of the clickable relative to the page element
        const clickablePosRelative = {
            x: (clickablePosAbsolute!.left - pagePos!.left) + (this.clickable.html.width()! / 2),
            y: (clickablePosAbsolute!.top - pagePos!.top) + (this.clickable.html.height()! / 2),
        };

        // in px; distance to border
        const distance = {
            x: 20,
            y: 20,
        };

        // compute optimal position ignoring other hints
        // negative values mean from the right
        let optimalX = clickablePosRelative.x;
        let optimalY = clickablePosRelative.y;

        // Also compute importance of this hint (since we do not allow multiple hints on the same position, we need to move some of them)
        const importance = {
            x: 0,
            y: 0,
        };

        if (clickablePosRelative.x < 0) {
            optimalX = distance.x;
            importance.x = -clickablePosRelative.x;
        } else if (clickablePosRelative.x > pageSize.x) {
            optimalX = -distance.x;
            importance.x = clickablePosRelative.x - pageSize.x;
        }

        if (clickablePosRelative.y < 0) {
            optimalY = distance.y;
            importance.y = -clickablePosRelative.y;
        } else if (clickablePosRelative.y > pageSize.y) {
            optimalY = -distance.y;
            importance.y = clickablePosRelative.y - pageSize.y;
        }

        // console.log(this.clickable.data.title, clickablePosRelative, pageSize, optimalX, optimalY);

        // transform to percentage values
        optimalX = (optimalX / pageSize.x) * 100;
        optimalY = (optimalY / pageSize.y) * 100;
        clickablePosRelative.x = (clickablePosRelative.x / pageSize.x) * 100;
        clickablePosRelative.y = (clickablePosRelative.y / pageSize.y) * 100;

        this.setPosition(optimalX, optimalY, clickablePosRelative);
    }

    /**
     * This method computes the real positions of all current visible hints
     * @private
     */
    private static computeRealPositions() {

    }

    /**
     * Sets the position and the rotation of the clickable-hint
     * @param x real x coordinate of this hint
     * @param y real y coordinate of this hint
     * @param clickablePos coordinates of the clickable relative to wrapper
     * @private
     */
    private setPosition(x: number, y: number, clickablePos: { x: number, y: number }) {
        if (x > 0) {
            this.html.css("left", x + "%");
        } else {
            this.html.css("right", -x + "%");
        }
        if (y > 0) {
            this.html.css("top", y + "%");
        } else {
            this.html.css("bottom", -y + "%");
        }

        const rotation = ClickableHint.computeRotation({x: x, y: y}, clickablePos);
        this.html.css("transform", `rotate(${rotation}rad)`);
        // console.log("set pos of hints", x, y, rotation);
    }

    public static computeRotation(hintPos: Position, clickablePos: Position) {
        // koordinaten der position der hint - die der clickables
        const dx = hintPos.x - clickablePos.x; // 1900  -   1000
        const dy = hintPos.y - clickablePos.y; // 100   -   1000

        // vertikal nach rechts entspricht 0 Grad

        // gleiche Breite
        if (dx === 0) {
            // clickable ist oben
            if (dy > 0) {
                return -0.5 * Math.PI;
            }
            // clickable ist unten
            else {
                return 0.5 * Math.PI;
            }
        }
        // gleiche Höhe
        else if (dy === 0) {
            // clickable ist links
            if (dx > 0) {
                return Math.PI;
            }
            // clickable ist rechts
            else {
                return 0;
            }
        } else {
            const ret = Math.atan(dy / dx);
            // wir messen den winkel rechts, wenn das clickable links ist, muss alles gedreht werden
            if (dx > 0) {
                return ret + Math.PI;
            }
            return ret;
        }
    }

    /**
     * this computes the final positions of the clickable hints
     * @private
     */
    private static mergePositions() {

    }

    /**
     * Called when the clickable gets visible
     */
    public onClickableVisible(): void {
        this.html.removeClass("show");
        this.visible = false;
    };

    /**
     * Called when the clickable gets hidden
     */
    public onClickableHidden(): void {
        // Do not show hint if clickable is always hidden
        if (this.clickable.data.hidden) {
            return;
        }
        this.html.addClass("show");
        this.visible = true;
        this.startComputingPosition();
    };
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
    for (let i of Tour.pages) {
        i.media.triggerResize();
    }
    adjust_clickables();
});

window.addEventListener("popstate", function () {
    const newPageId = window.location.hash.substring(1);
    const newPage = Tour.pages.find(v => v.id === newPageId);
    if (newPage !== undefined) {
        let animation: PageAnimations;
        if (lastest === newPage.id) {
            animation = "backward";
        } else {
            animation = "forward";
        }
        newPage.activate(animation);
    } else {
        Tour.startPage?.activate("backward");
    }
    // let pgs = $(".page");
    // pgs.removeClass("show");
    // if (window.location.hash !== "") {
    //
    //     $("#" + idPrefix + window.location.hash.substring(1)).addClass("show");
    // } else
    //     pgs.eq(0).addClass("show");
});

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
function createLatestClickable(clickables: Clickable[]) {
    $(".clickable").removeClass("lastest-clickable");
    for (let i of clickables) {
        console.log("lastest lclickable", i.data.goto, i.data.goto === lastest, i);
        i?.html.addClass("lastest-clickable");
    }
}

// function createHtml(json: JsonPage[]) {
//     const pages: Page[] = [];
//     const tourElement = $("<div/>")
//         .addClass('schul-tour');
//     for (let pageData of json.map(PageData.fromJSON)) {
//         let page = Page.from(pageData);
//
//         pages.push(page);
//         tourElement.append(page.html);
//     }
//     Tour.pages = pages;
//     document.body.append(tourElement[0]);
//     console.log(json);
//     adjust_clickables();
// }

/**
 * Ajax requests to file:// endpoints do not work in chrome base browsers<br>
 * That's only relevant for testing
 * @param pagesJsonPath
 */
function init(pagesJsonPath: string | JsonSchulTourConfigFile) {
    const callback = (json: JsonSchulTourConfigFile) => {
        console.log("done", json);
        // let config = SchulTourConfigFile.fromJSON(json);
        const schulTour = new SchulTour(SchulTourConfigFile.fromJSON(json));
        schulTour.init(window.location.hash.substring(1));
        // createHtml(json.pages);
        // let done = false;
        // const location = window.location.hash.substring(1);
        // // activate the page from the address line
        // for (let page of Tour.pages) {
        //     if (page.id === location) {
        //         page.initialActivate(Tour.pages);
        //         done = true;
        //         break;
        //     }
        // }
        //
        // // activate the page from the config file
        // if (!done) {
        //     for (let page of Tour.pages) {
        //         if (page.id === config.initialPage) {
        //             page.initialActivate(Tour.pages);
        //             done = true;
        //             break;
        //         }
        //     }
        // }
        // // page [0] as fallback
        // if (!done) {
        //     Tour.pages[0].initialActivate(Tour.pages);
        // }
    };
    if (typeof pagesJsonPath === "string") {
        $.getJSON(pagesJsonPath, callback);
    } else {
        callback(pagesJsonPath);
    }
}

const Tour = {
    init,
    Page,
    ImageMedia,
    VideoMedia,
    IframeMedia,
    TextField,
    Clickable,
    CustomObject,
    ClickableHint,

    pages: [] as Page[],
    // the page which is shown at the beginning
    startPage: undefined as Page | undefined,
    initialized: false,

    // variables to be set from out
    // whether this is used by the dev tool (if true e.g. clickables are draggable, etc.)
    devTool: false,
};

Object.defineProperty(window, "Tour", {
    writable: false,
    configurable: false,
    value: Tour,
});

export default Tour;
export {init, Page, ImageMedia, VideoMedia, IframeMedia, TextField, Clickable, ClickableHint, CustomObject, Position};

// init("pages.json");
