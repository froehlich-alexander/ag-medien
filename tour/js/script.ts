// import * as $ from 'jquery'

var finished_last = true;
let idPrefix = "tour_pg_";
let imgFolder = "img1";
let baustellenFotoUrl = imgFolder + "/baustelle.png";
let animationDuration = 500;
let lastest = "";
let pages: Page[] = [];
let isDesktop = window.innerWidth > 768;

type MediaType = "img" | "video" | "iframe";
type IconType = "arrow_l" | "arrow_r" | "arrow_u" | "arrow_d";
type VideoPreloadType = "metadata" | "auto"; //cannot use "none" because then we won't get the loadmetadata event
type LoadingType = "eager" | "lazy";
type FetchPriorityType = "high" | "low" | "auto";
type InlineObjectType = "clickable" | "text" | "custom";
type InlineObjectPosition = "media" | "page"; //  whether the object is moving together with the media (like clickables) or the page and whether it is positioned relative to the media or to the page (normally full screen)
type PageAnimations = "forward" | "backward";
type TextAnimations = undefined;
type CustomAnimations = undefined;
type AnimationType = PageAnimations | TextAnimations | CustomAnimations;

/**
 * This class holds the media element for the page. This could be an image, a video, etc. (see {@link MediaType} for more options)<br>
 */
class Media<T extends HTMLImageElement | HTMLVideoElement | HTMLIFrameElement = HTMLImageElement | HTMLVideoElement | HTMLIFrameElement> {
    public src: string;
    private _type!: MediaType;
    declare protected _html: JQuery<T>;

    public static readonly imgFileEndings = ["png", "jpeg", "jpg", "gif", "svg", "webp", "apng", "avif"];
    public static readonly videoFileEndings = ["mp4", "webm", "ogg", "ogm", "ogv", "avi"];
    public static readonly iframeUrlEndings = ["html", "htm", "com", "org", "edu", "net", "gov", "mil", "int", "de", "en", "eu", "us", "fr", "ch", "at", "au"]; //this list is not exhaustive

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

    constructor(src: string, type: MediaType) {
        this.src = Media.formatSrc(src);
        this._type = type;
    }

