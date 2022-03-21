import {ListTile} from "./Widgets.js";
// import * as $ from './jquery';
import {ColorPicker} from "./colorpicker.js";

$("body")
    .addClass("dark");
/*
let items = [];
for (let i = 0; i < 100; i++) {
    items[i] = new SelectMenuItem<string>()
        .setSelected(false)
        .setLabel("TEST")
        .setValue("Hello")
        .setCheckbox(true)
        .setIcon(new Icon().set("edit", IconType.material));
}

let selectMenu = new SelectMenu()
    .setTitle("Hello")
    .setItems(items)
    .on({
        all: (obj, ...o) => {
            console.log(obj);
            for (let i of o) {
                console.log(i);
            }
        },
    })
    .enableButtons(true);

selectMenu.build();
selectMenu.show();
selectMenu.domObject.appendTo("body");
console.log(selectMenu.domObject);
console.log(selectMenu.domObject.filter(":visible"));
 */


// let observer = new MutationObserver(() => {
//     console.log("objserver")
// });
// let o = $("<div/>")
//     .text("test")
//     .appendTo("body").hide();
// observer.observe(o.get()[0], {
//     // attributes: true,
//     attributeFilter: ["style"]
// });
// o.show();

// let box = new ButtonBox()
//     .addButton(Button.Ok(), FlexAlign.center, FlexAlign.end)
//     .addButton(Button.Cancel(), FlexAlign.end)
//     .addButton(Button.Ok(), FlexAlign.start)
//     .addButton(Button.Cancel(), FlexAlign.end)
//     .addButton(Button.Ok(), FlexAlign.start)
//     .addButton(Button.Cancel(), FlexAlign.end)
//     .addButton(Button.Ok(), FlexAlign.start)
//     .addButton(Button.Cancel(), FlexAlign.end);
// box.show().build().appendTo("body");
// let a = $("<div/>")
//     .text("hello")
//     .appendTo("body");
//     a.outerHeight(a.outerHeight());

// let b = new Top()
//     .setLabel("HELLO")
//     .show();
// b.on({
//     all: (event) => {
//         console.log(event.type);
//         console.log(event.target);
//     }
// })
//     .build()
//     .appendTo("body");

//
// let items = [];
// for (let i = 0; i < 100; i++) {
//     items[i] = new SelectMenuItem<string>()
//         .setSelected(false)
//         .setLabel("TEST")
//         .setValue("Hello")
//         .setCheckbox(true)
//         .setIcon(new Icon().set("edit", IconType.material));
// }
//
// let selectMenu = new SelectMenu()
//     .setTitle("Hello")
//     .setItems(items)
//     // .on({
//     //     all: (obj, ...o) => {
//     //         console.log(obj);
//     //         for (let i of o) {
//     //             console.log(i);
//     //         }
//     //     },
//     // })
//     .enableButtons(true);
// selectMenu.build().appendTo("body");
// selectMenu.show();

// console.log(document.styleSheets.item(1).href);
// console.log(document.styleSheets.item(2).href);
// console.log(ColorPickerService.getCSSVariables(document.styleSheets, ".*themes.css", null));

let l = new ListTile();


let colorPicker = new ColorPicker().show();
    // .on(undefined, new Pair("all", (event) => {
    //     console.log("event: " + event.type);
    // }))
colorPicker.build()
    .appendTo("body");
// colorPicker.show();