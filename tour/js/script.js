var finished_last = true;
let idPrefix = "tour_pg_";
let imgFolder = "./img1";
let baustellenFotoUrl = imgFolder + "/baustelle.png";
let animationDuration = 500;
let lastest = "";
/**
 * @type {Page[]}
 */
let pages = [];
$ = jQuery;
//jce editor joomla
//filezilla

class Image {
    _src;
    /**
     * @type {"img"|"video"}
     */
    _type = "img"
    /**
     * @type {jQuery}
     */
    #html;

    constructor(src, type = undefined) {
        this.type = type;
        if (this.type === "img") {
            this.#html = $("<img>");
        } else if (this.type === "video") {
            this.#html = $("<video></video>");
        }
        this._src = src;
        this._type = type;
    }

    clone() {
        let n = new Image(this.src, this.type);
        n.#html = this.#html.clone(true);
        return n;
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

    set type(value) {
        if (typeof value === "string") {
            this._type = value;
        }
    }
}

class Page {
    id;
    /**
     * @type {Image}
     */
    img;
    /**
     * @type {Image}
     */
    secondaryImg;
    #is_panorama = false;
    #is_360 = false;
    #initial_direction = 50;
    #clickables = [];
    #secondClickables = []; //only relevant in 360deg img because there exist each clickable 2 times
    #html = $("<div></div>");

    constructor(id, img, is_panorama = undefined, is_360 = undefined, initial_direction = undefined) {
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

    set is_panorama(value) {
        this.#is_panorama = value === true;
    }

    get is_360() {
        return this.#is_360;
    }

    set is_360(value) {
        this.#is_360 = value === true;
        this.#is_panorama = this.#is_360;

    }

    get initial_direction() {
        return this.#initial_direction;
    }

    set initial_direction(value) {
        if (typeof value === "number" || typeof value === "bigint")
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
    title;
    x;
    y;
    goto;
    #icon = "arrow_l";
    #backward = false;
    #html = $("<div></div>");

    constructor(title, x, y, goto, icon = undefined, backward = undefined) {
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
    clone() {
        let n = new this.constructor(this.title, this.x, this.y, this.goto, this.icon, this.backward);
        n.#html = this.#html.clone(true);
        return n;
    }

    get html() {
        return this.#html;
    }

    get icon() {
        return this.#icon;
    }

    set icon(value) {
        if (value != null)
            this.#icon = value;
    }

    get backward() {
        return this.#backward;
    }

    set backward(value) {
        this.#backward = value === true;
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
}

window.onpopstate = function () {
    let pgs = $(".page");
    pgs.removeClass("show");
    if (window.location.hash !== "")
        $("#" + idPrefix + window.location.hash.slice(1)).addClass("show");
    else
        pgs.eq(0).addClass("show");
}

function goTo(pg, backward) {
    console.log(pg)
    if (finished_last) {
        finished_last = false;

        let next = pages.find(v => v.id === pg.substring(idPrefix.length));
        let prev = pages.find(v => v.id === $(".page.show").attr("id").substring(idPrefix.length));
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
        i?.html.addClass("lastest-clickable");
    }
}

function createHtml(json) {
    let scrollSensitivity = 20;

    console.log(json);
    for (let jsonPage of json) {
        let page = new Page(jsonPage.id, new Image(jsonPage.img.src, jsonPage.img.type));
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
        if (window.innerWidth <= 768) {
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
                .attr("goto", clickable.goto)
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
        page.img.html
            .addClass("bg")
            .attr("src", imgUrl)
            // .attr("initial_direction", page.initial_direction)
            .on("load", function () {
                let self = $(this);

                self.removeClass("fill-width");
                self.removeClass("fill-height");
                let imgRatio = this.naturalWidth / this.naturalHeight;
                let screenRatio = window.innerWidth / window.innerHeight;
                if (imgRatio > screenRatio)
                    self.addClass("fill-width");
                else
                    self.addClass("fill-height");

                //remove panorama if screen is big enough
                if (page.is_panorama && this.naturalWidth <= window.innerWidth) {
                    page.is_panorama = false;
                    page.html.removeClass("pg_panorama");
                }

                let onVisible = (a, b) => {
                    console.log("st")
                    let self = $(a[0]);
                    let wrapper = self.closest(".pg_wrapper");
                    console.log(self);
                    console.log(wrapper)

                    if (self.is(":hidden")) {
                        console.log(self.is(":hidden"))
                        return;
                    }
                    //initial direction
                    if (page.is_panorama) {
                        let initialDirection = (page.initial_direction / 100) * self.width();
                        wrapper.scrollLeft(initialDirection);
                    }
                    adjust_clickables();
                    //disconnect observer
                    if (b) {
                        b.disconnect();
                    }
                };
                if (self.is(":visible")) {
                    console.log("vis")
                    onVisible([this], null);
                } else {
                    console.log("obsever")
                    let observer = new MutationObserver(onVisible.bind(this));
                    observer.observe(this, {
                        attributeFilter: ["style", "class"]
                    });
                }
            })
            .on("error", function () {
                $(this).attr("src", baustellenFotoUrl);
            })
            .each(function () {
                if (this.complete) {
                    self.trigger('load');
                }
            });

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
                console.log("scroll " + self.scrollLeft() + " " + this.scrollLeft);
                if (this.scrollLeft !== self.scrollLeft()) {
                    console.log("hmm")
                }
                if (this.scrollWidth - this.clientWidth - this.scrollLeft < scrollSensitivity) {
                    // if new scroll would trigger this event again
                    if (this.scrollLeft - page.img.html.width() < scrollSensitivity) {
                        return;
                    }
                    self.scrollLeft(this.scrollLeft - page.img.html.width());
                } else if (self.scrollLeft() < scrollSensitivity) {
                    // if new scroll would trigger this event again
                    if (this.scrollWidth - this.clientWidth - (this.scrollLeft + page.img.html.width()) < scrollSensitivity) {
                        return;
                    }
                    self.scrollLeft(this.scrollLeft + page.img.html.width());
                }
            });
        } else {
            // page.html.children(".pg_wrapper")
            //     .append(page.imgHtml)
            //     .append(page.clickables.map(v => v.html));
        }
        page.html.appendTo("body");
    }
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