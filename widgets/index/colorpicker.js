import {SelectBox, ContentBox, ListTile, SelectBoxItem, Text} from "../build/js/Widgets.js";
import {ColorPicker} from "../build/js/colorpicker.js";
import {Overlay} from "../build/js/Overlay.js";
import {SelectMenu, SelectMenuItem} from "../build/js/SelectMenu.js";
import {Widget} from "../build/js/Widget.js";


// $("body")
//     .addClass("dark");
// let l = new ListTile();
//
// let colorPicker = new ColorPicker().show();
// let overlay = new Overlay(colorPicker);
// overlay.build()
//     .appendTo("body");

let b = new SelectBox()
    .addItem(new SelectBoxItem().setId("hello1").setLabel("hasssssssssssssssssssssssddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddsssssssssssssssssssllo"))
    .addItem(new SelectBoxItem().setId("hello2").setLabel("hsdfgsallo"))
    .addItem(new SelectBoxItem().setId("he4llo").setLabel("halsdfgdlo"))
    .addItem(new SelectBoxItem().setId("hel5lo").setLabel("hallgdsfgo"))
    .addItem(new SelectBoxItem().setId("he6llo").setLabel("haldsfglo"))
    .addItem(new SelectBoxItem().setId("hel8lo").setLabel("haldsfglo"))
    .addItem(new SelectBoxItem().setId("he7llo").setLabel("hallsfdgo"))
    .show();
b.setChecked(0, true);
b.build()
    .appendTo("body");


// new SelectMenu()
//     .setTitle("HMMMM")
//     .setItems([new SelectMenuItem().setLabel("sdfkjh")])
//     .show()
//     .build()
//     .appendTo("body")
//     .css("left", 0);

// let i = new Text().set("ljlsdkvhlxskvh");
// let j = new Text().set("ökölakfsd");
// let a = new ContentBox()
//     .show()
//     .addItems(
//         i,
//         new Text().set("Hmm"),
//         j,
//         new Text().set("a"),
//         new Text().set("j"));
// a.build();
// a.removeItems(i, j);
// console.log(a.items.map(value => value.value));
