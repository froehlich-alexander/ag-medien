

//transforms the OLD html structure to the NEW json structure
$(() => {
    let pages = $(".page");
    let json = [];

    for (let i = 0; i < pages.length; i++) {
        let p = pages.eq(i);
        let a = {};
        a.id = p.attr("id").substring("tour_pg_".length);
        a.img = p.find("img").attr("src").substring("img/".length);
        a.is_panorama = p.hasClass("pg_panorama");
        a.clickables = [];
        let cl = p.find(".clickable");
        for (let j = 0; j < cl.length; j++) {
            let b = {};
            b.title = cl.eq(j).find(".title").text();
            b.x = cl.eq(j).attr("data-x")
            b.y = cl.eq(j).attr("data-y")
            b.goto = cl.eq(j).attr("data-goto")
            try {
                b.icon = cl.eq(j).find(".icon").get(0).classList[1] != null ? cl.eq(j).find(".icon").eq(0).get(0).classList[1] : "arrow_l";
            } catch (e) {
                console.log(b);
                console.log(cl.eq(j));
            }
            if (cl.attr("data-backward") != null) {
                b.backward = cl.eq(j).attr("data-backward") === "true";
            }
            a.clickables.push(b)
        }
        json.push(a)
    }
    console.log(pages)
    console.log(json)
    console.log(JSON.stringify(json))
});