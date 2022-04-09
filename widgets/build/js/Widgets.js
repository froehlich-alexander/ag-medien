var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var Icon_1, Button_1;
import { Mixin, mixin, Tripel } from "./base.js";
import { Widget, WidgetEvents } from "./Widget.js";
import { Font, FontWeight } from "./WidgetBase.js";
import { CheckboxContaining, ColorEditable, EventCallbacks, IconContainingEvents, Input, InputEvents, InputLabel, ItemContaining, LeadingTrailingIconContaining, OneIconContaining, SpacingEditable } from "./AbstractWidgets.js";
class Item extends Mixin {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "_index", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    get index() {
        return this._index;
    }
    set index(value) {
        this._index = value;
    }
}
const IconEvents = {
    ...WidgetEvents
};
var IconType;
(function (IconType) {
    IconType[IconType["material"] = 0] = "material";
})(IconType || (IconType = {}));
let Icon = Icon_1 = class Icon extends Widget {
    // public static Info = () => Icon.of("info", IconType.material);
    // public static Info = () => Icon.of("info", IconType.material);
    constructor() {
        super();
        Object.defineProperty(this, "type", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "value", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_clickable", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        this.mixinConstructor(SpacingEditable);
        // createMixinFields(this, new SpacingEditable());
    }
    build(force = true) {
        if (!this.built && force) {
            super.build(true)
                .addClass("icon-widget")
                .css("cursor", this._clickable ? "pointer" : null)
                .on("click", () => {
                this.dispatchEvent(WidgetEvents.clicked);
            });
            this.buildCallback();
        }
        if (this.built) {
            switch (this.type) {
                case IconType.material: {
                    this.domObject.text(this.value)
                        .addClass("material-icons");
                    break;
                }
                case null: {
                    this.domObject.text(null)
                        .removeClass("material-icons");
                    this.hide();
                }
            }
            if (this.value == null) {
                this.hide();
            }
        }
        if (this.built) {
            return this.domObject;
        }
    }
    setClickable(clickable) {
        this._clickable = clickable;
        return this;
    }
    get clickable() {
        return this._clickable;
    }
    set(value, type) {
        this.value = value;
        if (type != undefined) {
            this.type = type;
            switch (type) {
                case IconType.material:
                    console.assert(typeof this.value === "string", "The type of the value of this icon must be string when type == " + IconType[IconType.material]);
            }
        }
        this.build(false);
        return this;
    }
    getType() {
        return this.type;
    }
    getValue() {
        return this.value;
    }
    copy(other) {
        super.copy(other);
        this.setClickable(other._clickable);
        this.set(other.value, other.type);
        return this;
    }
    static of(value, type) {
        return new Icon_1().set(value, type);
    }
};
Object.defineProperty(Icon, "Close", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: () => Icon_1.of("close", IconType.material)
});
Object.defineProperty(Icon, "Edit", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: () => Icon_1.of("edit", IconType.material)
});
Object.defineProperty(Icon, "Done", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: () => Icon_1.of("done", IconType.material)
});
Object.defineProperty(Icon, "Back", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: () => Icon_1.of("arrow_back", IconType.material)
});
Object.defineProperty(Icon, "Next", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: () => Icon_1.of("arrow_forward", IconType.material)
});
Object.defineProperty(Icon, "Delete", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: () => Icon_1.of("delete", IconType.material)
});
Object.defineProperty(Icon, "Cancel", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: () => Icon_1.of("cancel", IconType.material)
});
Object.defineProperty(Icon, "Info", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: () => Icon_1.of("info", IconType.material)
});
Icon = Icon_1 = __decorate([
    mixin(SpacingEditable)
], Icon);
const ButtonEvents = {
    ...WidgetEvents
};
let Button = Button_1 = class Button extends Widget {
    // public static Agree = () => new Button().setLabel("Agree").setIcon(Icon.of("done", IconType.material));
    // public static Agree = () => new Button().setLabel("Agree").setIcon(Icon.of("done", IconType.material));
    // public static Agree = () => new Button().setLabel("Agree").setIcon(Icon.of("done", IconType.material));
    // public static Agree = () => new Button().setLabel("Agree").setIcon(Icon.of("done", IconType.material));
    constructor() {
        super();
        Object.defineProperty(this, "label", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.mixinConstructor();
        this.enableIcon(true);
    }
    build(suppressCallback = false) {
        super.build(true)
            .addClass("button-widget")
            .append(this.getIcon().build())
            .append($("<div></div>")
            .text(this.label)
            .addClass("text"))
            .on({
            click: () => {
                this.dispatchEvent(ButtonEvents.clicked);
            }
        });
        this.buildCallback(suppressCallback);
        return this.domObject;
    }
    getLabel() {
        return this.label;
    }
    setLabel(value) {
        this.label = value;
        return this;
    }
};
// private readonly icon: Icon | null;
Object.defineProperty(Button, "Cancel", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: () => new Button_1().setLabel("Cancel").setIcon(Icon.Cancel())
});
Object.defineProperty(Button, "Ok", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: () => new Button_1().setLabel("Ok").setIcon(Icon.Done())
});
Object.defineProperty(Button, "Back", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: () => new Button_1().setLabel("Back").setIcon(Icon.of("arrow_back", IconType.material))
});
Object.defineProperty(Button, "Next", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: () => new Button_1().setLabel("Next").setIcon(Icon.of("arrow_forward", IconType.material))
});
Object.defineProperty(Button, "Agree", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: () => new Button_1().setLabel("Agree").setIcon(Icon.Done())
});
Object.defineProperty(Button, "Delete", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: () => new Button_1().setLabel("Delete").setIcon(Icon.Delete())
});
Object.defineProperty(Button, "Save", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: () => new Button_1().setLabel("Save").setIcon(Icon.of("save", IconType.material))
});
Object.defineProperty(Button, "Activate", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: () => new Button_1().setLabel("Activate").setIcon(Icon.of("favorite", IconType.material))
});
Object.defineProperty(Button, "Reset", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: () => new Button_1().setLabel("Reset").setIcon(Icon.of("restart_alt", IconType.material))
});
Button = Button_1 = __decorate([
    mixin(OneIconContaining)
], Button);
var FlexAlign;
(function (FlexAlign) {
    FlexAlign["start"] = "start";
    FlexAlign["center"] = "center";
    FlexAlign["end"] = "end";
})(FlexAlign || (FlexAlign = {}));
// class _ButtonBox extends Widget<WidgetEvents> {
//     private buttons: Tripel<Button, FlexAlign, FlexAlign>[] = [];//hello
//     private startEndSpacing: number = 10;
//     private itemSpacing: number = 1;
//     private alignSpacing: number = 10;
//
//     constructor() {
//         super();
//         this.on({
//             "sizeSet": () => {
//                 //set spacer width
//                 //doesn't work when the widget has display: none!!!
//                 let completeButtonWidth = 0;
//                 let availableWidth = this.domObject.innerWidth();
//                 let spacers = this.domObject.find(".spacer");
//                 for (let i of this.buttons) {
//                     completeButtonWidth += i.first.domObject.outerWidth();
//                     console.log("a");
//                     console.log("button" + i.first.domObject.outerWidth(true));
//                 }
//                 let massEinheit = (availableWidth - completeButtonWidth) / (spacers.filter(".start-end-spacer").length * this.startEndSpacing + spacers.filter(".align-spacer").length * this.alignSpacing + spacers.filter(".button-spacer").length * this.itemSpacing);
//                 spacers.filter(".start-end-spacer")
//                     .width((massEinheit * this.startEndSpacing * 100) / availableWidth + "%");
//                 spacers.filter(".button-spacer")
//                     .width((massEinheit * this.itemSpacing * 100) / availableWidth + "%");
//                 spacers.filter(".align-spacer")
//                     .width((massEinheit * this.alignSpacing * 100) / availableWidth + "%");
//                 console.log(completeButtonWidth);
//                 console.log(massEinheit);
//                 console.log(this.domObject.innerWidth());
//                 console.log(spacers);
//                 console.log(spacers.filter(".start-end-spacer"));
//             }
//         });
//     }
//
//     build(): JQuery<HTMLElement> {
//         super.build(true)
//             .addClass("button-box-widget");
//
//         let completeButtonWidth = 0;
//         //add spacer at the start / end of the button box (main axis)
//         this.domObject.append($("<div></div>")
//             .addClass("spacer")
//             .addClass("start-end-spacer"));
//
//         for (let i of this.buttons) {
//             i.first.build()
//                 .css("align-self", i.third);
//         }
//
//         let count = 0;
//         for (let i of this.buttons.filter(value => value.second == FlexAlign.start)) {
//             count++;
//             this.domObject.append(i.first.domObject)
//                 .append($("<div></div>")
//                     .addClass("spacer")
//                     .addClass(count < this.buttons.filter(value => value.second == FlexAlign.start).length ? "button-spacer" : "align-spacer"));
//         }
//         count = 0;
//         for (let i of this.buttons.filter(value => value.second == FlexAlign.center)) {
//             count++;
//             this.domObject.append(i.first.domObject)
//                 .append($("<div></div>")
//                     .addClass("spacer")
//                     .addClass(count < this.buttons.filter(value => value.second == FlexAlign.center).length ? "button-spacer" : "align-spacer"));
//         }
//         count = 0;
//         for (let i of this.buttons.filter(value => value.second == FlexAlign.end)) {
//             count++;
//             //don't append after last button
//             this.domObject.append(i.first.domObject)
//                 .append($("<div></div>")
//                     .addClass("spacer")
//                     .addClass(count < this.buttons.filter(value => value.second == FlexAlign.end).length ? "button-spacer" : "start-end-spacer"));
//         }
//
//         this.buildCallback();
//         return this.domObject;
//     }
//
//     public addButton(button: Button, mainAlign: FlexAlign = FlexAlign.center, crossAlign: FlexAlign = FlexAlign.center): this {
//         console.assert(!this.built);
//         button.setInheritVisibility(true);
//         this.children.set(this.buttons.push(new Tripel<Button, FlexAlign, FlexAlign>(button, mainAlign, crossAlign)).toString(10), button);
//         return this;
//     }
//
//     public isEmpty(): boolean {
//         return this.buttons.length > 0;
//     }
//
//     /**
//      * Set the spacing<br>
//      * the actual value doesn't really matter, the important thing is their ratio
//      * @param startEnd the spacing at the start (right) and end (left)
//      * @param align the spacing between the different alignments
//      * @param item the spacing between all buttons of the same alignment
//      */
//     public setSpacing(startEnd: number, align: number, item: number): this {
//         this.setStartEndSpacing(startEnd);
//         this.setAlignSpacing(align);
//         this.setItemSpacing(item);
//         return this;
//     }
//
//     getStartEndSpacing(): number {
//         return this.startEndSpacing;
//     }
//
//     setStartEndSpacing(value: number): this {
//         this.startEndSpacing = value;
//         return this;
//     }
//
//     getItemSpacing(): number {
//         return this.itemSpacing;
//     }
//
//     setItemSpacing(value: number): this {
//         this.itemSpacing = value;
//         return this;
//     }
//
//     getAlignSpacing(): number {
//         return this.alignSpacing;
//     }
//
//     setAlignSpacing(value: number): this {
//         this.alignSpacing = value;
//         return this;
//     }
// }
/**
 * This class uses a flex container (display: flex)<br>
 * The items are aligned vertically (cross axis) via align-self (or align-items as default value)<br>
 * The items are aligned horizontally (main axis) via auto margin<br>
 * Padding is used for space at the start / end of the whole container<br>
 * CSS column-gap is used for space between the items
 */
