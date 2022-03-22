var finished_last = true;
let idPrefix = "tour_pg_";

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
        let clickables = $(".clickable");
        if (clickables.eq(i).offset().left + clickables.eq(i).outerWidth(true) > clickables.eq(i).parent().offset().left + clickables.eq(i).parent().outerWidth(true))
            clickables.eq(i).addClass("right");
    }
    // for (var a = 0; a < clickables.length; ++a) {
    //     if ($(".clickable:eq(" + a + ")").offset().left + $(".clickable:eq(" + a + ")").outerWidth(true) > $(".clickable:eq(" + a + ")").parent().offset().left + $(".clickable:eq(" + a + ")").parent().outerWidth(true))
    //         $(".clickable:eq(" + a + ")").addClass("right");
    // }
}

function createHtml(jsonString) {
    // let json = JSON.parse(jsonString);
    let json = jsonString;
    console.log(json);
    for (let page of json) {
        let clickables = [];
        for (let clickable of page.clickables) {
            clickables.push($("<div></div>")
                .addClass("clickable")
                .append($("<div></div>")
                    .addClass("title")
                    .text(clickable.title))
                .append($("<button></button>")
                    .addClass("icon")
                    .addClass(clickable.icon)
                    .on("click", () => {
                        goTo(idPrefix + clickable.goto, clickable.backward);
                    }))
                .css("left", clickable.x + "%")
                .css("top", clickable.y + "%")
                .attr("data-backward", clickable.backward != null ? clickable.backward : null));
        }

        let imgUrl = "./img/" + page.img;
        $("<div></div>")
            .addClass("page")
            .attr("id", idPrefix + page.id)
            .addClass(page.is_panorama ? "pg_panorama" : null)
            .append(
                $("<div></div>")
                    .addClass("pg_wrapper")
                    .append($("<img>")
                        .addClass("bg")
                        .attr("src", imgUrl)
                        .on("load", function () {
                            $(this).removeClass("fill-width");
                            $(this).removeClass("fill-height");
                            let imgRatio = this.naturalWidth / this.naturalHeight;
                            let screenRatio = window.innerWidth / window.innerHeight;
                            if (imgRatio > screenRatio)
                                $(this).addClass("fill-width");
                            else
                                $(this).addClass("fill-height");
                            // adjust_clickables();
                        }).each(function () {
                            if (this.complete) {
                                $(this).trigger('load');
                            }
                        })
                    )
                    .append(clickables)
            )
            .appendTo("body");
    }
    adjust_clickables();
}

function init(pagesJsonPath) {
    $.ajax(pagesJsonPath)
        .done(function (json) {
            $(() => {
                createHtml(json);
                if (window.location.hash !== "") {
                    $("#" + idPrefix + window.location.hash.slice(1)).addClass("show");
                } else {
                    $(".page").eq(0).addClass("show");
                }
            });
        });
}

init("pages.json");