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

type ImageType = "img" | "video";
type IconType = "arrow_l" | "arrow_r" | "arrow_u" | "arrow_d";

class Media {
    _src: string;
    _type: ImageType = "img"
    #html: JQuery<HTMLImageElement | HTMLVideoElement>;

    public static readonly imgFileEndings = ["png", "jpeg", "jpg"];
    public static readonly videoFileEndings = ["mp4", "webm"];

    constructor(src: string, type?: ImageType | "auto") {
        this._src = src;
        this.type = type;
        if (this.type === "img") {
            this.#html = $("<img>")
                .prop("alt", "Could not load Image :(") as JQuery<HTMLImageElement>;
        } else if (this.type === "video") {
            this.#html = $("<video></video>")
                .text("HTML Video is not supported / Could not load video") as JQuery<HTMLVideoElement>;
        } else {
            throw "Type not specified"
        }
    }

    public clone() {
        let n = new Media(this.src, this.type);
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

    get src() {
        return this._src;
    }

    set src(value) {
        this._src = value;
    }

    get type() {
        return this._type;
    }

    set type(value: ImageType | undefined | "auto") {
        if (value === "auto") {
            let fileEnding = this._src.split(".")[this._src.split(".").length - 1];
            if (Media.imgFileEndings.indexOf(fileEnding)>-1) {
                this._type = "img";
            }
            else if (Media.videoFileEndings.indexOf(fileEnding) > -1) {
                this._type = "video";
            }
            else {
                console.warn("Please add the file ending to the list\n'img' is used as default");
                this._type = "img";
            }
        } else {
            this._type = value ?? this._type;
        }
    }
}

/**
 * Type for the Page-Objects in pages.json (or pages.js)
 */
type JsonPage = {
    id: string,
    img: {
        //see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video for video
        //and  for img
        src?: string,
        srcMin?: string,
        srcMax?: string,
        type?: ImageType | "auto",
        poster?: string
    };
    is_360?: boolean;
    is_panorama?: boolean;
    initial_direction?: number;
    clickables: {
        title: string;
        x: number;
        y: number;
        goto?: string;
        icon?: IconType;
        backward?: boolean;
    }[]
}

function makeDefaultJsonPage(jsonPage: JsonPage) {
    jsonPage.is_360 = jsonPage.is_360 ?? false;
    jsonPage.is_panorama = jsonPage.is_panorama ?? false;
    jsonPage.initial_direction = jsonPage.initial_direction ?? 0;
    jsonPage.img.type = jsonPage.img.type ?? "auto";
    for (let i of jsonPage.clickables) {
        i.icon = i.icon ?? "arrow_l";
    }
}

function checkJsonPageForMistakes(jsonPage: JsonPage) {
    if (typeof jsonPage.id !== "string" || jsonPage.id.length <= 0)
        console.error(`Id wrong formatted in page object: `, jsonPage);
    if (jsonPage.img == null)
        console.error(`Image wrong formatted in page object: `, jsonPage);
    if (typeof jsonPage.img.src !== "string" || jsonPage.img.src.length <= 0)
        console.error(`Image src wrong formatted in page object: `, jsonPage);
    if (typeof jsonPage.id !== "string" || jsonPage.id.length <= 0)
        console.error(`Id wrong formatted in page object: `, jsonPage);
    if (jsonPage.clickables == null)
        console.error(`Clickables not specified in page object: `, jsonPage);

    for (let i of jsonPage.clickables) {
        if (typeof i.title !== "string" || i.title.length <= 0)
            console.error(`Clickable id wrong formatted in page object: `, jsonPage, "clickable: ", i);
        if (typeof i.x !== "number") {
            let error = true;
            if (typeof i.x === "string") {
                try {
                    i.x = Number.parseFloat(i.x);
                    error = false;
                } catch (e) {
                }
            }
            if (error)
            console.error(`Clickable x wrong formatted in page object: `, jsonPage, "clickable: ", i);
        }

        if (typeof i.y !== "number") {
            let error = true;
            if (typeof i.y === "string") {
                try {
                    i.y = Number.parseFloat(i.y);
                    error = false;
                } catch (e) {
                }
            }
            if (error)
                console.error(`Clickable y wrong formatted in page object: `, jsonPage, "clickable: ", i);
        }
    }
}

function improveMedia(jsonPage: JsonPage): JsonPage {
    makeDefaultJsonPage(jsonPage);
    checkJsonPageForMistakes(jsonPage);

    if (window.innerWidth > 768) {
        //desktop
        jsonPage.img.src = jsonPage.img.srcMax ?? (jsonPage.img.src ?? jsonPage.img.srcMin);
    } else {
        //mobile
        jsonPage.img.src = jsonPage.img.srcMin ?? (jsonPage.img.src ?? jsonPage.img.srcMax);
    }
    return jsonPage;
}

class Page {
    id: string;
    img: Media;
    secondaryImg?: Media;
    #is_panorama = false;
    #is_360 = false;
    #initial_direction: number = 0;
    #clickables: Clickable[] = [];
    #secondClickables: Clickable[] = []; //only relevant in 360deg img because there exist each clickable 2 times
    #html: JQuery<HTMLDivElement> = $("<div></div>");