    public static fromJson(jsonMedia: JsonMedia): Media {
        //check for mistakes
        if (jsonMedia == null)
            throw `Media is ${jsonMedia}`;
        if (!jsonMedia.src && !jsonMedia.srcMin && !jsonMedia.srcMax)
            console.error(`Media source is not given in media object: `, jsonMedia);

        //higher / lower resolution and loading type depend on device (=connection bandwidth)
        let src;
        let loading: LoadingType;
        // if (window.innerWidth > 768) {
        if (isDesktop) {
            //desktop
            src = jsonMedia.srcMax ?? (jsonMedia.src ?? jsonMedia.srcMin);
            loading = "eager";
        } else {
            //mobile
            src = jsonMedia.srcMin ?? (jsonMedia.src ?? jsonMedia.srcMax);
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

        switch (this.determineType(jsonMedia.type ?? "auto", src!)) {
            case "img":
                return new ImageMedia(src!, loading, jsonMedia.fetchPriority ?? "auto");
            case "video":
                return new VideoMedia(src!, jsonMedia.poster ?? "", jsonMedia.autoplay ?? false,
                    jsonMedia.loop ?? false, jsonMedia.muted ?? false, jsonMedia.preload ?? "metadata");
            case "iframe":
                return new IframeMedia(src!, loading, jsonMedia.fetchPriority ?? "auto");
        }

        //default parameters on absence
        // return new Media(src!, jsonMedia.type ?? "auto", jsonMedia.poster ?? "", jsonMedia.autoplay ?? false, jsonMedia.loop ?? false, jsonMedia.muted ?? false);
    }

    public clone(): Media {
        // let n = new Media(this.src, this.type, this.poster, this.autoplay, this.loop, this.muted);
        let n = new Media(this.src, this.type);
        n._html = this._html.clone(true);
        return n;
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

    get type(): MediaType {
        return this._type;
    }

    set type(value: MediaType | "auto") {
        this._type = Media.determineType(value, this.src);
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
        let regex = new RegExp('^(?:[a-z]+:)?//', 'i');
        //if src is absolute (e.g. http://abc.xyz)
        //or src relative to document root (starts with '/') (the browser interprets that correctly)
        if (regex.test(src) || src.startsWith("/")) {
            if (src.startsWith("http://")) {
                console.warn("Security waring: Using unsecure url in iframe:", src);
            }
            return src;
        }
        //add prefix
        return imgFolder + "/" + src
    }

    public pause(): void {
    }
}

class VideoMedia extends Media<HTMLVideoElement> {
    public readonly poster: string;
    public readonly autoplay: boolean;
    public readonly loop: boolean;
    public readonly muted: boolean
    public readonly preload: VideoPreloadType;

    declare protected _html: JQuery<HTMLVideoElement>;

    constructor(src: string, poster: string, autoplay: boolean, loop: boolean, muted: boolean, preload: VideoPreloadType) {
        super(src, "video");
        this.poster = poster;
        this.autoplay = autoplay;
        this.loop = loop;
        this.muted = muted;
        this.preload = preload;
        this._html = $("<video></video>")
            .text("HTML Video is not supported")
            .attr("poster", this.poster)
            .prop("autoplay", this.autoplay)
            .prop("loop", this.loop)
            .prop("muted", this.muted)
            .prop("preload", this.preload) as JQuery<HTMLVideoElement>;
    }

    public clone(): VideoMedia {
        let n = new VideoMedia(this.src, this.poster, this.autoplay, this.loop, this.muted, this.preload);
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

    constructor(src: string, loading: LoadingType, fetchPriority: FetchPriorityType) {
        super(src, "img");
        this.loading = loading;
        this.fetchPriority = fetchPriority;
        this._html = $("<img>")
            .attr("alt", "Could not load Image :(")
            .attr("loading", this.loading)
            .attr("fetchPriority", this.fetchPriority) as JQuery<HTMLImageElement>;
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
    constructor(src: string, loading: LoadingType, fetchPriority: FetchPriorityType) {
        super(src, "iframe");
        this.loading = loading;
        this.fetchPriority = fetchPriority;
        this._html = $("<iframe></iframe>")
            .attr("src", this.src)
            .attr("loading", this.loading)
            .attr("fetchPriority", this.fetchPriority) as JQuery<HTMLIFrameElement>;
    }
}

/**
 * A type for all objects which can be addressed in any way
 */
type JsonAdressableObject = {
    id: string; //a UNIQUE id
}

/**
 * Type for the Page-Objects in pages.json (or pages.js)
 */
type JsonPage = JsonAdressableObject & {
    img: JsonMedia;
    is_360?: boolean;
    is_panorama?: boolean;
    initial_direction?: number;
    clickables?: JsonClickable[];
    inlineObjects?: JsonInlineObject[];
}

type JsonMedia = {
    //see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video for video
    //and https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img for img
    /*
    normal src paths can be absolute OR
    they can be relative to document root (e.g. '/images/img.jpg' -> 'https://rheingau-gymnasium.de/images/img.jpg') OR
    they can be relative to img1 (e.g. 'test.jpg' -> 'img1/test.jpg' -> 'https://rheingau-gymnasium.de/current-path/img1/test.jpg').
    */
    src?: string;
    srcMin?: string;
    srcMax?: string;
    type?: MediaType | "auto";
    loading?: LoadingType | "auto";     //works for img, iframe
    fetchPriority?: FetchPriorityType;  //works for img, iframe
    //video attributes
    poster?: string;
    autoplay?: boolean;
    loop?: boolean;
    muted?: boolean
    preload?: VideoPreloadType;
    //iframe attributes

};

type JsonInlineObject = {
    x: number | string;
    y: number | string;
    position: InlineObjectPosition;
    goto?: string;
    animationType?: AnimationType;
    type: InlineObjectType; //which kind of object this is (e.g. a clickable, text, etc.)
}

/**
 * A type which represents a clickable object in the pages json file (pages.json or pages.js)
 */
type JsonClickable = JsonInlineObject & {
    title: string;
    goto: string;
    icon?: IconType;
    backward?: boolean; //depreciated use animationType instead
    type?: "clickable";
    animationType?: PageAnimations;
    // targetType?: ClickableType; //on what kind of object this clickable points
}

type JsonCustomObject = JsonInlineObject & {
    htmlId: string; //the id of the js object (the object must be created and appended to the DOM before this js is executed)
    type?: "custom";
    animationType?: CustomAnimations;
}

type JsonTextField = JsonInlineObject & JsonAdressableObject & {
    content: string;
    title?: string;
    footer?: string;
    cssClasses?: string[] | string; // ["class-a", "class-b"] OR "class-a class-b"
    type?: "text";
    animationType?: TextAnimations;
}

class Page {
    public readonly id: string;
    public readonly img: Media;
    public secondaryImg?: Media;
    public is_panorama = false;
    public is_360 = false;
    public initial_direction: number;
    public readonly inlineObjects: InlineObject[] = [];
    private readonly _html: JQuery<HTMLDivElement> = $("<div></div>");

    constructor(id: string, img: Media, is_panorama: boolean, is_360: boolean, initial_direction: number, ...inlineObjects: InlineObject[]) {
        this.id = id;
        this.img = img;
        this.is_360 = is_360;
        this.is_panorama = is_panorama;
        this.initial_direction = initial_direction;
        this.inlineObjects.push(...inlineObjects);
    }

    public static fromJson(jsonPage: JsonPage): Page {
        //check if everything is well formatted / check for mistakes
        if (typeof jsonPage.id !== "string" || jsonPage.id.length <= 0)
            console.error(`Id wrong formatted in page object: `, jsonPage);

        //default arguments
        return new Page(jsonPage.id, Media.fromJson(jsonPage.img), jsonPage.is_panorama ?? false,
            jsonPage.is_360 ?? false, jsonPage.initial_direction ?? 0, ...jsonPage.inlineObjects?.map(v => InlineObject.fromJson(v)) ?? [], ...jsonPage.clickables?.map(v => Clickable.fromJson(v)) ?? []);
    }

    /**
     * In 360deg IMGs there exists always 2 similar clickables and all of them will be returned
     */
    get clickables(): Clickable[] {
        return this.inlineObjects.filter(v => v instanceof Clickable) as Clickable[];
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
class InlineObject {
    public readonly x?: number;
    public readonly y?: number;
    public readonly position: InlineObjectPosition;
    public readonly type: InlineObjectType;
    public readonly animationType: AnimationType;
    public readonly goto?: string;
    private _second: boolean;
    private _html: JQuery;

    protected constructor(position: InlineObjectPosition, html: JQuery, type: InlineObjectType, animationType: AnimationType, x?: number, y?: number) {
        this.position = position;
        this._html = html;
        this._second = false;
        this.type = type;
        this.x = x;
        this.y = y;
        this.animationType = animationType;
        // x and y coordinates
        if (this.x !== undefined) {
            this._html.css("left", this.x + "%");
        }
        if (this.y !== undefined) {
            this._html.css("top", this.y + "%");
        }
    }

    protected clone(newObjectToClone?: InlineObject): InlineObject {
        if (newObjectToClone === undefined) {
            newObjectToClone = new InlineObject(this.position, this.html.clone(true), this.type, this.animationType, this.x, this.y);
        }
        newObjectToClone._html = this.html.clone(true);
        newObjectToClone._second = true;
        return newObjectToClone;
    }

    public get html(): JQuery {
        return this._html;
    }

    public get second(): boolean {
        return this._second;
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
    declare public readonly x: number;
    declare public readonly y: number;
    declare public readonly animationType: CustomAnimations;
    public readonly id: string;

    constructor(id: string, position: InlineObjectPosition, x: number, y: number, animationType?: CustomAnimations) {
        super(position, $("#" + id), "custom", animationType, x, y);
        this.id = id;
    }

    public override clone(n?: CustomObject): CustomObject {
        if (n === undefined) {
            n = new CustomObject(this.id, this.position, this.x, this.y, this.animationType);
        }
        return super.clone(n) as CustomObject;
    }
}

class TextField extends InlineObject {
    public readonly content: string;
    public readonly title?: string;
    public readonly footer?: string;
    public readonly cssClasses?: string[];
    declare public readonly animationType: TextAnimations;

    constructor(content: string, position?: InlineObjectPosition, title?: string, footer?: string, cssClasses?: string[], animationType?: TextAnimations, x?: number, y?: number) {
        super(position ?? "page", $("<div/>"), "text", animationType ?? undefined, x, y);
        this.content = content;
        this.title = title;
        this.footer = footer;
        this.cssClasses = cssClasses;
    }

    public static fromJson(json: JsonTextField): TextField {
        return new TextField(json.content, "page", json.title, json.footer,
            typeof json.cssClasses === "string" ? json.cssClasses.split(" ") : json.cssClasses, json.animationType,
            typeof json.x === "string" ? parseFloat(json.x) : json.x, typeof json.x === "string" ? parseFloat(json.x) : json.x);
    }

    public override clone(n?: TextField): TextField {
        if (n === undefined) {
            n = new TextField(this.content, this.position, this.title, this.footer, this.cssClasses, this.animationType, this.x, this.y);
        }
        return super.clone(n) as TextField;
    }
}

class Clickable extends InlineObject {
    public readonly title: string;
    declare public readonly x: number;
    declare public readonly y: number;
    declare public readonly animationType: PageAnimations;
    declare public readonly goto: string;
    // public readonly second: boolean; //360deg img
    public icon: IconType = "arrow_l";

    constructor(title: string, x: number, y: number, goto: string, icon: IconType, animationType?: PageAnimations, position?: InlineObjectPosition) {
        super(position ?? "media", $("<div></div>"), "clickable", animationType ?? "forward", x, y);
        this.title = title;
        // this.x = x;
        // this.y = y;
        this.goto = goto;
        this.icon = icon;

        this.html.addClass("clickable")
            .attr("goto", this.goto!)//todo redundant
            .append($("<div></div>")
                .addClass("title")
                .text(this.title))
            .append($("<button></button>")
                .addClass("icon")
                .addClass(this.icon));
    }

    /**
     * Creates a {@link Clickable} object from an {@link JsonClickable} object
     * @param jsonClickable
     */
    public static fromJson(jsonClickable: JsonClickable): Clickable {
        //check for mistakes
        {
            if (jsonClickable == null)
                throw `Clickable is ${jsonClickable}`;

            if (typeof jsonClickable.title !== "string" || jsonClickable.title.length <= 0)
                console.error("Clickable id wrong formatted in json clickable: ", jsonClickable);
            if (typeof jsonClickable.x !== "number") {
                let error = true;
                if (typeof jsonClickable.x === "string") {
                    try {
                        jsonClickable.x = Number.parseFloat(jsonClickable.x);
                        error = false;
                    } catch (e) {
                    }
                }
                if (error)
                    console.error("Clickable x wrong formatted in json clickable: ", jsonClickable);
            }
            if (typeof jsonClickable.y !== "number") {
                let error = true;
                if (typeof jsonClickable.y === "string") {
                    try {
                        jsonClickable.y = Number.parseFloat(jsonClickable.y);
                        error = false;
                    } catch (e) {
                    }
                }
                if (error)
                    console.error("Clickable y wrong formatted in json clickable: ", jsonClickable);
            }
        }

        //default arguments
        return new Clickable(jsonClickable.title, jsonClickable.x as number, jsonClickable.y as number,
            jsonClickable.goto, jsonClickable.icon ?? "arrow_l", jsonClickable.animationType ?? (jsonClickable.backward ? "backward" : "forward"), jsonClickable.position);
    }

    /**
     * Clone this clickable and create all html objs new (with all event)
     * @returns {Clickable}
     */
    public override clone(n?: Clickable): Clickable {
        if (n === undefined) {
            n = new Clickable(this.title, this.x, this.y, this.goto, this.icon, this.animationType, this.position); //cloned clickables are considered as second clickables (relevant for 360deg img)
        }
        return super.clone(n) as Clickable;
    }
}

window.onresize = function () {
    let bgImgs: JQuery<HTMLImageElement> = $(".bg");
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
}

window.onpopstate = function () {
    let pgs = $(".page");
    pgs.removeClass("show");
    if (window.location.hash !== "")
        $("#" + idPrefix + window.location.hash.slice(1)).addClass("show");
    else
        pgs.eq(0).addClass("show");
}

function goTo(pg: string | undefined, animationType: "backward"): void;
function goTo(pg: string, animationType: PageAnimations): void;
function goTo(pg: string | undefined, animationType: PageAnimations) {
    if (finished_last) {
        finished_last = false;

        let next = pages.find(v => v.id === pg!.substring(idPrefix.length))!;
        let prev = pages.find(v => v.id === $(".page.show").attr("id")!.substring(idPrefix.length))!;
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
        createLastestClickable(next.clickables.filter(v => v.goto === prev.id));
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
        console.log("lastest lclickable", i.goto, i.goto === lastest, i);
        i?.html.addClass("lastest-clickable");
    }
}

function createHtml(json: JsonPage[]) {
    let scrollSensitivity = 20;

    for (let jsonPage of json) {
        let page = Page.fromJson(jsonPage);
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
            console.log(clickable.title, clickable.goto);
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
        } else {
            console.error("cannot determine event type because Media Type is not known (or not implemented)\nContinuing with 'load' as event type, but FIX THIS");
            event = "load";
        }
        page.img.html
            .addClass("bg")
            // .attr("initial_direction", page.initial_direction)
            .on(event, function () {
                console.log(`Media Loaded: ${page.img.src}`)
                // let self = $(this);
                let self = page.img.html;

                self.removeClass("fill-width");
                self.removeClass("fill-height");
                let imgRatio: number;
                if (page.img.isImage(self)) {
                    imgRatio = self.get(0)!.naturalWidth / self.get(0)!.naturalHeight;
                    //remove panorama if screen is big enough
                    if (page.is_panorama && self.get(0)!.naturalWidth <= window.innerWidth) {
                        page.is_panorama = false;
                        page.html.removeClass("pg_panorama");
                    }

                    let onVisible = (pageElements?: MutationRecord[], observer?: MutationObserver) => {
                        // console.log("st")
                        // console.info("onVisible params", pageElements, "B:", observer);

                        if (self.is(":hidden")) {
                            return;
                        }
                        //initial direction
                        if (page.is_panorama) {
                            let initialDirection = (page.initial_direction / 100) * self.width()!;
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
                    } else {
                        // console.log("obsever")
                        let observer = new MutationObserver(onVisible);
                        observer.observe(page.html.get(0)!, {
                            attributeFilter: ["style", "class"]
                        });
                    }

                } else if (page.img.isVideo(self)) {
                    imgRatio = self.get(0)!.videoWidth / self.get(0)!.videoHeight;
                } else if (page.img.isIframe()) {
                    return; //all resizing has to be done by the iframe itself
                } else {
                    throw "Need to add handling for MediaType: " + page.img.type;
                }
                let screenRatio = window.innerWidth / window.innerHeight;
                if (imgRatio > screenRatio)
                    self.addClass("fill-width");
                else
                    self.addClass("fill-height");
            })
            .on("error", function () {
                console.error("error")
                console.warn("Error loading Media", page.img)
                if (page.img.isImage())
                    page.img.html.attr("src", baustellenFotoUrl);
                else if (page.img.isVideo()) {
                    page.img.html
                        .attr("poster", baustellenFotoUrl)
                        .prop("controls", false)
                    // .removeAttr("src")
                    // .removeAttr("preload")
                    // .removeAttr("type");
                } else if (page.img.isIframe()) {
                    page.img.html
                        //the plain html text
                        .attr("srcdoc", '<!DOCTYPE html>' +
                            '<html lang="de">' +
                            '<head>' +
                            '    <meta charset="UTF-8">' +
                            '    <title>Baustelle</title>' +
                            '</head>' +
                            '<body>' +
                            '<img src="./img1/baustelle.png" alt="Baustelle :)" style="width: 100%;height: 100%;">' +
                            '</body>' +
                            '</html>')
                }
            });
        //add src last so that error and load events aren't triggered before we add the event handler
        if (page.img.isImage()) {
            page.img.html.attr("src", page.img.src);
        } else if (page.img.isVideo()) {
            page.img.html
                .prop("controls", true)
                .append($("<source>"));

            //firefox dispatches error events on last <source> tag, so we need to handle them there
            page.img.html.find("source").last()
                .on("error", e => page.img.html.trigger("error", e));

            //add src last so that we won't trigger error event too early
            page.img.html.find("source").last().attr("type", "video/mp4")
                .attr("src", page.img.src);

            //should be redundant
            if ((page.img.html.get(0) as HTMLVideoElement).readyState > 0) {
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
            .append(
                $("<div></div>")
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
            console.log("is_360")
            //add second clickables for second img in 360deg IMGs
            page.addInlineObjects(...page.clickables.filter(v => v.position=="media"&&(!v.second)).map(v => v.clone()));
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
                    if (this.scrollLeft - page.img.html.width()! < scrollSensitivity) {
                        return;
                    }
                    self.scrollLeft(this.scrollLeft - page.img.html.width()!);
                } else if (self.scrollLeft()! < scrollSensitivity) {
                    // if new scroll would trigger this event again
                    if (this.scrollWidth - this.clientWidth - (this.scrollLeft + page.img.html.width()!) < scrollSensitivity) {
                        return;
                    }
                    self.scrollLeft(this.scrollLeft + page.img.html.width()!);
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
    let json = pagesJson;
    createHtml(json);
    if (window.location.hash !== "") {
        $("#" + idPrefix + window.location.hash.slice(1)).addClass("show");
    } else {
        $(".page").eq(0).addClass("show");
    }
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

init("pages.js");