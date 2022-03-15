$(document).ready(function(){
    if(window.location.hash!=="")
        $("#tour_pg_"+window.location.hash.slice(1)).addClass("show");
    else
        $(".page:eq(0)").addClass("show");
    for(var a=0;a<$(".bg").length;++a){
        var imgRatio=$(".bg")[a].naturalWidth/$(".bg")[a].naturalHeight;
        var screenRatio=window.innerWidth/window.innerHeight;
        if(imgRatio>screenRatio)
            $($(".bg")[a]).addClass("fill-width");
        else
            $($(".bg")[a]).addClass("fill-height");
    }
    for(let a=0;a<$(".clickable").length;++a){
        $($(".clickable")[a]).css("left",$($(".clickable")[a]).attr("data-x")+"%");
        $($(".clickable")[a]).css("top",$($(".clickable")[a]).attr("data-y")+"%");
        $($(".clickable")[a]).find(".icon").click(function(){goTo($($(".clickable")[a]).attr("data-goto"))});
    }
    adjust_clickables();
});
$(".bg").on('load',function(){
    var imgRatio=this.naturalWidth/this.naturalHeight;
    var screenRatio=window.innerWidth/window.innerHeight;
    if(imgRatio>screenRatio)
        $(this).addClass("fill-width");
    else
        $(this).addClass("fill-height");
});
window.onresize=function(){
    $(".bg").removeClass("fill-width");
    $(".bg").removeClass("fill-height");
    for(var a=0;a<$(".bg").length;++a){
        var imgRatio=$(".bg")[a].naturalWidth/$(".bg")[a].naturalHeight;
        var screenRatio=window.innerWidth/window.innerHeight;
        if(imgRatio>screenRatio)
            $($(".bg")[a]).addClass("fill-width");
        else
            $($(".bg")[a]).addClass("fill-height");
    }
    adjust_clickables();
}
window.onpopstate=function(){
    $(".page").removeClass("show");
    if(window.location.hash!=="")
        $("#tour_pg_"+window.location.hash.slice(1)).addClass("show");
    else
        $(".page:eq(0)").addClass("show");
}
function goTo(pg){
    $(".page.show").addClass("walk_out_forward");
    $(".page.show").removeClass("show");
    $("#tour_pg_"+pg).addClass("show");
    setTimeout(function(){
        $(".page.walk_out_forward").removeClass("show");
        $(".page.walk_out_forward").removeClass("walk_out_forward");
    },500);
    window.location.hash=pg;
    adjust_clickables();
}
function adjust_clickables(){
    $(".clickable").removeClass("right");
    for(var a=0;a<$(".clickable").length;++a){
        if($(".clickable:eq("+a+")").offset().left+$(".clickable:eq("+a+")").outerWidth(true)>$(".clickable:eq("+a+")").parent().offset().left+$(".clickable:eq("+a+")").parent().outerWidth(true))
            $(".clickable:eq("+a+")").addClass("right");
    }
}