class FlexBox extends Widget {
    constructor() {
        super();
        Object.defineProperty(this, "items", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "startSpacing", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "endSpacing", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "itemSpacing", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    buildAlign(align) {
        let items = this.items.filter(value => value.second == align);
        let i = 0;
        for (let item of items) {
            this.domObject.append(item.first.build()
                .css("align-self", item.third));
            if (i == 0) {
                item.first.domObject.addClass("start-of-" + align);
            }
            if (i >= items.length - 1) {
                item.first.domObject.addClass("end-of-" + align);
            }
            i++;
        }
        if (items.length > 0) {
            this.domObject.addClass(align);
        }
    }
    build(suppressCallback = false) {
        super.build(true)
            .addClass("flex-box-widget");
        //add spacer at the start of the item box (main axis)
        // this.domObject.append($("<div></div>")
        //     .addClass("spacer")
        //     .addClass("start-spacer"));
        //
        //main-axis-align = start (left)
        // let itemLength = this.items.length;
        // let itemCount = 0;
        // let count = 0;
        // let startItemCount = this.items.filter(value => value.second == FlexAlign.start).length;
        // for (let i of this.items.filter(value => value.second == FlexAlign.start)) {
        //     count++;
        //     itemCount++;
        //     this.domObject.append(i.first.domObject)
        //         .append($("<div></div>")
        //             .addClass("spacer")
        //             .addClass(count < this.items.filter(value => value.second == FlexAlign.start).length ? "item-spacer" : (itemCount < itemLength ? "align-spacer" : "start-end-spacer")));
        // }
        //
        // //main-axis-align = center
        // count = 0;
        // for (let i of this.items.filter(value => value.second == FlexAlign.center)) {
        //     count++;
        //     itemCount++;
        //     this.domObject.append(i.first.domObject)
        //         .append($("<div></div>")
        //             .addClass("spacer")
        //             .addClass(count < this.items.filter(value => value.second == FlexAlign.center).length ? "item-spacer" : (itemCount < itemLength ? "align-spacer" : "start-end-spacer")));
        // }
        //
        // //main-axis-align = end (right)
        // count = 0;
        // for (let i of this.items.filter(value => value.second == FlexAlign.end)) {
        //     count++;
        //     itemCount++;
        //     //don't append after last button
        //     this.domObject.append(i.first.domObject)
        //         .append($("<div></div>")
        //             .addClass("spacer")
        //             .addClass(count < this.items.filter(value => value.second == FlexAlign.end).length ? "item-spacer" : "start-end-spacer"));
        // }
        for (let i of Object.values(FlexAlign)) {
            this.buildAlign(i);
        }
        // Util.addCssProperty(this.domObject, "padding-left", this.startSpacing);
        // Util.addCssProperty(this.domObject, "padding-right", this.endSpacing);
        this.buildCallback(suppressCallback);
        return this.domObject;
    }
    rebuild(suppressCallback = false) {
        super.rebuild(true);
        this.domObject
            .css("column-gap", this.itemSpacing)
            .css("padding-left", this.startSpacing)
            .css("padding-right", this.endSpacing);
        this.items.map(v => v.first.rebuild());
        this.rebuildCallback(suppressCallback);
        return this.domObject;
    }
    addItem(item, mainAlign = FlexAlign.center, crossAlign = FlexAlign.center) {
        console.assert(!this.built);
        item.setInheritVisibility(true);
        this.addChild("flexbox" + this.items.push(new Tripel(item, mainAlign, crossAlign)).toString(10), item);
        return this;
    }
    isEmpty() {
        return this.items.length > 0;
    }
    /**
     * Set the spacing related to this flex container<br>
     * The values can be any css <length> value
     * @param start the spacing at the start (right)
     * @param end the spacing at the end (left)
     * @param item the spacing between the items.
     * This is using the column-gap flex property
     */
    setSpacing(start, end, item) {
        this.setStartSpacing(start);
        this.setEndSpacing(end);
        this.setItemSpacing(item);
        return this;
    }
    getStartSpacing() {
        return this.startSpacing;
    }
    getEndSpacing() {
        return this.endSpacing;
    }
    setStartSpacing(value) {
        this.startSpacing = value;
        return this;
    }
    setEndSpacing(value) {
        this.endSpacing = value;
        return this;
    }
    setStartEndSpacing(value) {
        this.setStartSpacing(value);
        return this.setEndSpacing(value);
    }
    getItemSpacing() {
        return this.itemSpacing;
    }
    setItemSpacing(value) {
        this.itemSpacing = value;
        return this;
    }
}
class ButtonBox extends FlexBox {
    constructor() {
        super();
        this.on(undefined, EventCallbacks.setHeight);
        this.setSpacing("2rem", "2rem", "1rem");
    }
    build(suppressCallback = false) {
        super.build(true)
            .addClass("button-box-widget");
        this.buildCallback(suppressCallback);
        return this.domObject;
    }
    addButton(button, mainAlign = FlexAlign.center, crossAlign = FlexAlign.center) {
        return super.addItem(button, mainAlign, crossAlign);
    }
}
let Text = class Text extends Widget {
    constructor() {
        super();
        Object.defineProperty(this, "value", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_font", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.mixinConstructor();
        // createMixinFields(this, new ColorEditable(), new SpacingEditable());
        this._font = new Font();
    }
    set(value) {
        this.value = value;
        return this;
    }
    build(suppressCallback = false) {
        super.build(true)
            .addClass("text-widget");
        this.buildCallback(suppressCallback);
        return this.domObject;
    }
    rebuild(suppressCallback = false) {
        super.rebuild(true);
        this.domObject
            .text(this.value)
            .css("font-size", this._font.size)
            .css("font-weight", this._font.weight)
            .css("font-family", this._font.family);
        this.rebuildCallback(suppressCallback);
        return this.domObject;
    }
    get() {
        return this.value;
    }
    setFont(font) {
        this._font = font;
        return this;
    }
    setFontSize(fontSize) {
        this._font.setSize(fontSize);
        return this;
    }
    setFontWeight(fontWeight) {
        this._font.setWeight(fontWeight);
        return this;
    }
    setFontFamily(fontFamily) {
        this._font.setFamily(fontFamily);
        return this;
    }
    get font() {
        return this._font;
    }
};
Text = __decorate([
    mixin(ColorEditable, SpacingEditable)
], Text);
const TopEvents = {
    ...WidgetEvents,
    ...IconContainingEvents
};
let Top = class Top extends FlexBox {
    constructor() {
        super();
        Object.defineProperty(this, "label", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_defaultTop", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        this.mixinConstructor(OneIconContaining);
        // createMixinFields(this, new OneIconContaining());
        this.setIcon(Icon.Close());
        // this.enableIcon(true);
        this.label = new Text().setFontWeight(FontWeight.bold);
        this.addItem(this.label);
        this.addItem(this.getIcon(), FlexAlign.end);
        this.setSpacing("20px", "20px", "10px");
        this.on(undefined, EventCallbacks.setHeight);
    }
    build(suppressCallback = false) {
        super.build(true)
            .addClass("title-widget");
        // .append(this.label.build(suppressCallback))
        // .append(this.icon != null ? this.icon.build() : null);
        this.buildCallback(suppressCallback);
        return this.domObject;
    }
    rebuild(suppressCallback = false) {
        super.rebuild(true);
        this.domObject
            .toggleClass("default", this._defaultTop);
        this.rebuildCallback(suppressCallback);
        return this.domObject;
    }
    getLabel() {
        return this.label.get();
    }
    setLabel(value) {
        this.label.set(value);
        return this;
    }
    get defaultTop() {
        return this._defaultTop;
    }
    setDefaultTop(defaultTop) {
        this._defaultTop = defaultTop;
        return this;
    }
};
Top = __decorate([
    mixin(OneIconContaining)
], Top);
let ListTile = class ListTile extends FlexBox {
    constructor() {
        super();
        Object.defineProperty(this, "_label", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Text()
        });
        Object.defineProperty(this, "_description", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Text()
        });
        this.mixinConstructor(SpacingEditable, LeadingTrailingIconContaining, ColorEditable, CheckboxContaining);
        // createMixinFields(this, new ColorEditable(), new SpacingEditable(), new LeadingTrailingIconContaining());
        this._label.setInheritVisibility(true);
        this._description.setInheritVisibility(false);
        // this.children.set("lable", this._label);
        // this.children.set("description", this._description);
        this.addItem(this.getLeadingIcon(), FlexAlign.start);
        this.addItem(this._label, FlexAlign.start);
        this.addItem(this.getTrailingIcon(), FlexAlign.end);
        this.addItem(this.checkbox, FlexAlign.end);
        this.setSpacing("1rem", "1rem", "1rem");
        this.enableCheckbox(false);
    }
    build(suppressCallback = false) {
        super.build(true)
            .addClass("list-tile-widget");
        // .append(this.getLeadingIcon().build())
        // .append(this._label.build())
        // .append(this.getTrailingIcon().build());
        this.buildColor();
        this.buildSpacing();
        this.buildCheckbox();
        this.buildCallback(suppressCallback);
        return this.domObject;
    }
    rebuild(suppressCallback = false) {
        super.rebuild(true);
        this.rebuildCheckbox();
        this.rebuildCallback(suppressCallback);
        return this.domObject;
    }
    get label() {
        return this._label;
    }
    setLabel(label) {
        this._label.set(label);
        return this;
    }
    setDescription(description) {
        this._description.set(description);
        return this;
    }
    get description() {
        return this._description;
    }
};
ListTile = __decorate([
    mixin(Item, ColorEditable, SpacingEditable, LeadingTrailingIconContaining, CheckboxContaining)
], ListTile);
const TextInputEvents = {
    ...WidgetEvents,
    ...InputEvents
};
let TextInput = class TextInput extends Widget {
    constructor() {
        super();
        // private _id: string;
        // private _label: string;
        Object.defineProperty(this, "_placeHolder", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_minLength", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_maxLength", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // private _readonly: boolean;
        Object.defineProperty(this, "_spellcheck", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_size", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_pattern", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.mixinConstructor(Input, InputLabel);
    }
    // public build(suppressCallback: boolean = false): JQuery<HTMLElement> {
    //     super.build(suppressCallback)
    //         .addClass("text-input")
    //         .append($<HTMLInputElement>("<input>")
    //             .addClass("field")
    //             .attr("id", this._id)
    //         )
    //         .append($("<label></label>")
    //             .addClass("label")
    //             .attr("for", this._id))
    //         .append($("<span></span>")
    //             .addClass("underline"))
    //         .on("change", (event) => {
    //             this.dispatchEvent(TextInputEvents.change, [(<HTMLInputElement>event.target).value]);
    //         })
    //         .on("input", (event) => {
    //             this.dispatchEvent(TextInputEvents.input, [(<HTMLInputElement>event.target).value]);
    //         });
    //     this.buildCallback(suppressCallback);
    //     return this.domObject;
    // }
    build(suppressCallback = false) {
        super.build(suppressCallback)
            .addClass("text-input")
            .append(this.buildInput()
            .addClass("field"))
            .append(this.buildLabel()
            .addClass("label"))
            .append($("<span></span>")
            .addClass("underline"));
        // .on("change", (event) => {
        //     this.dispatchEvent(TextInputEvents.change, [(<HTMLInputElement>event.target).value]);
        // })
        // .on("input", (event) => {
        //     this.dispatchEvent(TextInputEvents.input, [(<HTMLInputElement>event.target).value]);
        // });
        this.buildCallback(suppressCallback);
        return this.domObject;
    }
    rebuild(suppressCallback = false) {
        super.rebuild(suppressCallback);
        this.rebuildInput()
            .attr("placeholder", this._placeHolder)
            .attr("minLength", this._minLength)
            .attr("maxLength", this._maxLength)
            .prop("spellcheck", this._spellcheck)
            .attr("size", this._size)
            .attr("pattern", this._pattern);
        // this.domObject.find("input")
        //     .attr("placeholder", this._placeHolder)
        //     .attr("minLength", this._minLength)
        //     .attr("maxLength", this._maxLength)
        //     .prop("readonly", this._readonly)
        //     .prop("spellcheck", this._spellcheck)
        //     .attr("size", this._size)
        //     .attr("pattern", this._pattern);
        // this.domObject.find("label")
        //     .text(this._label);
        this.rebuildLabel();
        return this.domObject;
    }
    // get value(): string {
    //     return <string>this.domObject.find("input").val();
    // }
    //
    // setValue(value: string): this {
    //     this.domObject.find("input").val(value);
    //     return this;
    // }
    // public setLabel(_label: string): this {
    //     this._label = _label;
    //     this.tryRebuild();
    //     return this;
    // }
    //
    // public setId(id: string): this {
    //     if (this.built) {
    //         throw Error("You are not allowed to change the id of an input after it has been built!!!");
    //     }
    //     this._id = id;
    //     return this;
    // }
    setPlaceHolder(placeHolder) {
        this._placeHolder = placeHolder;
        this.tryRebuild();
        return this;
    }
    setMinLength(minLength) {
        this._minLength = minLength;
        this.tryRebuild();
        return this;
    }
    setMaxLength(maxLength) {
        this._maxLength = maxLength;
        this.tryRebuild();
        return this;
    }
    // public setReadonly(readonly: boolean): this {
    //     this._readonly = readonly;
    //     this.tryRebuild();
    //     return this;
    // }
    setSpellcheck(spellcheck) {
        this._spellcheck = spellcheck;
        this.tryRebuild();
        return this;
    }
    setSize(size) {
        this._size = size;
        this.tryRebuild();
        return this;
    }
    setPattern(pattern) {
        this._pattern = pattern;
        this.tryRebuild();
        return this;
    }
    //
    // public get id() {
    //     return this._id;
    // }
    //
    // public get label(): string {
    //     return this._label;
    // }
    get placeHolder() {
        return this._placeHolder;
    }
    get minLength() {
        return this._minLength;
    }
    get maxLength() {
        return this._maxLength;
    }
    // public get readonly(): boolean {
    //     return this._readonly;
    // }
    get spellcheck() {
        return this._spellcheck;
    }
    get size() {
        return this._size;
    }
    get pattern() {
        return this._pattern;
    }
};
TextInput = __decorate([
    mixin(Input, InputLabel)
], TextInput);
let CheckBoxInput = class CheckBoxInput extends Widget {
    constructor() {
        super("input");
        Object.defineProperty(this, "_checked", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.mixinConstructor();
        this.setType("checkbox");
    }
    build(suppressCallback = false) {
        super.build(true);
        this.buildInput(this.domObject);
        this.buildCallback(suppressCallback);
        return this.domObject;
    }
    rebuild(suppressCallback = false) {
        super.rebuild(true);
        this.rebuildInput(this.domObject);
        let update = this.domObject.get(0).checked !== this._checked;
        this.domObject
            .get(0)
            .checked = this._checked;
        if (update) {
            this.dispatchEvent(InputEvents.input, [this.checked]);
            this.dispatchEvent(InputEvents.change, [this.checked]);
        }
        this.rebuildCallback(suppressCallback);
        return this.domObject;
    }
    get checked() {
        this._checked = this.domObject
            .get(0)
            .checked;
        return this._checked;
    }
    setChecked(checked) {
        this._checked = checked;
        return this;
    }
};
CheckBoxInput = __decorate([
    mixin(Input)
], CheckBoxInput);
let SelectBoxItemValue = class SelectBoxItemValue extends Widget {
    constructor() {
        super();
        Object.defineProperty(this, "_label", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_checked", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.setType("radio");
        this._checked = false;
        this.setName("42"); //we need any name so that only 1 item can be selected at once
    }
    build(suppressCallback = false) {
        super.build(true)
            .addClass("value")
            .append(this.buildInput())
            .append($("<p></p>")
            .text(this._label)
            .addClass("input-text"));
        this.buildCallback(suppressCallback);
        this.show();
        return this.domObject;
    }
    rebuild(suppressCallback = false) {
        super.rebuild(true);
        this.rebuildInput()
            .get(0)
            .checked = this._checked;
        this.rebuildCallback(suppressCallback);
        return this.domObject;
    }
    setLabel(label) {
        this._label = label;
        return this;
    }
    get label() {
        return this._label;
    }
    setChecked(checked) {
        this._checked = checked;
        return this;
    }
    get checked() {
        this._checked = this.domObject.find("input")
            .get(0)
            .checked;
        return this._checked;
    }
};
SelectBoxItemValue = __decorate([
    mixin(Input)
], SelectBoxItemValue);
let SelectBoxListItem = class SelectBoxListItem extends Widget {
    constructor() {
        super("li");
    }
    build(suppressCallback = false) {
        super.build(true)
            .append(this.buildLabel()
            .addClass("option")
            .attr("aria-hidden", "aria-hidden"));
        this.buildCallback(suppressCallback);
        return this.domObject;
    }
    rebuild(suppressCallback = false) {
        super.rebuild(true);
        this.rebuildLabel();
        this.rebuildCallback(suppressCallback);
        return this.domObject;
    }
};
SelectBoxListItem = __decorate([
    mixin(InputLabel)
], SelectBoxListItem);
class SelectBoxItem {
    constructor() {
        Object.defineProperty(this, "_value", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_listItem", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this._value = new SelectBoxItemValue();
        this._listItem = new SelectBoxListItem();
    }
    setId(id) {
        this._value.setId(id);
        this._listItem.setId(id);
        return this;
    }
    get id() {
        return this._value.id;
    }
    get value() {
        return this._value;
    }
    get listItem() {
        return this._listItem;
    }
    setLabel(label) {
        this._value.setLabel(label);
        this._listItem.setLabel(label);
        return this;
    }
    get label() {
        return this._value.label;
    }
}
const SelectBoxEvents = {
    ...WidgetEvents,
    ...InputEvents
};
let SelectBox = class SelectBox extends Widget {
    constructor() {
        super();
        Object.defineProperty(this, "_items", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "optionsViewButton", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.mixinConstructor();
        this.setIcon(Icon.of("expand_more", IconType.material));
        this.enableIcon(true);
        this.optionsViewButton = new CheckBoxInput()
            .setInheritVisibility(true)
            .show()
            .on2(InputEvents.change, (_, value) => this.domObject.find(".current")
            .toggleClass("options-view-button-checked", value));
        $(document).on("click", (event) => {
            if ($(event.target).closest(this.optionsViewButton.domObject).length < 1) {
                this.optionsViewButton.setChecked(false).tryRebuild();
            }
        });
        this.on2(SelectBoxEvents.change, (event, ...args) => console.log(args));
        this.addChild("optionsViewButton");
    }
    build(suppressCallback = false) {
        super.build(true)
            .addClass("select-box-widget")
            .append($("<div></div>")
            .addClass("current")
            .append(this.optionsViewButton.build()
            .addClass("options-view-button"))
            .append(this.getIcon().build()
            .addClass("icon")))
            .append("<ul></ul>");
        this.buildCallback(suppressCallback);
        return this.domObject;
    }
    rebuild(suppressCallback = false) {
        super.rebuild(true);
        this.domObject.find(".current").children(".value").detach();
        this.domObject.find("ul").children("li").detach();
        for (let i of this._items) {
            if (i.value.built) {
                i.value.domObject.detach();
            }
            if (i.listItem.built) {
                i.listItem.domObject.detach();
            }
        }
        this.domObject.children(".current")
            .prepend(this._items.map(value => value.value.built ? value.value.domObject : value.value.build()));
        this.domObject.children("ul")
            .append(this._items.map(value => value.listItem.built ? value.listItem.domObject : value.listItem.build()));
        for (let i of this._items) {
            i.value.rebuild();
            i.listItem.rebuild();
        }
        this.optionsViewButton.rebuild();
        this.rebuildCallback(suppressCallback);
        return this.domObject;
    }
    addItems(...items) {
        for (let item of items) {
            item.value.on2(InputEvents.input, () => this.dispatchEvent(SelectBoxEvents.input, [item.value]));
            item.value.on2(InputEvents.change, () => this.dispatchEvent(SelectBoxEvents.change, [item.value]));
            item.listItem.setInheritVisibility(true);
            let index = this._items.push(item);
            this.addChild("item" + index + "li", item.listItem);
            this.addChild("item" + index + "value", item.value);
        }
        return this;
    }
    removeItems(...items) {
        for (let item of items) {
            for (let i of this._items.splice(this._items.indexOf(item), 1)) {
                //TODO 09.04.2022 clean up event handlers
            }
        }
        return this;
    }
    setChecked(index, value = true) {
        this._items[index].value.setChecked(value)
            .tryRebuild();
        return this;
    }
    get items() {
        return this._items;
    }
};
SelectBox = __decorate([
    mixin(OneIconContaining)
], SelectBox);
let Box = class Box extends Widget {
    constructor(htmlElementType) {
        super(htmlElementType);
        this.mixinConstructor(ItemContaining, SpacingEditable);
    }
    rebuild(suppressCallback = false) {
        super.rebuild(true);
        this.rebuildItems();
        this.rebuildCallback(suppressCallback);
        return this.domObject;
    }
    build(suppressCallback = false) {
        super.build(true)
            .addClass("box");
        this.buildSpacing();
        this.buildItems();
        this.buildCallback(suppressCallback);
        return this.domObject;
    }
};
Box = __decorate([
    mixin(ItemContaining, SpacingEditable)
], Box);
class ContentBox extends Box {
    constructor(htmlElementType) {
        super(htmlElementType);
        this.on(undefined, EventCallbacks.setHeightToRemaining);
    }
    build(suppressCallback = false) {
        super.build(true)
            .addClass("default-content");
        this.buildCallback(suppressCallback);
        return this.domObject;
    }
}
export { Icon, IconEvents, IconType, Button, ButtonEvents, ButtonBox, FlexAlign, Top, TopEvents, Text, ListTile, FlexBox, TextInput, TextInputEvents, Box, ContentBox, SelectBoxItem, SelectBox, SelectBoxEvents };
//# sourceMappingURL=Widgets.js.map