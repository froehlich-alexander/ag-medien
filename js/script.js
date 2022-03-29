var finished_last=true;
$(document).ready(function(){
    if(window.location.hash!=="")
        $("#tour_pg_"+window.location.hash.slice(1)).addClass("show");
    else
        $(".page:eq(0)").addClass("show");
    $("img.bg").one("load", function(){
        $(this).removeClass("fill-width");
        $(this).removeClass("fill-height");
        var imgRatio=this.naturalWidth/this.naturalHeight;
        var screenRatio=window.innerWidth/window.innerHeight;
        if(imgRatio>screenRatio)
            $(this).addClass("fill-width");
        else
            $(this).addClass("fill-height");
        adjust_clickables();
    }).each(function() {
        if(this.complete) {
            $(this).trigger('load');
        }
      });
    for(let a=0;a<$(".clickable").length;++a){
        $($(".clickable")[a]).css("left",$($(".clickable")[a]).attr("data-x")+"%");
        $($(".clickable")[a]).css("top",$($(".clickable")[a]).attr("data-y")+"%");
        $($(".clickable")[a]).find(".icon").click(function(){goTo($($(".clickable")[a]).attr("data-goto"),$($(".clickable")[a]).attr("data-backward")!==undefined&&$($(".clickable")[a]).attr("data-backward").length>0)});
    }

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
function goTo(pg,backward){
    if(finished_last){
        finished_last=false;
        if(!backward){
            $(".page.show").addClass("walk_in_out");
            $("#tour_pg_"+pg).addClass("show");
            $("#tour_pg_"+pg).addClass("walk_in_in");
            setTimeout(function(){
                $(".page.walk_in_in").removeClass("walk_in_in");
                $(".page.walk_in_out").removeClass("show");
                $(".page.walk_in_out").removeClass("walk_in_out");
                finished_last=true;
            },500);
        }
        else{
            $(".page.show").addClass("walk_out_out");
            $("#tour_pg_"+pg).addClass("show");
            $("#tour_pg_"+pg).addClass("walk_out_in");
            setTimeout(function(){
                $(".page.walk_out_in").removeClass("walk_out_in");
                $(".page.walk_out_out").removeClass("show");
                $(".page.walk_out_out").removeClass("walk_out_out");
                finished_last=true;
            },500);
        }
        window.location.hash=pg;
        adjust_clickables();
    }
}
function adjust_clickables(){
    $(".clickable").removeClass("right");
    for(var a=0;a<$(".clickable").length;++a){
        if($(".clickable:eq("+a+")").offset().left+$(".clickable:eq("+a+")").outerWidth(true)>$(".clickable:eq("+a+")").parent().offset().left+$(".clickable:eq("+a+")").parent().outerWidth(true))
            $(".clickable:eq("+a+")").addClass("right");
    }
}