var finished_last = true;
let idPrefix = "tour_pg_";
let imgFolder = "./img1";
let baustellenFotoUrl = imgFolder + "/baustelle.png";
let animationDuration = 500;
let lastest = "";

class Page {
    id;
    img;
    is_panorama = false;
    is_360 = false;
    initialDirection = 50;
    clickables = [];
}

class Clickable {
    title;
    x;
    y;
    goto;
    icon = "arrow_l";
    backward = false;
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

        let next = $("#" + pg);
        let prev = $(".page.show");
        next.addClass("show");
        adjust_clickables();
        lastest = prev.attr("id").substring(idPrefix.length, prev.attr("id").length);
        console.log(lastest)
        if (!backward) {
            prev.addClass("walk_in_out");
            next.addClass("walk_in_in");
            setTimeout(function () {
                $(".page.walk_in_in").removeClass("walk_in_in");
                $(".page.walk_in_out").removeClass("show")
                    .removeClass("walk_in_out");
                finished_last = true;
            }, animationDuration);
        } else {
            prev.addClass("walk_out_out");
            next.addClass("walk_out_in");
            setTimeout(function () {
                $(".page.walk_out_in").removeClass("walk_out_in");
                $(".page.walk_out_out").removeClass("show")
                    .removeClass("walk_out_out");
                finished_last = true;
            }, animationDuration);
        }
        window.location.hash = pg.substring(idPrefix.length, pg.length);
        createLastestClickable(pg);
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

function createLastestClickable(pageId) {
    $(".clickable").removeClass("lastest-clickable");
    $("#" + pageId).find(".clickable")
        .each(function () {
            let self = $(this);
            console.log("lastest")
            if (self.attr("goto") === lastest) {
                self.addClass("lastest-clickable");
            }
        });
}

function createHtml(json) {
    let scrollSensitivity = 20;

    console.log(json);
    for (let page of json) {
        let clickables = [];
        page.is_360 = page.is_360 != null ? page.is_360 : false;
        page.is_panorama = (page.is_panorama != null ? page.is_panorama : false) || page.is_panorama;

        for (let clickable of page.clickables) {
            let gotoExist = json.filter(value => value.id == clickable.goto).length > 0;
            if (!gotoExist) {
                console.log("Id '" + clickable.goto + "' does not exist");
            }
            clickables.push($("<div></div>")
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
                .css("top", clickable.y + "%")
                .attr("data-backward", clickable.backward != null ? clickable.backward : null));
        }

        let imgUrl = imgFolder + "/" + page.img;
        let img = $("<img>")
            .addClass("bg")
            .attr("src", imgUrl)
            .attr("initial_direction", page.initial_direction != null ? page.initial_direction : 50)
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
                    // if (self.closest(".deg360").length > 0) {
                    //     self.scrollLeft(self.width());
                    //     console.log(self.width())
                    // }
                    if (self.attr("initial_direction")) {
                        let initialDirection = (self.attr("initial_direction") / 100) * self.width();
                        wrapper.scrollLeft(initialDirection);
                    }
                    adjust_clickables();
                    if (b) {
                        b.disconnect();
                    }
                }
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

        let pageElement = $("<div></div>")
            .addClass("page")
            .attr("id", idPrefix + page.id)
            .toggleClass("pg_panorama", page.is_panorama)
            .toggleClass("deg360", page.is_360)
            .append(
                $("<div></div>")
                    .addClass("pg_wrapper"));

        if (page.is_360) {
            console.log("is_360")
            let bgContainer = $("<div></div>")
                .addClass("bg_container")
                .append(img)
                .append(clickables);

            pageElement.children(".pg_wrapper")
                .append(bgContainer)
                .append(bgContainer.clone(true));

            pageElement.find(".pg_wrapper").on("scroll", function () {
                let self = $(this);
                console.log("scroll " + self.scrollLeft() + " " + this.scrollLeft);
                if (this.scrollLeft !== self.scrollLeft()) {
                    console.log("hmm")
                }
                if (this.scrollWidth - this.clientWidth - this.scrollLeft < scrollSensitivity) {
                    // if new scroll would trigger this event again
                    if (this.scrollLeft - self.find("img").width() < scrollSensitivity) {
                        return;
                    }
                    self.scrollLeft(this.scrollLeft - self.find("img").width());
                } else if (self.scrollLeft() < scrollSensitivity) {
                    // if new scroll would trigger this event again
                    if (this.scrollWidth - this.clientWidth - (this.scrollLeft + self.find("img").width()) < scrollSensitivity) {
                        return;
                    }
                    self.scrollLeft(this.scrollLeft + self.find("img").width());
                }
            });
        } else {
            pageElement.children(".pg_wrapper")
                .append(img)
                .append(clickables);
        }
        pageElement.appendTo("body");
    }
    adjust_clickables();
}

/**
 * Ajax requests to file:// endpoints do not work in chrome base browsers<br>
 * That's only relevant for testing
 * @param pagesJsonPath
 */
function init(pagesJsonPath) {
    let json = pages;
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