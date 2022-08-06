import { PageData, } from "./Data.js";
var finished_last = true;
let idPrefix = "tour_pg_";
let imgFolder = "media";
let baustellenFotoUrl = imgFolder + "/baustelle.png";
let animationDuration = 500;
let lastest = "";
let pages = [];
let isDesktop = window.innerWidth > 768;
/**
 * This class holds the media element for the page. This could be an image, a video, etc. (see {@link MediaType} for more options)<br>
 */
class Media {
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
    constructor(src) {
        this.src = src;
        this.srcString = Media.formatSrc(src.name);
        this._type = src.type;
        this.width = src.width;
        this.height = src.height;
    }
    static from(data) {
        var _a, _b, _c, _d;
        //higher / lower resolution and loading type depend on device (=connection bandwidth)
        let src;
        let loading;
        // if (window.innerWidth > 768) {
        if (isDesktop) {
            //desktop
            src = (_a = data.srcMax) !== null && _a !== void 0 ? _a : ((_b = data.src) !== null && _b !== void 0 ? _b : data.srcMin);
            loading = "eager";
        }
        else {
            //mobile
            src = (_c = data.srcMin) !== null && _c !== void 0 ? _c : ((_d = data.src) !== null && _d !== void 0 ? _d : data.srcMax);
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
                return new VideoMedia(Object.assign(Object.assign({}, data), { src: src }));
            case "iframe":
                return new IframeMedia({
                    src: src,
                    loading: loading,
                    fetchPriority: data.fetchPriority,
                });
        }
    }
    static fromJson(jsonMedia) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        //check for mistakes
        if (jsonMedia == null)
            throw `Media is ${jsonMedia}`;
        if (!jsonMedia.src && !jsonMedia.srcMin && !jsonMedia.srcMax)
            console.error(`Media source is not given in media object: `, jsonMedia);
        //higher / lower resolution and loading type depend on device (=connection bandwidth)
        let src;
        let loading;
        // if (window.innerWidth > 768) {
        if (isDesktop) {
            //desktop
            src = (_a = jsonMedia.srcMax) !== null && _a !== void 0 ? _a : ((_b = jsonMedia.src) !== null && _b !== void 0 ? _b : jsonMedia.srcMin);
            loading = "eager";
        }
        else {
            //mobile
            src = (_c = jsonMedia.srcMin) !== null && _c !== void 0 ? _c : ((_d = jsonMedia.src) !== null && _d !== void 0 ? _d : jsonMedia.srcMax);
            loading = "lazy";
        }
        //loading
        if (jsonMedia.loading !== "auto" && jsonMedia.loading !== undefined) {
            loading = jsonMedia.loading;
        }
        //check src
        if (src == null) {
            console.error("src == ", src, "Json Media:", jsonMedia);
        }
        switch (this.determineType((_e = jsonMedia.type) !== null && _e !== void 0 ? _e : "auto", src)) {
            case "img":
                return new ImageMedia(src, loading, (_f = jsonMedia.fetchPriority) !== null && _f !== void 0 ? _f : "auto");
            case "video":
                return new VideoMedia(src, (_g = jsonMedia.poster) !== null && _g !== void 0 ? _g : "", (_h = jsonMedia.autoplay) !== null && _h !== void 0 ? _h : false, (_j = jsonMedia.loop) !== null && _j !== void 0 ? _j : false, (_k = jsonMedia.muted) !== null && _k !== void 0 ? _k : false, (_l = jsonMedia.preload) !== null && _l !== void 0 ? _l : "metadata");
            case "iframe":
                return new IframeMedia(src, loading, (_m = jsonMedia.fetchPriority) !== null && _m !== void 0 ? _m : "auto");
        }
        //default parameters on absence
        // return new Media(src!, jsonMedia.type ?? "auto", jsonMedia.poster ?? "", jsonMedia.autoplay ?? false, jsonMedia.loop ?? false, jsonMedia.muted ?? false);
    }
    clone() {
        // let n = new Media(this.src, this.type, this.poster, this.autoplay, this.loop, this.muted);
        let n = new Media(this.src);
        n._html = this._html.clone(true);
        return n;
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
    get type() {
        return this._type;
    }
    set type(value) {
        this._type = Media.determineType(value, this.srcString);
    }
    static determineType(value, src) {
        let res;
        if (value === "auto") {
            let fileSplit = src.split(".");
            let fileEnding = fileSplit[fileSplit.length - 1];
            if (Media.imgFileEndings.indexOf(fileEnding) > -1) {
                res = "img";
            }
            else if (Media.videoFileEndings.indexOf(fileEnding) > -1) {
                res = "video";
            }
            else if (Media.iframeUrlEndings.indexOf(fileEnding) > -1) {
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
        return imgFolder + "/" + src;
    }
    pause() {
    }
}
Media.imgFileEndings = ["png", "jpeg", "jpg", "gif", "svg", "webp", "apng", "avif"];
Media.videoFileEndings = ["mp4", "webm", "ogg", "ogm", "ogv", "avi"];
//this list is not exhaustive
Media.iframeUrlEndings = ["html", "htm", "com", "org", "edu", "net", "gov", "mil", "int", "de", "en", "eu", "us", "fr", "ch", "at", "au"];
class VideoMedia extends Media {
    constructor({ src, autoplay, loop, muted, poster, preload, }) {
        var _a;
        super(src.withType("video"));
        this.poster = poster;
        this.autoplay = autoplay;
        this.loop = loop;
        this.muted = muted;
        this.preload = preload;
        this._html = $("<video></video>")
            .text("HTML Video is not supported")
            .attr("poster", (_a = this.poster) !== null && _a !== void 0 ? _a : "")
            .prop("autoplay", this.autoplay)
            .prop("loop", this.loop)
            .prop("muted", this.muted)
            .prop("preload", this.preload);
    }
    clone() {
        let n = new VideoMedia(this);
        n._html = this.html.clone(true);
        return n;
    }
    pause() {
        this._html[0].pause();
    }
}
class ImageMedia extends Media {
    constructor({ src, loading, fetchPriority }) {
        super(src.withType("img"));
        this.loading = loading;
        this.fetchPriority = fetchPriority;
        this._html = $("<img>")
            .attr("alt", "Could not load Image :(")
            .attr("loading", this.loading)
            .attr("fetchPriority", this.fetchPriority);
    }
}
class IframeMedia extends Media {
    /**
     * @param src
     * @param loading
     * @param fetchPriority
     */
    constructor({ src, loading, fetchPriority }) {
        super(src.withType("iframe"));
        this.loading = loading;
        this.fetchPriority = fetchPriority;
        this._html = $("<iframe></iframe>")
            .attr("src", this.srcString)
            .attr("loading", this.loading)
            .attr("fetchPriority", this.fetchPriority);
    }
}
class Page {
    constructor({ id, initial_direction, img, inlineObjects, is_360, is_panorama, }) {
        this.is_panorama = false;
        this.is_360 = false;
        this.inlineObjects = [];
        this._html = $("<div></div>");
        this.id = id;
        this.img = img;
        this.is_360 = is_360;
        this.is_panorama = is_panorama;
        this.initial_direction = initial_direction;
        this.inlineObjects.push(...inlineObjects);
    }
    static from(data) {
        return new Page({
            id: data.id,
            is_panorama: data.isPanorama,
            is_360: data.is360,
            initial_direction: data.initialDirection,
            img: Media.from(data.media),
            inlineObjects: data.inlineObjects.map(InlineObject.from),
        });
    }
    static fromJson(jsonPage) {
        var _a, _b, _c, _d, _e, _f, _g;
        //check if everything is well formatted / check for mistakes
        if (typeof jsonPage.id !== "string" || jsonPage.id.length <= 0)
            console.error(`Id wrong formatted in page object: `, jsonPage);
        //default arguments
        return new Page(jsonPage.id, Media.fromJson(jsonPage.img), (_a = jsonPage.is_panorama) !== null && _a !== void 0 ? _a : false, (_b = jsonPage.is_360) !== null && _b !== void 0 ? _b : false, (_c = jsonPage.initial_direction) !== null && _c !== void 0 ? _c : 0, ...(_e = (_d = jsonPage.inlineObjects) === null || _d === void 0 ? void 0 : _d.map(v => InlineObject.fromJson(v))) !== null && _e !== void 0 ? _e : [], ...(_g = (_f = jsonPage.clickables) === null || _f === void 0 ? void 0 : _f.map(v => Clickable.fromJson(v))) !== null && _g !== void 0 ? _g : []);
    }
    /**
     * In 360deg IMGs there exists always 2 similar clickables and all of them will be returned
     */
    get clickables() {
        return this.inlineObjects.filter(v => v instanceof Clickable);
    }
    /**
     * Add {@link InlineObject}<br>
     * A {@link Clickable} is also an {@link InlineObject}
     * @param inlineObjects
     */
    addInlineObjects(...inlineObjects) {
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
class InlineObject {
    constructor(
    // {type, animationType, position, x, y, html}:
    //     { position: InlineObjectPosition, html: JQuery, type: InlineObjectType, animationType: AnimationType, x?: number, y?: number }) {
    data, htmlTag, isClone = false) {
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
        }
        else {
            // console.assert(typeof htmlTag === "object", "A jquery object must be given when you clone a previously created instance");
            // this._html = htmlTag as JQuery;
        }
    }
    get html() {
        return this._html;
    }
    get second() {
        return this._second;
    }
    static from(data) {
        switch (data.type) {
            case "clickable":
                return new Clickable(data);
            case "custom":
                return new CustomObject(data);
            case "text":
                return new TextField(data);
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
    // declare public readonly x: number;
    // declare public readonly y: number;
    // declare public readonly animationType: CustomAnimations;
    // public readonly id: string;
    constructor(data) {
        super(data, $("#" + data.htmlId));
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
    clone() {
    }
}
class TextField extends InlineObject {
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
    constructor(data) {
        super(data, "div");
    }
    static fromJson(json) {
        return new TextField(json.content, "page", json.title, json.footer, typeof json.cssClasses === "string" ? json.cssClasses.split(" ") : json.cssClasses, json.animationType, typeof json.x === "string" ? parseFloat(json.x) : json.x, typeof json.x === "string" ? parseFloat(json.x) : json.x);
    }
    // public override clone(n?: TextField): TextField {
    //     if (n === undefined) {
    //         n = new TextField(this.content, this.position, this.title, this.footer, this.cssClasses, this.animationType, this.x, this.y);
    //     }
    //     return super.clone(n) as TextField;
    // }
    clone() {
    }
}
class Clickable extends InlineObject {
    // public readonly title: string;
    // declare public readonly x: number;
    // declare public readonly y: number;
    // declare public readonly animationType: PageAnimations;
    // declare public readonly goto: string;
    // public readonly second: boolean; //360deg img
    // public icon: IconType = "arrow_l";
    // constructor({position, y, x, animationType, title, goto, icon}:
    //                 { title: string, x: number, y: number, goto: string, icon: IconType, animationType?: PageAnimations, position?: InlineObjectPosition }) {
    constructor(data) {
        // super({
        //     position: position ?? "media",
        //     html: $("<div></div>"),
        //     type: "clickable",
        //     animationType: animationType ?? "forward",
        //     x: x,
        //     y: y,
        // });
        super(data, "div");
        // this.title = title;
        // // this.x = x;
        // // this.y = y;
        // this.goto = goto;
        // this.icon = icon;
        this.html.addClass("clickable")
            .attr("goto", this.data.goto) //todo redundant
            .append($("<div></div>")
            .addClass("title")
            .text(this.data.title))
            .append($("<button></button>")
            .addClass("icon")
            .addClass(this.data.icon));
    }
    static from(data) {
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
    /**
     * Clone this clickable and create all html objs new (with all event)
     * @returns {Clickable}
     */
    clone(n) {
        if (n === undefined) {
            // n = new Clickable(this.title, this.x, this.y, this.goto, this.icon, this.animationType, this.position); //cloned clickables are considered as second clickables (relevant for 360deg img)
            n = new Clickable(this.data);
        }
        return super.clone(n);
    }
}
window.onresize = function () {
    let bgImgs = $(".bg");
    bgImgs.removeClass("fill-width");
    bgImgs.removeClass("fill-height");
    bgImgs.each(function () {
        let imgRatio = this.naturalWidth / this.naturalHeight;
        let screenRatio = window.innerWidth / window.innerHeight;
        if (imgRatio > screenRatio)
            $(this).addClass("fill-width");
        else
            $(this).addClass("fill-height");
    });
    adjust_clickables();
};
window.onpopstate = function () {
    let pgs = $(".page");
    pgs.removeClass("show");
    if (window.location.hash !== "")
        $("#" + idPrefix + window.location.hash.slice(1)).addClass("show");
    else
        pgs.eq(0).addClass("show");
};
function goTo(pg, animationType) {
    if (finished_last) {
        finished_last = false;
        let next = pages.find(v => v.id === pg.substring(idPrefix.length));
        let prev = pages.find(v => v.id === $(".page.show").attr("id").substring(idPrefix.length));
        //pause video
        prev.img.pause();
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
        }
        else if (animationType == "backward") {
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
        createLastestClickable(next.clickables.filter(v => v.goto === prev.id));
    }
}
function adjust_clickables() {
    let clickables = $(".clickable");
    clickables.removeClass("right");
    for (let i = 0; i < clickables.length; i++) {
        // let clickables = $(".clickable");
        if (clickables.eq(i).offset().left + clickables.eq(i).outerWidth(true) > clickables.eq(i).parent().offset().left + clickables.eq(i).parent().outerWidth(true))
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
function createLastestClickable(clickables) {
    $(".clickable").removeClass("lastest-clickable");
    for (let i of clickables) {
        console.log("lastest lclickable", i.goto, i.goto === lastest, i);
        i === null || i === void 0 ? void 0 : i.html.addClass("lastest-clickable");
    }
}
function createHtml(json) {
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
        if ((!isDesktop) && page.img.isImage()) {
            page.is_panorama = true;
        }
        // for (let clickable of jsonPage.clickables.map(jsonClickable => new Clickable(jsonClickable.title,
        //     jsonClickable.x, jsonClickable.y, jsonClickable.goto, jsonClickable.icon, jsonClickable.backward))) {
        //     page.clickables.push(clickable);
        for (let clickable of page.clickables) {
            let gotoExists = json.filter(value => value.id === clickable.goto).length > 0;
            if (!gotoExists) {
                console.log("Id '" + clickable.goto + "' does not exist");
            }
            console.log(clickable.data.title, clickable.data.goto);
            console.log(page.inlineObjects);
            clickable.html.find("button")
                .on("click", gotoExists ? () => {
                goTo(idPrefix + clickable.goto, clickable.animationType);
            } : () => {
                console.error("Cannot go to next page because '" + clickable.goto + "' does not exist");
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
        if (page.img.isImage() || page.img.isIframe())
            event = "load";
        else if (page.img.isVideo()) {
            event = "loadedmetadata";
        }
        else {
            console.error("cannot determine event type because Media Type is not known (or not implemented)\nContinuing with 'load' as event type, but FIX THIS");
            event = "load";
        }
        page.img.html
            .addClass("bg")
            // .attr("initial_direction", page.initial_direction)
            .on(event, function () {
            console.log(`Media Loaded: ${page.img.srcString}`);
            // let self = $(this);
            let self = page.img.html;
            self.removeClass("fill-width");
            self.removeClass("fill-height");
            let imgRatio;
            if (page.img.isImage(self)) {
                imgRatio = self.get(0).naturalWidth / self.get(0).naturalHeight;
                //remove panorama if screen is big enough
                if (page.is_panorama && self.get(0).naturalWidth <= window.innerWidth) {
                    page.is_panorama = false;
                    page.html.removeClass("pg_panorama");
                }
                let onVisible = (pageElements, observer) => {
                    // console.log("st")
                    // console.info("onVisible params", pageElements, "B:", observer);
                    if (self.is(":hidden")) {
                        return;
                    }
                    //initial direction
                    if (page.is_panorama) {
                        let initialDirection = (page.initial_direction / 100) * self.width();
                        self.closest(".pg_wrapper").scrollLeft(initialDirection);
                    }
                    adjust_clickables();
                    //disconnect observer
                    if (observer) {
                        observer.disconnect();
                        // console.info("disconnected observer");
                    }
                };
                if (self.is(":visible")) {
                    onVisible();
                }
                else {
                    // console.log("obsever")
                    let observer = new MutationObserver(onVisible);
                    observer.observe(page.html.get(0), {
                        attributeFilter: ["style", "class"],
                    });
                }
            }
            else if (page.img.isVideo(self)) {
                imgRatio = self.get(0).videoWidth / self.get(0).videoHeight;
            }
            else if (page.img.isIframe()) {
                return; //all resizing has to be done by the iframe itself
            }
            else {
                throw "Need to add handling for MediaType: " + page.img.type;
            }
            let screenRatio = window.innerWidth / window.innerHeight;
            if (imgRatio > screenRatio)
                self.addClass("fill-width");
            else
                self.addClass("fill-height");
        })
            .on("error", function () {
            console.error("error");
            console.warn("Error loading Media", page.img);
            if (page.img.isImage())
                page.img.html.attr("src", baustellenFotoUrl);
            else if (page.img.isVideo()) {
                page.img.html
                    .attr("poster", baustellenFotoUrl)
                    .prop("controls", false);
                // .removeAttr("src")
                // .removeAttr("preload")
                // .removeAttr("type");
            }
            else if (page.img.isIframe()) {
                page.img.html
                    //the plain html text
                    .attr("srcdoc", "<!DOCTYPE html>" +
                    "<html lang=\"de\">" +
                    "<head>" +
                    "    <meta charset=\"UTF-8\">" +
                    "    <title>Baustelle</title>" +
                    "</head>" +
                    "<body>" +
                    "<img src=\"./img1/baustelle.png\" alt=\"Baustelle :)\" style=\"width: 100%;height: 100%;\">" +
                    "</body>" +
                    "</html>");
            }
        });
        //add src last so that error and load events aren't triggered before we add the event handler
        if (page.img.isImage()) {
            page.img.html.attr("src", page.img.srcString);
        }
        else if (page.img.isVideo()) {
            page.img.html
                .prop("controls", true)
                .append($("<source>"));
            //firefox dispatches error events on last <source> tag, so we need to handle them there
            page.img.html.find("source").last()
                .on("error", e => page.img.html.trigger("error", e));
            //add src last so that we won't trigger error event too early
            page.img.html.find("source").last().attr("type", "video/mp4")
                .attr("src", page.img.srcString);
            //should be redundant
            if (page.img.html.get(0).readyState > 0) {
                page.img.html.trigger(event);
            }
        }
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
            .append($("<div></div>")
            .addClass("pg_wrapper"));
        //first img
        page.html.children(".pg_wrapper")
            .append($("<div></div>")
            .addClass("bg_container")
            .append(page.img.html)
            .append(page.inlineObjects
            .filter(v => v.position == "media" && (!v.second))
            .map(v => v.html)))
            .append(page.inlineObjects
            .filter(v => v.position == "page")
            .map(v => v.html));
        if (page.is_360) {
            console.log("is_360");
            //add second clickables for second img in 360deg IMGs
            page.addInlineObjects(...page.clickables.filter(v => v.position == "media" && (!v.second)).map(v => v.clone()));
            page.secondaryImg = page.img.clone();
            //second img
            let bgContainer1 = $("<div></div>")
                .addClass("bg_container")
                .append(page.secondaryImg.html)
                .append(page.inlineObjects
                .filter(v => v.position === "media" && v.second)
                .map(v => v.html));
            page.html.children(".pg_wrapper")
                .append(bgContainer1);
            page.html.find(".pg_wrapper").on("scroll", function () {
                let self = $(this);
                if (this.scrollWidth - this.clientWidth - this.scrollLeft < scrollSensitivity) {
                    // if new scroll would trigger this event again
                    if (this.scrollLeft - page.img.html.width() < scrollSensitivity) {
                        return;
                    }
                    self.scrollLeft(this.scrollLeft - page.img.html.width());
                }
                else if (self.scrollLeft() < scrollSensitivity) {
                    // if new scroll would trigger this event again
                    if (this.scrollWidth - this.clientWidth - (this.scrollLeft + page.img.html.width()) < scrollSensitivity) {
                        return;
                    }
                    self.scrollLeft(this.scrollLeft + page.img.html.width());
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
function init(pagesJsonPath) {
    //@ts-ignore
    $.getJSON(pagesJsonPath, (json) => {
        console.log("done", json);
        createHtml(json.pages);
        if (window.location.hash !== "") {
            $("#" + idPrefix + window.location.hash.slice(1)).addClass("show");
        }
        else {
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
export { init };
// init("pages.json");
//# sourceMappingURL=script.js.map