// import * as $ from 'jquery'

var finished_last = true;
let idPrefix = "tour_pg_";
let imgFolder = "./img1";
let baustellenFotoUrl = imgFolder + "/baustelle.png";
let animationDuration = 500;
let lastest = "";
let pages: Page[] = [];
//jce editor joomla
//filezilla
//test

type MediaType = "img" | "video" |"iframe";
type IconType = "arrow_l" | "arrow_r" | "arrow_u" | "arrow_d";

/**
 * This class holds the media element for the page. This could be an image, a video, etc. (see {@link MediaType} for more options)<br>
 */
class Media {
    public src: string;
    private _type!: MediaType;
    #html: JQuery<HTMLImageElement | HTMLVideoElement>;

    //video attributes
    public readonly poster: string;
    public readonly autoplay: boolean;
    public readonly loop: boolean;
    public readonly muted: boolean

    public static readonly imgFileEndings = ["png", "jpeg", "jpg", "gif", "svg", "webp", "apng", "avif"];
    public static readonly videoFileEndings = ["mp4", "webm", "ogg", "ogm", "ogv", "avi", ""];

    constructor(src: string, type: MediaType | "auto", poster: string, autoplay: boolean, loop: boolean, muted: boolean) {
        this.src = src;
        this.autoplay = autoplay;
        this.loop = loop;
        this.muted = muted;
        this.poster = poster;
        this.type = type;
        if (this.type === "img") {
            this.#html = $("<img>")
                .prop("alt", "Could not load Image :(") as JQuery<HTMLImageElement>;
        } else if (this.type === "video") {
            this.#html = $("<video></video>")
                .text("HTML Video is not supported / Could not load video")
                .attr("poster", this.poster)
                .prop("autoplay", this.autoplay)
                .prop("loop", this.loop)
                .prop("muted", this.muted) as JQuery<HTMLVideoElement>;
        } else {
            throw "Type not specified"
        }
    }

    public static fromJson(jsonMedia: JsonMedia): Media {
        //check for mistakes
        if (jsonMedia == null)
            throw `Media is ${jsonMedia}`;
        if (!jsonMedia.src && !jsonMedia.srcMin && !jsonMedia.srcMax)
            console.error(`Media source is not given in media object: `, jsonMedia);

        //higher / lower resolution
        let src;
        if (window.innerWidth > 768) {
            //desktop
            src = jsonMedia.srcMax ?? (jsonMedia.src ?? jsonMedia.srcMin);
        } else {
            //mobile
            src = jsonMedia.srcMin ?? (jsonMedia.src ?? jsonMedia.srcMax);
        }
        //default parameters on absence
        return new Media(src!, jsonMedia.type ?? "auto", jsonMedia.poster ?? "", jsonMedia.autoplay ?? false, jsonMedia.loop ?? false, jsonMedia.muted ?? false);
    }

    public clone() {
        let n = new Media(this.src, this.type, this.poster, this.autoplay, this.loop, this.muted);
        n.#html = this.#html.clone(true);
        return n;
    }

    public isImage(self = this.html): self is JQuery<HTMLImageElement> {
        return this._type === "img";
    }

    public isVideo(self = this.html): self is JQuery<HTMLVideoElement> {
        return this._type === "video";
    }

    get html() {
        return this.#html;
    }

    get type(): MediaType {
        return this._type;
    }

    set type(value: MediaType | "auto") {
        if (value === "auto") {
            let fileEnding = this.src.split(".")[this.src.split(".").length - 1];
            if (Media.imgFileEndings.indexOf(fileEnding) > -1) {
                this._type = "img";
            } else if (Media.videoFileEndings.indexOf(fileEnding) > -1) {
                this._type = "video";
            } else {
                console.warn("Please add the file ending to the list\n'img' is used as default");
                this._type = "img";
            }
        } else {
            this._type = value;
        }
    }
}

/**
 * Type for the Page-Objects in pages.json (or pages.js)
 */
