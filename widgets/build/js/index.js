import { ListTile } from "./Widgets.js";
import { ColorPicker } from "./colorpicker.js";
$("body")
    .addClass("dark");
let l = new ListTile();
let colorPicker = new ColorPicker().show();
colorPicker.build()
    .appendTo("body");