    constructor(id: string, img: Media, is_panorama = undefined, is_360 = undefined, initial_direction = undefined) {
        this.id = id;
        this.img = img;
        if (is_panorama !== undefined) {
            this.is_panorama = is_panorama;
        }
        if (is_360 !== undefined) {
            this.is_360 = is_360;
        }
        this.initial_direction = initial_direction;
    }

    get is_panorama() {
        return this.#is_panorama;
    }

    set is_panorama(value: boolean | undefined | number) {
        this.#is_panorama = value === true;
    }

    get is_360() {
        return this.#is_360;
    }

    set is_360(value: boolean | undefined | null) {
        this.#is_360 = value === true;
    }

    get initial_direction(): number {
        return this.#initial_direction;
    }

    set initial_direction(value: number | undefined) {
        if (typeof value === "number")
            this.#initial_direction = value;
    }

    /**
     * @returns {Clickable[]}
     */
    get clickables() {
        return this.#clickables;
    }

    /**
     *
     * @returns {Clickable[]}
     */
    get secondClickables() {
        return this.#secondClickables;
    }

    /**
     * Returns <b>all</b> clickables (that means in 360deg img there will always be 2 clickables with the same id, etc.)
     * @returns {Clickable[]}
     */
    get allClickables() {
        console.log("all cloick", this.clickables, this.secondClickables, this.#clickables.concat(this.#secondClickables))
        return this.#clickables.concat(this.#secondClickables);
    }

    get html() {
        return this.#html;
    }
}

class Clickable {
    title: string;
    x: number;
    y: number;
    goto?: string;
    #icon: IconType = "arrow_l";
    #backward = false;
    #html: JQuery = $("<div></div>");

    constructor(title: string, x: number, y: number, goto?: string, icon?: IconType, backward?: boolean) {
        this.title = title;
        this.x = x;
        this.y = y;
        this.goto = goto;
        this.icon = icon;
        if (backward !== undefined) {
            this.backward = backward;
        }
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

    get icon(): IconType {
        return this.#icon;
    }

    set icon(value: IconType | null | undefined) {
        if (value != null)
            this.#icon = value;
    }

    get backward(): boolean {
        return this.#backward;
    }

    set backward(value) {
        this.#backward = value === true;
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
        console.log("pre", jsonPage.is_panorama)
        improveMedia(jsonPage);
        console.log("after", jsonPage)
        let page = new Page(jsonPage.id, new Media(jsonPage.img.src!, jsonPage.img.type));
        //let page = new Page(jsonPage.id, new Image(jsonPage.img));

        pages.push(page);

        page.initial_direction = jsonPage.initial_direction;
        page.is_panorama = jsonPage.is_panorama;
        page.is_360 = jsonPage.is_360;
        // page.is_360 = page.is_360 != null ? page.is_360 : false;
        // page.is_panorama = (page.is_panorama != null ? page.is_panorama : false) || page.is_360;

        //is mobile device
        //via user agent
        // if (/(iPhone|iPod|iPad|blackberry|android|Kindle|htc|lg|midp|mmp|mobile|nokia|opera mini|palm|pocket|psp|sgh|smartphone|symbian|treo mini|Playstation Portable|SonyEricsson|Samsung|MobileExplorer|PalmSource|Benq|Windows Phone|Windows Mobile|IEMobile|Windows CE|Nintendo Wii)/.test(navigator.userAgent))
        //or via screen size
        if (window.innerWidth <= 768 && page.img.isImage()) {
            page.is_panorama = true;
        }

        for (let clickable of jsonPage.clickables.map(jsonClickable => new Clickable(jsonClickable.title,
            jsonClickable.x, jsonClickable.y, jsonClickable.goto, jsonClickable.icon, jsonClickable.backward))) {
            page.clickables.push(clickable);
            console.log("title", clickable.title)

            let gotoExist = json.filter(value => value.id === clickable.goto).length > 0;
            if (!gotoExist) {
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
                    .on("click", gotoExist ? () => {
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
                console.warn("Error loading Media")
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