type JsonPage = {
    id: string,
    img: JsonMedia;
    is_360?: boolean;
    is_panorama?: boolean;
    initial_direction?: number;
    clickables: JsonClickable[]
}

type JsonMedia = {
    //see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video for video
    //and https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img for img
    src?: string;
    srcMin?: string;
    srcMax?: string;
    type?: MediaType | "auto";
    //video attributes
    poster?: string;
    autoplay?: boolean;
    loop?: boolean;
    muted?: boolean
};

type JsonClickable = {
    title: string;
    x: number;
    y: number;
    goto?: string;
    icon?: IconType;
    backward?: boolean;
}

class Page {
    public readonly id: string;
    public readonly img: Media;
    public secondaryImg?: Media;
    public is_panorama = false;
    public is_360 = false;
    public initial_direction: number;
    public readonly clickables: Clickable[];
    public readonly secondClickables: Clickable[] = []; //only relevant in 360deg img because there exist each clickable 2 times
    readonly #html: JQuery<HTMLDivElement> = $("<div></div>");

    constructor(id: string, img: Media, is_panorama: boolean, is_360: boolean, initial_direction: number, clickables: Clickable[]) {
        this.id = id;
        this.img = img;
        this.is_360 = is_360;
        this.is_panorama = is_panorama;
        this.initial_direction = initial_direction;
        this.clickables = clickables;
    }

    public static fromJson(jsonPage: JsonPage): Page {
        //check if everything is well formatted / check for mistakes
        if (typeof jsonPage.id !== "string" || jsonPage.id.length <= 0)
            console.error(`Id wrong formatted in page object: `, jsonPage);

        //default arguments
        return new Page(jsonPage.id, Media.fromJson(jsonPage.img), jsonPage.is_panorama ?? false,
            jsonPage.is_360 ?? false, jsonPage.initial_direction ?? 0, jsonPage.clickables.map(v => Clickable.fromJson(v)));
    }

    /**
     * Returns <b>all</b> clickables (that means in 360deg img there will always be 2 clickables with the same id, etc.)
     * @returns {Clickable[]}
     */
    get allClickables() {
        console.log("all cloick", this.clickables, this.secondClickables, this.clickables.concat(this.secondClickables))
        return this.clickables.concat(this.secondClickables);
    }

    get html() {
        return this.#html;
    }
}

class Clickable {
    public readonly title: string;
    public readonly x: number;
    public readonly y: number;
    public goto: string;
    public icon: IconType = "arrow_l";
    public backward = false;
    #html: JQuery = $("<div></div>");

    constructor(title: string, x: number, y: number, goto: string, icon: IconType, backward: boolean) {
        this.title = title;
        this.x = x;
        this.y = y;
        this.goto = goto;
        this.icon = icon;
        this.backward = backward;
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
        return new Clickable(jsonClickable.title, jsonClickable.x, jsonClickable.y, jsonClickable.goto ?? "", jsonClickable.icon ?? "arrow_l", jsonClickable.backward ?? false);
    }

    /**
     * Clone this clickable and create all html objs new (with all event)
     * @returns {Clickable}
     */
    public clone() {
        let n = new Clickable(this.title, this.x, this.y, this.goto, this.icon, this.backward);
        n.#html = this.#html.clone(true);
        return n;
    }

