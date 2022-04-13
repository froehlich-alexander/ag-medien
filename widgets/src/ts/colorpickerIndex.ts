import {assertType, Pair} from "./base.js";
import {ColorPicker} from "./colorpicker.js";
import "./imports.js";
import {Overlay} from "./Overlay.js";
import {Widget} from "./Widget.js";


// $("body")
//     .addClass("dark");
// let l = new ListTile();
let a = new Pair(2, 2);
assertType(a, Widget);
let colorPicker = new ColorPicker().show();
let overlay = new Overlay(colorPicker);
overlay.build()
    .appendTo("body");

// let b = new SelectBox()
//     .addItems(
//         new SelectBoxItem().setId("hello1").setLabel("hasssssssssssssssssssssssddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddsssssssssssssssssssllo"),
//         new SelectBoxItem().setId("hello2").setLabel("hsdfgsallo"),
//         new SelectBoxItem().setId("he4llo").setLabel("halsdfgdlo"),
//         new SelectBoxItem().setId("hel5lo").setLabel("hallgdsfgo"),
//         new SelectBoxItem().setId("he6llo").setLabel("haldsfglo"),
//         new SelectBoxItem().setId("hel8lo").setLabel("haldsfglo"),
//         new SelectBoxItem().setId("he7llo").setLabel("23"))
//     .show();
// b.setChecked(0, true);
// b.build()
//     .appendTo("body");
// console.log(b.items.at(-1));
// b.removeItems(b.items.at(-1)).rebuild();


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
