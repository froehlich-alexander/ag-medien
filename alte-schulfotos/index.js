function create(antikesBildUrl, neuesBildUrl) {
    let timeoutId = null;

    function onMouseMove(event) {
        const pos = Math.max(event.offsetX, 0);
        // console.log('holding and moving', pos, container.position());
        leftImg.css("width", pos + "px");
        sliderButton.css("left", pos + "px");
    }

    const container = $("<div>")
        .addClass("bild-overflow-container")
        .on("mousedown", function () {
            timeoutId = setTimeout(() => {
                container[0].addEventListener("mousemove", onMouseMove);
                timeoutId = null;
            }, 100);
        })
        .on("mouseup", function () {
            container[0].removeEventListener("mousemove", onMouseMove);
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        });

    const sliderButton = $("<div>")
        .addClass("slider-button");

    const leftImg = $("<img>")
        .attr("src", antikesBildUrl)
        .addClass("left-img");

    const leftImgContainer = $("<div>")
        .append(leftImg)
        .addClass("left-img-container");


    const rightImg = $("<img>")
        .attr("src", neuesBildUrl)
        .addClass("right-img");

    const rightImgContainer = $("<div>")
        .append(rightImg)
        .addClass("right-img-container");

    container
        .append(leftImgContainer)
        .append(rightImgContainer)
        .append(sliderButton)
        .appendTo(document.body);
}

create();
