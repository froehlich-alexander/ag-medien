import {ListTile} from "../build/js/Widgets.js";
import {ColorPicker} from "../build/js/colorpicker.js";
import {Overlay} from "../build/js/Overlay.js";
import {SelectMenu, SelectMenuItem} from "../build/js/SelectMenu.js";


$("body")
    .addClass("dark");
let l = new ListTile();

let colorPicker = new ColorPicker().show();
let overlay = new Overlay(colorPicker);
overlay.build()
    .appendTo("body");
// overlay.show();

// new SelectMenu()
//     .setTitle("HMMMM")
//     .setItems([new SelectMenuItem().setLabel("sdfkjh")])
//     .show()
//     .build()
//     .appendTo("body")
//     .css("left", 0);
