// import * as $ from "jquery";
import {InlineObjectData, MediaData, mediaFolder, SchulTourConfigFile, uniqueId} from "./Data.js";

let finished_last = true;
const idPrefix = "tour_pg_";
const baustellenFotoUrl = mediaFolder + "/baustelle.png";
let lastest = "";
const isDesktop = window.innerWidth > 768;
const scrollSensitivity = 10;
const devTool = {
    dataTransferTypes: {
        // MUST be lowercase (because the browser will always lower it which can lead to bugs)
        inlineObject: {
            offset: "tour/inline_object/offset",
            data: "tour/inline_object/data",
            id: "tour/inline_object/id",
        },
    },
};
/**
 * This class holds the media element for the page. This could be an image, a video, etc. (see {@link MediaType} for more options)<br>
 */
class Media {
    constructor(data, htmlTag) {
        this.initialized = false;
        this.loadingErrorOccurred = false;
        const { source, loading } = Media.computeSourceAndLoading(data);
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
    static computeSourceAndLoading(data) {
        // higher / lower resolution and loading type depend on device (=connection bandwidth)
        let src;
        let loading;
        if (isDesktop) {
            //desktop
            src = data.srcMax ?? (data.src ?? data.srcMin);
            loading = "eager";
        }
        else {
            //mobile
            src = data.srcMin ?? (data.src ?? data.srcMax);
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
    static from(data) {
        switch (data.type) {
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
    prepareHTML() {
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
                if (event.originalEvent.dataTransfer.types.includes(devTool.dataTransferTypes.inlineObject.data)) {
                    event.preventDefault();
                }
            });
            /**
             * @param coord relative to document
             * @param closestSize size of parent element
             * @param closestOffset offset of parent element (space between document 0 and parent start)
             */
            const getRelativeCoordinate = (coord, closestSize, closestOffset) => {
                // Durchmesser in rem
                let iconDurchmesser = 3;
                iconDurchmesser = iconDurchmesser / 2 * parseFloat($(".clickable").css("fontSize"));
                return ((coord - closestOffset + iconDurchmesser) / closestSize) * 100;
            };
            this.html.on("drop", (event) => {
                console.log("drop event");
                event.preventDefault();
                const inlineObjectData = InlineObjectData.fromJSON(JSON.parse(event.originalEvent.dataTransfer.getData(devTool.dataTransferTypes.inlineObject.data)));
                const inlineObjectId = parseInt(event.originalEvent.dataTransfer.getData(devTool.dataTransferTypes.inlineObject.id));
                const inlineObjectOffset = event.originalEvent.dataTransfer.getData(devTool.dataTransferTypes.inlineObject.offset)
                    .split(" ").map(v => parseInt(v));
                this.handleDrop(inlineObjectId, inlineObjectData.withUpdate({
                    x: getRelativeCoordinate(event.clientX, this.html.width(), this.html.offset().left + inlineObjectOffset[0]),
                    y: getRelativeCoordinate(event.clientY, this.html.height(), this.html.offset().top + inlineObjectOffset[1]),
                }));
            });
        }
    }
    /**
     * Clones and returns this Media Object (also clones all its events)
     */
    clone() {
        const constructor = this.constructor;
        return new constructor(this.data, this._html.clone(true));
    }
    // @ts-ignore
    get page() {
        return this._page;
    }
    set page(value) {
        this._page = value;
        this.onPageSet();
    }
    onLoadingError() {
        this.loadingErrorOccurred = true;
    }
    /**
     * Override this method to do things when we know the natural intrinsic size of this media<br>
     * This method is called each time the intrinsic size changes, that means
     * 1. eventually at the construction (if width and height is specified in json file),
     * and 2. when the file is fully loaded
     * @protected
     */
    onSizeKnown() {
        // remove eventually previously added width and height specified from json file, because that could be wrong
        this.html.attr("width", this.src.width)
            .attr("height", this.src.height);
        this.triggerResize();
    }
    onPageSet() {
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
    onResize() {
        console.log("on Resize", this.page?.id);
        this.applyRatio();
    }
    triggerResize() {
        // console.log('trigger resize', this.page?.id);
        if (this.html.is(":visible") && this.page && this.src.width && this.src.height) {
            this.onResize();
        }
    }
    isImage(self = this.html) {
        return this._type === "img";
    }
    isVideo(self = this.html) {
        return this._type === "video";
    }
    isIframe(self = this.html) {
        return this._type === "iframe";
    }
    get html() {
        return this._html;
    }
    get src() {
        return this._src;
    }
    get type() {
        return this._type;
    }
    set type(value) {
        this._type = MediaData.determineType(value, this.srcUrl);
    }
    /**
     * Toggles classes depending on the ratio of this media and the ratio of the viewport (window)
     * @private
     */
    applyRatio() {
        const tourElement = this.html.closest(".schul-tour");
        const screenRatio = tourElement.width() / tourElement.height();
        let mediaRatio = this._src.width / this._src.height;
        if (mediaRatio > screenRatio) {
            this.html.closest(".bg_container").addClass("fill-width")
                .removeClass("fill-height");
        }
        else {
            this.html.closest(".bg_container").addClass("fill-height")
                .removeClass("fill-width");
        }
    }
    pause() {
    }
}
class VideoMedia extends Media {
    constructor(data, html) {
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
        if (this.html.get(0).readyState > 0) {
            this.html.trigger("loadedmetadata");
        }
    }
    static from(data) {
        return new VideoMedia(data);
    }
    onLoadingError() {
        super.onLoadingError();
        this.html.attr("poster", baustellenFotoUrl)
            .prop("controls", false);
    }
    pause() {
        this._html[0].pause();
    }
}
class ImageMedia extends Media {
    constructor(data, htmlTag) {
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
    static from(data) {
        return new ImageMedia(data);
    }
    onLoadingError() {
        super.onLoadingError();
        this.html.attr("src", baustellenFotoUrl);
    }
    onSizeKnown() {
        super.onSizeKnown();
    }
    onResize(pageElements) {
        super.onResize();
        let panoramaAdded = false;
        //remove panorama if screen is big enough
        if (this.page.is_panorama && this.src.width <= this.html.closest(".schul-tour").width()) {
            this.page.is_panorama = false;
            this.page.html.removeClass("pg_panorama");
        }
        // add panorama if screen is too small
        else if (!this.page.is_panorama && this.src.width > this.html.closest(".schul-tour").width()) {
            this.page.is_panorama = true;
            this.page.html.addClass("pg_panorama");
            panoramaAdded = true;
        }
        console.log("onVisible", this.page.id, this.page.is_panorama, this.page.is_360);
        // initial direction
        // only apply this when the page was NOT panorama before
        if (panoramaAdded || !this.initialized) {
            this.applyInitialDirection();
            this.initialized = true;
        }
        adjust_clickables();
    }
    ;
    applyInitialDirection() {
        if (this.page.is_panorama) {
            const pgWrapper = this.html.closest(".pg_wrapper");
            let initialDirection = (this.page.initial_direction / 100) * this.html.width();
            console.log("init dir", this.page.initial_direction, initialDirection);
            if (this.page.is_360 && initialDirection === 0) {
                console.log("init dir ===", initialDirection, this.html.width());
                initialDirection = this.html.width();
            }
            // if init dir is too high
            else if (this.page.is_360 && initialDirection > pgWrapper[0].scrollWidth) {
                // = init dir = n * width of img
                // if init dir === 0
                initialDirection = pgWrapper[0].scrollWidth % this.html.width() || this.html.width();
            }
            pgWrapper.scrollLeft(initialDirection);
        }
    }
}
class IframeMedia extends Media {
    constructor(data, htmlTag) {
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
    static from(data) {
        return new IframeMedia(data);
    }
    onLoadingError() {
        super.onLoadingError();
        //the plain html text
        this.html.attr("srcdoc", `<!DOCTYPE html>
            <html lang="de">
                <head> 
                   <meta charset="UTF-8"> 
                   <title>Baustelle</title>
               </head>
               <body>
                   <img src="${baustellenFotoUrl}" alt="Baustelle :)" style="width: 100%;height: 100%;">
               </body>
           </html>`);
    }
}
class SchulTour {
    constructor(data) {
        this.data = data;
        this.pages = [];
        this.html = $("<div/>")
            .addClass("schul-tour")
            .attr("data-color-theme", data.colorTheme)
            .attr("data-tour-mode", data.mode)
            .toggleClass("fullscreen", data.fullscreen);
        for (let pageData of data.pages) {
            let page = Page.from(pageData);
            this.pages.push(page);
            this.html.append(page.html);
        }
    }
    /**
     * Appends this element to the html body and sets the global {@link Tour.pages} object<br>
     * Do <b>NOT</b> call this method more than <b>ONE</b> time
     */
    init(initPage) {
        Tour.pages = this.pages;
        this.html.appendTo(document.body);
        let startPage = undefined;
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
    static from(data) {
        return new SchulTour(data);
    }
}
class Page extends AddressableObject() {
    constructor({ data, media, inlineObjects }) {
        super();
        this.is_panorama = false;
        this.is_360 = false;
        this.data = data;
        this.id = data.id;
        this.media = media;
        this.media.page = this;
        this.is_360 = data.is360;
        this.is_panorama = data.isPanorama;
        this.initial_direction = data.initialDirection;
        this.animationType = data.animationType;
        this.inlineObjects = inlineObjects.slice();
        this.html = $("<div></div>");
        // this.html[0].addEventListener("animationend", this.handleAnimationEnd);
        this.prepareHTML();
        if ((!isDesktop) && this.media.isImage()) {
            this.is_panorama = true;
        }
        this.html
            .addClass("page")
            .attr("id", idPrefix + this.id)
            .toggleClass("pg_panorama", this.is_panorama)
            .toggleClass("deg360", this.is_360)
            .append($("<div></div>")
            .addClass("pg_wrapper"));
        //first img
        this.html.children(".pg_wrapper")
            .append($("<div></div>")
            .addClass("bg_container")
            .append(this.media.html)
            .append(this.inlineObjects
            .filter(v => v.data.position === "media" && (!v.cloned))
            .map(v => v.html)))
            .append(this.inlineObjects
            .filter(v => v.data.position === "page")
            .map(v => v.html));
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
                    if (pgWrapperElement.scrollLeft - this.media.html.width() < scrollSensitivity) {
                        return;
                    }
                    pgWrapper.scrollLeft(pgWrapperElement.scrollLeft - this.media.html.width());
                }
                else if (pgWrapperElement.scrollLeft < scrollSensitivity) {
                    // if new scroll would trigger this event again
                    if (pgWrapperElement.scrollWidth - pgWrapperElement.clientWidth - (pgWrapperElement.scrollLeft + this.media.html.width()) < scrollSensitivity) {
                        return;
                    }
                    pgWrapper.scrollLeft(pgWrapperElement.scrollLeft + this.media.html.width());
                }
            });
        }
        if (Tour.devTool) {
            this.media.handleDrop = (inlineObjectId, inlineObjectData) => {
                const newInlineObjects = this.inlineObjects.filter(v => !v.cloned);
                const newInlineObjectsData = newInlineObjects.map(v => v.data);
                newInlineObjectsData[newInlineObjects.findIndex(v => uniqueId(v.html) === inlineObjectId)] = inlineObjectData;
                let pageData = {
                    inlineObjects: newInlineObjectsData,
                };
                this.handleUpdate(pageData);
                this.clickables.filter(v => uniqueId(v.originHtml) === inlineObjectId)
                    .forEach(v => v.html
                    .css("left", inlineObjectData.x + "%")
                    .css("top", inlineObjectData.y + "%"));
            };
            for (let i of this.clickables) {
                i.handleEditClick = (inlineObjectId, inlineObjectData) => {
                    const index = this.clickables.findIndex(value => uniqueId(value.html) === inlineObjectId);
                    this.handleInlineObjectEditClick(index, inlineObjectData);
                };
            }
            this.html[0].addEventListener("scroll", () => {
                this.onScroll?.(this.html.scrollLeft());
            });
        }
    }
    static from(data) {
        return new Page({
            data: data,
            media: Media.from(data.media),
            inlineObjects: data.inlineObjects.map(InlineObject.from),
        });
    }
    // event handler when the animation has ended
    handleAnimationEnd(event) {
        if (!super.handleAnimationEnd(event)) {
            return false;
        }
        // if (event.target !== this.html[0]) {
        //     return;
        // }
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
        return true;
    }
    ;
    activateAllowed() {
        return finished_last && !this.activated && !this.activateRunning;
    }
    activate(animationType) {
        if (!super.activate(animationType)) {
            return false;
        }
        finished_last = false;
        let prevPage;
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
        prevPage.deactivate(animationType ?? this.data.animationType);
        window.location.hash = this.id;
        createLastestClickable(this.clickables.filter(v => v.data.goto === prevPage.id));
        this.onCurrentPageChange?.(this.id);
        return true;
    }
    deactivate(animationType) {
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
    get clickables() {
        return this.inlineObjects.filter((v) => v.data.type === "clickable");
    }
    /**
     * Add {@link InlineObject}<br>
     * A {@link Clickable} is also an {@link InlineObject}
     * @param inlineObjects
     */
    addInlineObjects(...inlineObjects) {
        this.inlineObjects.push(...inlineObjects);
    }
    /**
     * Activate (show) this page immediately (without animations etc.)
     * This should be used only 1 time at the beginning
     * @param pages
     */
    initialActivate(pages) {
        this.activated = true;
        this.html.addClass("show");
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
        createLastestClickable(this.clickables.filter(value => value.data.goto === lastest));
    }
}
function AddressableObject(baseClass) {
    if (baseClass === undefined) {
        baseClass = class PlaceHolder {
        };
    }
    return class AddressableObject extends baseClass {
        constructor() {
            super(...arguments);
            this.activated = false;
            this.activateRunning = false;
            this.deactivateRunning = false;
        }
        prepareHTML() {
            this.html.addClass("addressable");
            //animations
            this.html.attr("data-tour-animation", this.data.animationType);
            this.html[0].addEventListener("animationend", (event) => this.handleAnimationEnd(event));
        }
        handleAnimationEnd(event) {
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
        }
        ;
        activateAllowed() {
            return !this.activated && !this.activateRunning && !this.deactivateRunning;
        }
        deactivateAllowed() {
            return this.activated && !this.deactivateRunning && !this.activateRunning;
        }
        activate(animationType) {
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
        deactivate(animationType) {
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
        toggle(value, animationType) {
            value ??= !this.activated;
            if (value) {
                this.activate(animationType);
            }
            else {
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
    constructor(data, htmlTag, isClone = false) {
        this.data = data;
        this._cloned = isClone;
        if (typeof htmlTag === "string") {
            this._html = $(`<${htmlTag}/>`);
            this.originHtml = this._html;
        }
        else {
            this.originHtml = htmlTag;
            if (isClone) {
                this._html = htmlTag.clone(true);
            }
            else {
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
                    event.originalEvent.dataTransfer.dropEffect = "move";
                    event.originalEvent.dataTransfer.setData(devTool.dataTransferTypes.inlineObject.data, JSON.stringify(this.data));
                    event.originalEvent.dataTransfer.setData(devTool.dataTransferTypes.inlineObject.id, String(uniqueId(this.originHtml)));
                    event.originalEvent.dataTransfer.setData(devTool.dataTransferTypes.inlineObject.offset, [event.clientX - this.html.offset().left, event.clientY - this.html.offset().top].join(" "));
                });
                // edit icon (material icons required)
                this.html.append($("<div/>")
                    .text("edit")
                    .addClass("material-icons dev-tool-edit-icon")
                    .on("click", () => {
                    this.handleEditClick(uniqueId(this.originHtml), this.data);
                }));
            }
        }
    }
    /**
     * Clones and returns this inline Object (also clones all its events)
     */
    clone() {
        const constructor = this.constructor;
        return new constructor(this.data, this.html);
        // return new constructor(this.data, this._html.clone(true));
    }
    get html() {
        return this._html;
    }
    get cloned() {
        return this._cloned;
    }
    static from(data) {
        switch (data.type) {
            case "clickable":
                return Clickable.from(data);
            case "custom":
                return CustomObject.from(data);
            case "text":
                return TextField.from(data);
        }
    }
    static fromJson(jsonInlineObject) {
        switch (jsonInlineObject.type) {
            case "clickable":
                return Clickable.fromJson(jsonInlineObject);
            case "text":
                return TextField.fromJson(jsonInlineObject);
            case "custom":
                return CustomObject.fromJson(jsonInlineObject);
        }
    }
}
/**
 * This can be any js Object
 */
class CustomObject extends InlineObject {
    constructor(data, html) {
        super(data, html ?? $("#" + data.htmlId), html !== undefined);
        this.html.attr("data-animation", data.animationType);
    }
}
class TextField extends AddressableObject(InlineObject) {
    constructor(data, html) {
        super(data, html ?? "div", html !== undefined);
        this.activated = !data.hidden;
        let title = "";
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
    static from(data) {
        return new TextField(data);
    }
}
class Clickable extends InlineObject {
    constructor(data, html) {
        super(data, html ?? "div", html !== undefined);
        this.handleClick = () => {
            for (let page of Tour.pages) {
                if (page.id === this.data.goto) {
                    page.activate(this.data.animationType);
                    break;
                }
                let done = false;
                for (let iObject of page.inlineObjects) {
                    if (iObject.data.isTextField() && iObject.data.id === this.data.goto) {
                        this.performAction(iObject);
                        done = true;
                        break;
                    }
                }
                if (done) {
                    break;
                }
            }
        };
        if (!this.cloned) {
            this.html.addClass("clickable")
                .attr("goto", this.data.goto) //todo redundant
                .append($("<div></div>")
                .addClass("title")
                .text(this.data.title))
                .append($("<button></button>")
                .addClass("icon")
                .on("click", this.handleClick)
                .addClass(this.data.icon));
        }
    }
    static from(data) {
        return new Clickable(data);
    }
    // @ts-ignore
    performAction(obj) {
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
    let bgImgs = $(".bg");
    bgImgs.removeClass("fill-width");
    bgImgs.removeClass("fill-height");
    bgImgs.each(function () {
        let imgRatio = this.naturalWidth / this.naturalHeight;
        let screenRatio = window.innerWidth / window.innerHeight;
        if (imgRatio > screenRatio) {
            $(this).addClass("fill-width");
        }
        else {
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
        let animation;
        if (lastest === newPage.id) {
            animation = "backward";
        }
        else {
            animation = "forward";
        }
        newPage.activate(animation);
    }
    else {
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
        if (clickables.eq(i).offset().left + clickables.eq(i).outerWidth(true) > clickables.eq(i).parent().offset().left + clickables.eq(i).parent().outerWidth(true))
            clickables.eq(i).addClass("right");
    }
}
/**
 * @param clickables {Clickable[]}
 */
function createLastestClickable(clickables) {
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
function init(pagesJsonPath) {
    const callback = (json) => {
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
    }
    else {
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
    pages: [],
    // the page which is shown at the beginning
    startPage: undefined,
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
export { init, Page, ImageMedia, VideoMedia, IframeMedia, TextField, Clickable, CustomObject };
// init("pages.json");
//# sourceMappingURL=tour.js.map