    get html() {
        return this.#html;
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

function goTo(pg: string | undefined, backward: true): void;
function goTo(pg: string, backward: boolean): void;
function goTo(pg: string | undefined, backward: boolean) {
    console.log(pg)
    if (finished_last) {
        finished_last = false;
        if (backward) {
            pg = idPrefix + lastest;
        }

        let next = pages.find(v => v.id === pg!.substring(idPrefix.length))!;
        let prev = pages.find(v => v.id === $(".page.show").attr("id")!.substring(idPrefix.length))!;
        next.html.addClass("show");
        adjust_clickables();
        lastest = prev.id;
        console.log(lastest)
        if (!backward) {
            prev.html.addClass("walk_in_out");
            next.html.addClass("walk_in_in");
            setTimeout(function () {
                $(".page.walk_in_in").removeClass("walk_in_in");
                $(".page.walk_in_out").removeClass("show")
                    .removeClass("walk_in_out");
                finished_last = true;
            }, animationDuration);
        } else {
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
        createLastestClickable(next.allClickables.filter(v => v.goto === prev.id));
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
        console.log("pre", jsonPage.is_panorama);
        console.log("after", jsonPage)
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
        if (window.innerWidth <= 768 && page.img.isImage()) {
            page.is_panorama = true;
        }

        // for (let clickable of jsonPage.clickables.map(jsonClickable => new Clickable(jsonClickable.title,
        //     jsonClickable.x, jsonClickable.y, jsonClickable.goto, jsonClickable.icon, jsonClickable.backward))) {
        //     page.clickables.push(clickable);
        for (let clickable of page.clickables){
            console.log("title", clickable.title)

            let gotoExists = json.filter(value => value.id === clickable.goto).length > 0;
            if (!gotoExists) {
                console.log("Id '" + clickable.goto + "' does not exist");
            }
            clickable.html
                .addClass("clickable")
                .attr("goto", clickable.goto!)//todo redundant
                .append($("<div></div>")
                    .addClass("title")
                    .text(clickable.title))
                .append($("<button></button>")
                    .addClass("icon")
                    .addClass(clickable.icon)
                    .on("click", gotoExists ? () => {
                        goTo(idPrefix + clickable.goto, clickable.backward);
                    } : () => {
                        console.log("Cannot go to next page because '" + clickable.goto + "' does not exist");
                    }))
                .css("left", clickable.x + "%")
                .css("top", clickable.y + "%");
            // .attr("data-backward", clickable.backward != null ? clickable.backward : null);
        }

        let imgUrl = imgFolder + "/" + page.img.src;
        let event;
        if (page.img.isImage())
            event = "load";
        else if (page.img.isVideo()) {
            event = "loadedmetadata";
        } else {
            throw "idk"
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
                console.warn("Error loading Media", page.img)
                if (page.img.isImage())
                    page.img.html.attr("src", baustellenFotoUrl);
                else if (page.img.isVideo())
                    null;
            });
        if (page.img.isImage()) {
            page.img.html.attr("src", imgUrl);
        } else {
            page.img.html.append($("<source>")
                .attr("src", imgUrl)
                .attr("type", "video/mp4"))
                .attr("preload", "metadata")
                .attr("controls", "");
            console.log("Video", (page.img.html.get(0) as HTMLVideoElement).readyState)
            if ((page.img.html.get(0) as HTMLVideoElement).readyState > 0) {
                page.img.html.trigger("load");
            }
        }
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
                .append(page.clickables.map(v => v.html)));

        if (page.is_360) {
            console.log("is_360")
            page.secondClickables.push(...page.clickables.map(v => v.clone()));
            page.secondaryImg = page.img.clone();
            //second img
            let bgContainer1 = $("<div></div>")
                .addClass("bg_container")
                .append(page.secondaryImg.html)
                .append(page.secondClickables.map(v => v.html));

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
        } else {
            // page.html.children(".pg_wrapper")
            //     .append(page.imgHtml)
            //     .append(page.clickables.map(v => v.html));
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
    let json = pagesJson;
    $.ajax(pagesJsonPath)
        .done(function (data) {
            //testing...
            // let json = data;
            $(() => {
                createHtml(json);
                if (window.location.hash !== "") {
                    $("#" + idPrefix + window.location.hash.slice(1)).addClass("show");
                } else {
                    $(".page").eq(0).addClass("show");
                }
            });
        })
        .catch(function () {
                console.log("Error fetching the json file");
                //    for testing
                $(() => {
                    createHtml(json);
                    if (window.location.hash !== "") {
                        $("#" + idPrefix + window.location.hash.slice(1)).addClass("show");
                    } else {
                        $(".page").eq(0).addClass("show");
                    }
                });
            }
        );
}

init("pages.js");
console.warn(pages);