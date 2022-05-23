"use strict";
// import * as $ from 'jquery'
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Media_html, _Page_html, _Clickable_html;
var finished_last = true;
let idPrefix = "tour_pg_";
let imgFolder = "./img1";
let baustellenFotoUrl = imgFolder + "/baustelle.png";
let animationDuration = 500;
let lastest = "";
let pages = [];
/**
 * This class holds the media element for the page. This could be an image, a video, etc. (see {@link MediaType} for more options)<br>
 */
class Media {
    constructor(src, type, poster, autoplay, loop, muted) {
        _Media_html.set(this, void 0);
        this.src = src;
        this.autoplay = autoplay;
        this.loop = loop;
        this.muted = muted;
        this.poster = poster;
        this.type = type;
        if (this.type === "img") {
            __classPrivateFieldSet(this, _Media_html, $("<img>")
                .prop("alt", "Could not load Image :("), "f");
        }
        else if (this.type === "video") {
            __classPrivateFieldSet(this, _Media_html, $("<video></video>")
                .text("HTML Video is not supported / Could not load video")
                .attr("poster", this.poster)
                .prop("autoplay", this.autoplay)
                .prop("loop", this.loop)
                .prop("muted", this.muted), "f");
        }
        else {
            throw "Type not specified";
        }
    }
    static fromJson(jsonMedia) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        //check for mistakes
        if (jsonMedia == null)
            throw `Media is ${jsonMedia}`;
        if (!jsonMedia.src && !jsonMedia.srcMin && !jsonMedia.srcMax)
            console.error(`Media source is not given in media object: `, jsonMedia);
        //higher / lower resolution
        let src;
        if (window.innerWidth > 768) {
            //desktop
            src = (_a = jsonMedia.srcMax) !== null && _a !== void 0 ? _a : ((_b = jsonMedia.src) !== null && _b !== void 0 ? _b : jsonMedia.srcMin);
        }
        else {
            //mobile
            src = (_c = jsonMedia.srcMin) !== null && _c !== void 0 ? _c : ((_d = jsonMedia.src) !== null && _d !== void 0 ? _d : jsonMedia.srcMax);
        }
        //default parameters on absence
        return new Media(src, (_e = jsonMedia.type) !== null && _e !== void 0 ? _e : "auto", (_f = jsonMedia.poster) !== null && _f !== void 0 ? _f : "", (_g = jsonMedia.autoplay) !== null && _g !== void 0 ? _g : false, (_h = jsonMedia.loop) !== null && _h !== void 0 ? _h : false, (_j = jsonMedia.muted) !== null && _j !== void 0 ? _j : false);
    }
    clone() {
        let n = new Media(this.src, this.type, this.poster, this.autoplay, this.loop, this.muted);
        __classPrivateFieldSet(n, _Media_html, __classPrivateFieldGet(this, _Media_html, "f").clone(true), "f");
        return n;
    }
    isImage(self = this.html) {
        return this._type === "img";
    }
    isVideo(self = this.html) {
        return this._type === "video";
    }
    get html() {
        return __classPrivateFieldGet(this, _Media_html, "f");
    }
    get type() {
        return this._type;
    }
    set type(value) {
        if (value === "auto") {
            let fileEnding = this.src.split(".")[this.src.split(".").length - 1];
            if (Media.imgFileEndings.indexOf(fileEnding) > -1) {
                this._type = "img";
            }
            else if (Media.videoFileEndings.indexOf(fileEnding) > -1) {
                this._type = "video";
            }
            else {
                console.warn("Please add the file ending to the list\n'img' is used as default");
                this._type = "img";
            }
        }
        else {
            this._type = value;
        }
    }
}
_Media_html = new WeakMap();
Media.imgFileEndings = ["png", "jpeg", "jpg", "gif", "svg", "webp", "apng", "avif"];
Media.videoFileEndings = ["mp4", "webm", "ogg", "ogm", "ogv", "avi", ""];
class Page {
    constructor(id, img, is_panorama, is_360, initial_direction, clickables) {
        this.is_panorama = false;
        this.is_360 = false;
        this.secondClickables = []; //only relevant in 360deg img because there exist each clickable 2 times
        _Page_html.set(this, $("<div></div>"));
        this.id = id;
        this.img = img;
        this.is_360 = is_360;
        this.is_panorama = is_panorama;
        this.initial_direction = initial_direction;
        this.clickables = clickables;
    }
    static fromJson(jsonPage) {
        var _a, _b, _c;
        //check if everything is well formatted / check for mistakes
        if (typeof jsonPage.id !== "string" || jsonPage.id.length <= 0)
            console.error(`Id wrong formatted in page object: `, jsonPage);
        //default arguments
        return new Page(jsonPage.id, Media.fromJson(jsonPage.img), (_a = jsonPage.is_panorama) !== null && _a !== void 0 ? _a : false, (_b = jsonPage.is_360) !== null && _b !== void 0 ? _b : false, (_c = jsonPage.initial_direction) !== null && _c !== void 0 ? _c : 0, jsonPage.clickables.map(v => Clickable.fromJson(v)));
    }
    /**
     * Returns <b>all</b> clickables (that means in 360deg img there will always be 2 clickables with the same id, etc.)
     * @returns {Clickable[]}
     */
    get allClickables() {
        console.log("all cloick", this.clickables, this.secondClickables, this.clickables.concat(this.secondClickables));
        return this.clickables.concat(this.secondClickables);
    }
    get html() {
        return __classPrivateFieldGet(this, _Page_html, "f");
    }
}
_Page_html = new WeakMap();
class Clickable {
    constructor(title, x, y, goto, icon, backward) {
        this.icon = "arrow_l";
        this.backward = false;
        _Clickable_html.set(this, $("<div></div>"));
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
    static fromJson(jsonClickable) {
        var _a, _b, _c;
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
                    }
                    catch (e) {
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
                    }
                    catch (e) {
                    }
                }
                if (error)
                    console.error("Clickable y wrong formatted in json clickable: ", jsonClickable);
            }
        }
        //default arguments
        return new Clickable(jsonClickable.title, jsonClickable.x, jsonClickable.y, (_a = jsonClickable.goto) !== null && _a !== void 0 ? _a : "", (_b = jsonClickable.icon) !== null && _b !== void 0 ? _b : "arrow_l", (_c = jsonClickable.backward) !== null && _c !== void 0 ? _c : false);
    }
    /**
     * Clone this clickable and create all html objs new (with all event)
     * @returns {Clickable}
     */
    clone() {
        let n = new Clickable(this.title, this.x, this.y, this.goto, this.icon, this.backward);
        __classPrivateFieldSet(n, _Clickable_html, __classPrivateFieldGet(this, _Clickable_html, "f").clone(true), "f");
        return n;
    }
    get html() {
        return __classPrivateFieldGet(this, _Clickable_html, "f");
    }
}
_Clickable_html = new WeakMap();
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
function goTo(pg, backward) {
    console.log(pg);
    if (finished_last) {
        finished_last = false;
        if (backward) {
            pg = idPrefix + lastest;
        }
        let next = pages.find(v => v.id === pg.substring(idPrefix.length));
        let prev = pages.find(v => v.id === $(".page.show").attr("id").substring(idPrefix.length));
        next.html.addClass("show");
        adjust_clickables();
        lastest = prev.id;
        console.log(lastest);
        if (!backward) {
            prev.html.addClass("walk_in_out");
            next.html.addClass("walk_in_in");
            setTimeout(function () {
                $(".page.walk_in_in").removeClass("walk_in_in");
                $(".page.walk_in_out").removeClass("show")
                    .removeClass("walk_in_out");
                finished_last = true;
            }, animationDuration);
        }
        else {
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
    for (let jsonPage of json) {
        console.log("pre", jsonPage.is_panorama);
        console.log("after", jsonPage);
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
        for (let clickable of page.clickables) {
            console.log("title", clickable.title);
            let gotoExists = json.filter(value => value.id === clickable.goto).length > 0;
            if (!gotoExists) {
                console.log("Id '" + clickable.goto + "' does not exist");
            }
            clickable.html
                .addClass("clickable")
                .attr("goto", clickable.goto) //todo redundant
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
        }
        else {
            throw "idk";
        }
        page.img.html
            .addClass("bg")
            // .attr("initial_direction", page.initial_direction)
            .on(event, function () {
            console.log(`Media Loaded: ${page.img.src}`);
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
                        attributeFilter: ["style", "class"]
                    });
                }
            }
            else if (page.img.isVideo(self)) {
                imgRatio = self.get(0).videoWidth / self.get(0).videoHeight;
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
        });
        //add src last so that error and load events aren't triggered before we add the event handler
        if (page.img.isImage()) {
            page.img.html.attr("src", imgUrl);
        }
        else if (page.img.isVideo()) {
            page.img.html
                .attr("preload", "metadata")
                .prop("controls", true)
                .append($("<source>"));
            //firefox dispatches error events on last <source> tag, so we need to handle them there
            page.img.html.find("source").last()
                .on("error", e => page.img.html.trigger("error", e));
            //add src last so that we won't trigger error event too early
            page.img.html.find("source").last().attr("type", "video/mp4")
                .attr("src", imgUrl);
            //should be redundant
            if (page.img.html.get(0).readyState > 0) {
                page.img.html.trigger(event);
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
            .append($("<div></div>")
            .addClass("pg_wrapper"));
        //first img
        page.html.children(".pg_wrapper")
            .append($("<div></div>")
            .addClass("bg_container")
            .append(page.img.html)
            .append(page.clickables.map(v => v.html)));
        if (page.is_360) {
            console.log("is_360");
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
        else {
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
function init(pagesJsonPath) {
    let json = pagesJson;
    $.ajax(pagesJsonPath)
        .done(function (data) {
        //testing...
        // let json = data;
        $(() => {
            createHtml(json);
            if (window.location.hash !== "") {
                $("#" + idPrefix + window.location.hash.slice(1)).addClass("show");
            }
            else {
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
            }
            else {
                $(".page").eq(0).addClass("show");
            }
        });
    });
}
init("pages.js");
console.warn(pages);
//# sourceMappingURL=script.js.map