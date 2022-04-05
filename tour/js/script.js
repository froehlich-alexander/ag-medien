var finished_last = true;
let idPrefix = "tour_pg_";
let lastScroll = 0;
let imgFolder = "./img1";
let baustellenFotoUrl = imgFolder + "/baustelle.png";

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
        if (!backward) {
            $(".page.show").addClass("walk_in_out");
            let o = $("#" + pg);
            o.addClass("show");
            o.addClass("walk_in_in");
            setTimeout(function () {
                $(".page.walk_in_in").removeClass("walk_in_in");
                $(".page.walk_in_out").removeClass("show")
                    .removeClass("walk_in_out");
                finished_last = true;
            }, 500);
        } else {
            $(".page.show").addClass("walk_out_out");
            $("#" + pg).addClass("show")
                .addClass("walk_out_in");
            setTimeout(function () {
                $(".page.walk_out_in").removeClass("walk_out_in");
                let o = $(".page.walk_out_out");
                o.removeClass("show");
                o.removeClass("walk_out_out");
                finished_last = true;
            }, 500);
        }
        window.location.hash = pg.substring(idPrefix.length, pg.length);
        adjust_clickables();
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

function createHtml(json) {
    scrollSensitivity = 20;

    console.log(json);
    for (let page of json) {
        let clickables = [];
        for (let clickable of page.clickables) {
            let gotoExist = json.filter(value => value.id == clickable.goto).length > 0;
            if (!gotoExist) {
                console.log("Id '" + clickable.goto + "' does not exist");
            }
            clickables.push($("<div></div>")
                .addClass("clickable")
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

                if (self.attr("initial_direction")) {
                    let initialDirection = (self.attr("initial_direction") / 100) * self.width();
                    self.scrollLeft(initialDirection);
                    console.log("inittial dir")
                    console.log(self.attr("src"))
                }

                if (self.closest(".deg360").length >= 1) {
                    self.closest(".pg_wrapper")
                        .scrollLeft(self.width());
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

        if (page.is_panorama) {
            img.attr("initial_direction", page.initial_direction);
        }

        if (page.is_360 || page.is_panorama) {
            console.log("is_360")
            let bgContainer = $("<div></div>")
                .addClass("bg_container")
                .append(img)
                .append(clickables);

            let pageElement = $("<div></div>")
                .addClass("page")
                .attr("id", idPrefix + page.id)
                .toggleClass("pg_panorama", page.is_panorama)
                .addClass("deg360")
                .append(
                    $("<div></div>")
                        .addClass("pg_wrapper")
                        .append(bgContainer)
                        .append(bgContainer.clone(true)))
                .appendTo("body");

            pageElement.find(".pg_wrapper").on("scroll", function () {
                console.log("scroll")
                let self = $(this);
                if (this.scrollWidth - this.clientWidth - self.scrollLeft() < scrollSensitivity) {
                    if (self.scrollLeft() < scrollSensitivity) {
                        return;
                    }
                    console.log("left")
                    self.scrollLeft(self.scrollLeft() - self.find("img").width());
                } else if (self.scrollLeft() < scrollSensitivity) {
                    console.log("r")
                    self.scrollLeft(self.scrollLeft() + self.find("img").width());
                }
            });
        } else {
            $("<div></div>")
                .addClass("page")
                .attr("id", idPrefix + page.id)
                .toggleClass("pg_panorama", page.is_panorama)
                .append(
                    $("<div></div>")
                        .addClass("pg_wrapper")
                        .append(img)
                        .append(clickables)
                )
                .appendTo("body");
        }
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