import {TextInput, TextInputEvents} from "../build/js/Widgets.js";
import {Pair} from "../build/js/base.js";

let inputs = [];

for (let i = 0; i < 10; i++) {
    let input = new TextInput()
        .setId(i)
        .setPlaceHolder("Placeholder :)")
        .setLabel("Label ...")
        .show()
        .on2(TextInputEvents.change, (event, value) => {
            console.log("change" + value)
        })
        .on2(TextInputEvents.input, (event, value) => {
            console.log("input" + value)
        });
    inputs.push(input.build());
}

$("<form></form>")
    .append(inputs)
    .appendTo("body");