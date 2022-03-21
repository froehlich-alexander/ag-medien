import {ListTile} from "../build/js/Widgets.js";
import {ColorPicker} from "../build/js/colorpicker.js";


$("body")
    .addClass("dark");
let l = new ListTile();

let colorPicker = new ColorPicker().show();
colorPicker.build()
    .appendTo("body");
