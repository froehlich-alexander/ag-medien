import {ContentBox, ListTile, Text} from "../build/js/Widgets.js";
import {ColorPicker} from "../build/js/colorpicker.js";
import {Overlay} from "../build/js/Overlay.js";
import {SelectMenu, SelectMenuItem} from "../build/js/SelectMenu.js";
import {Widget} from "../build/js/Widget.js";


$("body")
    .addClass("dark");
// let l = new ListTile();
//
// let colorPicker = new ColorPicker().show();
// let overlay = new Overlay(colorPicker);
// overlay.build()
//     .appendTo("body");


// new SelectMenu()
//     .setTitle("HMMMM")
//     .setItems([new SelectMenuItem().setLabel("sdfkjh")])
//     .show()
//     .build()
//     .appendTo("body")
//     .css("left", 0);

let i = new Text().set("ljlsdkvhlxskvh");
let j = new Text().set("ökölakfsd");
let a = new ContentBox()
    .show()
    .addItems(
        i,
        new Text().set("Hmm"),
        j,
        new Text().set("a"),
        new Text().set("j"));
a.build();
a.removeItems(i, j);
console.log(a.items.map(value => value.value));
