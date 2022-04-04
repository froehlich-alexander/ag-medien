import {valHooks} from "jquery";
import {Dialog, DialogEvents} from "./Dialog.js";
import {Widget, WidgetEvents} from "./Widget.js";
import {Mixin, mixin, MixinImplementing, Pair, Tripel} from "./base.js";
import {
    CheckboxContaining,
    ColorEditable,
    EventCallbacks, IconContainingEvents, Input, InputEvents, InputLabel, ItemContaining, ItemContainingEvents,
    LeadingTrailingIconContaining,
    OneIconContaining,
    SpacingEditable,
    Util
} from "./AbstractWidgets.js";
import {Font, FontFamily, FontSize, FontWeight} from "./WidgetBase.js";
import ChangeEvent = JQuery.ChangeEvent;

class Item extends Mixin {
    private _index: number;

    public get index(): number {
        return this._index;
    }

    public set index(value: number) {
        this._index = value;
    }
}

const IconEvents = {
    ...WidgetEvents
};
type IconEvents = (typeof IconEvents)[keyof typeof IconEvents];

enum IconType {
    material
}

@mixin(MixinImplementing, SpacingEditable)
class Icon extends Widget<IconEvents> {
    private type: IconType;
    private value: string;
    private _clickable: boolean = true;

    public static Close = () => Icon.of("close", IconType.material);
    public static Edit = () => Icon.of("edit", IconType.material);
    public static Done = () => Icon.of("done", IconType.material);
    public static Back = () => Icon.of("arrow_back", IconType.material);
    public static Next = () => Icon.of("arrow_forward", IconType.material);
    public static Delete = () => Icon.of("delete", IconType.material);
    public static Cancel = () => Icon.of("cancel", IconType.material);
    public static Info = () => Icon.of("info", IconType.material);
    // public static Info = () => Icon.of("info", IconType.material);
    // public static Info = () => Icon.of("info", IconType.material);

    constructor() {
        super();
        this.mixinConstructor(SpacingEditable);
        // createMixinFields(this, new SpacingEditable());
    }

    public build(force: boolean = true): JQuery<HTMLElement> {
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

    public setClickable(clickable: boolean): this {
        this._clickable = clickable;
        return this;
    }

    public get clickable(): boolean {
        return this._clickable;
    }

    set(value: any, type?: IconType): Icon {
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

    getType(): IconType {
        return this.type;
    }

    getValue(): string {
        return this.value;
    }

    public copy(other: this): this {
        super.copy(other);
        this.setClickable(other._clickable);
        this.set(other.value, other.type);
        return this;
    }

    static of(value: any, type?: IconType): Icon {
        return new Icon().set(value, type);
    }
}

interface Icon extends MixinImplementing, SpacingEditable<IconEvents> {
}

const ButtonEvents = {
    ...WidgetEvents
};

type ButtonEvents = (typeof IconEvents)[keyof typeof IconEvents];

class Button extends Widget<ButtonEvents> {
    private label: string;
    private icon: Icon | null;

    public static Cancel = () => new Button().setLabel("Cancel").setIcon(Icon.Cancel());
    public static Ok = () => new Button().setLabel("Ok").setIcon(Icon.Done());
    public static Back = () => new Button().setLabel("Back").setIcon(Icon.of("arrow_back", IconType.material));
    public static Next = () => new Button().setLabel("Next").setIcon(Icon.of("arrow_forward", IconType.material));
    public static Agree = () => new Button().setLabel("Agree").setIcon(Icon.Done());
    public static Delete = () => new Button().setLabel("Delete").setIcon(Icon.Delete());
    public static Save = () => new Button().setLabel("Save").setIcon(Icon.of("save", IconType.material));
    public static Activate = () => new Button().setLabel("Activate").setIcon(Icon.of("favorite", IconType.material));
    public static Reset = () => new Button().setLabel("Reset").setIcon(Icon.of("restart_alt", IconType.material));
    // public static Agree = () => new Button().setLabel("Agree").setIcon(Icon.of("done", IconType.material));
    // public static Agree = () => new Button().setLabel("Agree").setIcon(Icon.of("done", IconType.material));
    // public static Agree = () => new Button().setLabel("Agree").setIcon(Icon.of("done", IconType.material));
    // public static Agree = () => new Button().setLabel("Agree").setIcon(Icon.of("done", IconType.material));

    build(suppressCallback: boolean = false): JQuery<HTMLElement> {
        super.build(true)
            .addClass("button-widget")
            .append(this.icon != null ? this.icon.build() : null)
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

    getLabel(): string {
        return this.label;
    }

    setLabel(value: string): Button {
        this.label = value;
        return this;
    }

    getIcon(): Icon {
        return this.icon;
    }

    setIcon(value: Icon | null): Button {
        this.icon = value;
        if (this.icon != null) {
            this.icon.setInheritVisibility(true);
        }
        this.addChild("icon", this.icon);
        return this;
    }
}

enum FlexAlign {
    start = "start",
    center = "center",
    end = "end"
}

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
class FlexBox<EventType extends WidgetEvents> extends Widget<EventType> {
    private readonly items: Tripel<Widget<WidgetEvents>, FlexAlign, FlexAlign>[] = [];
    private startSpacing: string;
    private endSpacing: string;
    private itemSpacing: string;

    constructor() {
        super();
    }

    private buildAlign(align: FlexAlign | string): void {
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

    build(suppressCallback: boolean = false): JQuery<HTMLElement> {
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

    public rebuild(suppressCallback: boolean = false): JQuery<HTMLElement> {
        super.rebuild(true);
        this.domObject
            .css("column-gap", this.itemSpacing)
            .css("padding-left", this.startSpacing)
            .css("padding-right", this.endSpacing);
        this.items.map(v => v.first.rebuild());

        this.rebuildCallback(suppressCallback);
        return this.domObject;
    }

    public addItem(item: Widget<WidgetEvents>, mainAlign: FlexAlign = FlexAlign.center, crossAlign: FlexAlign = FlexAlign.center): this {
        console.assert(!this.built);
        item.setInheritVisibility(true);
        this.addChild("flexbox" + this.items.push(new Tripel(item, mainAlign, crossAlign)).toString(10), item);
        return this;
    }

    public isEmpty(): boolean {
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
    public setSpacing(start: string, end: string, item: string): this {
        this.setStartSpacing(start);
        this.setEndSpacing(end);
        this.setItemSpacing(item);
        return this;
    }

    getStartSpacing(): string {
        return this.startSpacing;
    }

    getEndSpacing(): string {
        return this.endSpacing;
    }

    setStartSpacing(value: string): this {
        this.startSpacing = value;
        return this;
    }

    setEndSpacing(value: string): this {
        this.endSpacing = value;
        return this;
    }

    setStartEndSpacing(value: string): this {
        this.setStartSpacing(value);
        return this.setEndSpacing(value);
    }

    getItemSpacing(): string {
        return this.itemSpacing;
    }

    setItemSpacing(value: string): this {
        this.itemSpacing = value;
        return this;
    }
}

class ButtonBox extends FlexBox<WidgetEvents> {

    constructor() {
        super();
        this.on(undefined, EventCallbacks.setHeight);
        this.setSpacing("2rem", "2rem", "1rem");
    }

    public build(suppressCallback: boolean = false): JQuery<HTMLElement> {
        super.build(true)
            .addClass("button-box-widget");
        this.buildCallback(suppressCallback);
        return this.domObject;
    }

    public addButton(button: Button, mainAlign: FlexAlign = FlexAlign.center, crossAlign: FlexAlign = FlexAlign.center): this {
        return super.addItem(button, mainAlign, crossAlign);
    }
}

@mixin(ColorEditable, SpacingEditable)
class Text extends Widget<WidgetEvents> {
    private value: string;
    private _font: Font;

    constructor() {
        super();
        this.mixinConstructor(ColorEditable, SpacingEditable);
        // createMixinFields(this, new ColorEditable(), new SpacingEditable());
        this._font = new Font();
    }

    public set(value: string): this {
        this.value = value;
        return this;
    }

    public build(suppressCallback: boolean = false): JQuery<HTMLElement> {
        super.build(true)
            .addClass("text-widget");
        this.buildCallback(suppressCallback);
        return this.domObject;
    }

    public rebuild(suppressCallback: boolean = false): JQuery<HTMLElement> {
        super.rebuild(true);
        this.domObject
            .text(this.value)
            .css("font-size", this._font.size)
            .css("font-weight", this._font.weight)
            .css("font-family", this._font.family);
        this.rebuildCallback(suppressCallback);
        return this.domObject;
    }

    public get(): string {
        return this.value;
    }

    public setFont(font: Font): this {
        this._font = font;
        return this;
    }

    public setFontSize(fontSize: FontSize | string): this {
        this._font.setSize(fontSize);
        return this;
    }

    public setFontWeight(fontWeight: FontWeight | string): this {
        this._font.setWeight(fontWeight);
        return this;
    }

    public setFontFamily(fontFamily: FontFamily | string): this {
        this._font.setFamily(fontFamily);
        return this;
    }

    public get font(): Font {
        return this._font;
    }
}

interface Text extends MixinImplementing, ColorEditable<WidgetEvents>, SpacingEditable<WidgetEvents> {
}

const TopEvents = {
    ...WidgetEvents,
    ...IconContainingEvents
};
type TopEvents = (typeof TopEvents[keyof typeof TopEvents]);

@mixin(OneIconContaining)
class Top extends FlexBox<TopEvents> {
    private readonly label: Text;
    private _defaultTop = true;

    constructor() {
        super();
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

    build(suppressCallback: boolean = false): JQuery<HTMLElement> {
        super.build(true)
            .addClass("title-widget");
        // .append(this.label.build(suppressCallback))
        // .append(this.icon != null ? this.icon.build() : null);
        this.buildCallback(suppressCallback);
        return this.domObject;
    }

    public rebuild(suppressCallback: boolean = false): JQuery<HTMLElement> {
        super.rebuild(true);
        this.domObject
            .toggleClass("default", this._defaultTop);
        this.rebuildCallback(suppressCallback);
        return this.domObject;
    }

    public getLabel(): string {
        return this.label.get();
    }

    public setLabel(value: string): this {
        this.label.set(value);
        return this;
    }

    public get defaultTop(): boolean {
        return this._defaultTop;
    }

    public setDefaultTop(defaultTop: boolean): this {
        this._defaultTop = defaultTop;
        return this;
    }
}

interface Top extends MixinImplementing, OneIconContaining<WidgetEvents> {
}

@mixin(Item, ColorEditable, SpacingEditable, LeadingTrailingIconContaining, CheckboxContaining)
class ListTile<EventType extends WidgetEvents> extends FlexBox<EventType> {
    private readonly _label: Text = new Text();
    private readonly _description: Text = new Text();

    constructor() {
        super();
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

    public build(suppressCallback: boolean = false): JQuery<HTMLElement> {
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

    public rebuild(suppressCallback: boolean = false): JQuery<HTMLElement> {
        super.rebuild(true);
        this.rebuildCheckbox();
        this.rebuildCallback(suppressCallback);
        return this.domObject;
    }

    public get label(): Text {
        return this._label;
    }

    public setLabel(label: string): this {
        this._label.set(label);
        return this;
    }

    public setDescription(description: string): this {
        this._description.set(description);
        return this;
    }

    public get description(): Text {
        return this._description;
    }
}

interface ListTile<EventType extends WidgetEvents | IconContainingEvents> extends MixinImplementing, Item, ColorEditable<EventType>, SpacingEditable<EventType>, LeadingTrailingIconContaining<EventType>, CheckboxContaining<EventType> {
}

const TextInputEvents = {
    ...WidgetEvents,
    ...InputEvents
};
type TextInputEvents = (typeof TextInputEvents[keyof typeof TextInputEvents]);

@mixin(Input, InputLabel)
class TextInput extends Widget<TextInputEvents> {
    // private _id: string;
    // private _label: string;
    private _placeHolder: string;
    private _minLength: number;
    private _maxLength: number;
    // private _readonly: boolean;
    private _spellcheck: boolean;
    private _size: number;
    private _pattern: string;

    constructor() {
        super();
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

    public build(suppressCallback: boolean = false): JQuery<HTMLElement> {
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

    public rebuild(suppressCallback: boolean = false): JQuery<HTMLElement> {
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

    public setPlaceHolder(placeHolder: string): this {
        this._placeHolder = placeHolder;
        this.tryRebuild();
        return this;
    }

    public setMinLength(minLength: number): this {
        this._minLength = minLength;
        this.tryRebuild();
        return this;
    }

    public setMaxLength(maxLength: number): this {
        this._maxLength = maxLength;
        this.tryRebuild();
        return this;
    }

    // public setReadonly(readonly: boolean): this {
    //     this._readonly = readonly;
    //     this.tryRebuild();
    //     return this;
    // }

    public setSpellcheck(spellcheck: boolean): this {
        this._spellcheck = spellcheck;
        this.tryRebuild();
        return this;
    }

    public setSize(size: number): this {
        this._size = size;
        this.tryRebuild();
        return this;
    }

    public setPattern(pattern: string): this {
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

    public get placeHolder(): string {
        return this._placeHolder;
    }

    public get minLength(): number {
        return this._minLength;
    }

    public get maxLength(): number {
        return this._maxLength;
    }

    // public get readonly(): boolean {
    //     return this._readonly;
    // }

    public get spellcheck(): boolean {
        return this._spellcheck;
    }

    public get size(): number {
        return this._size;
    }

    public get pattern(): string {
        return this._pattern;
    }
}

interface TextInput extends MixinImplementing, Input<string, WidgetEvents | InputEvents, HTMLElement>, InputLabel<WidgetEvents> {
}

@mixin(Input)
class CheckBoxInput extends Widget<WidgetEvents | InputEvents, HTMLInputElement> {
    private _checked: boolean;

    constructor() {
        super("input");
        this.mixinConstructor();
        this.setType("checkbox");
    }

    public build(suppressCallback: boolean = false): JQuery<HTMLInputElement> {
        super.build(true);
        this.buildInput(<JQuery<HTMLInputElement>>this.domObject);
        this.buildCallback(suppressCallback);
        return this.domObject;
    }

    public rebuild(suppressCallback: boolean = false): JQuery<HTMLInputElement> {
        super.rebuild(true);
        this.rebuildInput(<JQuery<HTMLInputElement>>this.domObject);

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

    public get checked(): boolean {
        this._checked = this.domObject
            .get(0)
            .checked;
        return this._checked;
    }

    public setChecked(checked: boolean): this {
        this._checked = checked;
        return this;
    }
}

interface CheckBoxInput extends MixinImplementing, Input<string, WidgetEvents | InputEvents, HTMLInputElement> {
}

@mixin(Input)
class SelectBoxItemValue extends Widget<WidgetEvents | InputEvents> {
    private _label: string;
    private _checked: boolean;

    constructor() {
        super();
        this.setType("radio");
        this._checked = false;
        this.setName("42"); //we need any name so that only 1 item can be selected at once
    }

    public build(suppressCallback: boolean = false): JQuery<HTMLElement> {
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

    public rebuild(suppressCallback: boolean = false): JQuery<HTMLElement> {
        super.rebuild(true);
        this.rebuildInput()
            .get(0)
            .checked = this._checked;
        this.rebuildCallback(suppressCallback);
        return this.domObject;
    }

    public setLabel(label: string): this {
        this._label = label;
        return this;
    }

    public get label(): string {
        return this._label;
    }

    public setChecked(checked: boolean): this {
        this._checked = checked;
        return this;
    }

    public get checked(): boolean {
        this._checked = this.domObject.find("input")
            .get(0)
            .checked;
        return this._checked;
    }
}

interface SelectBoxItemValue extends MixinImplementing, Input<string, WidgetEvents | InputEvents, HTMLElement> {
}

@mixin(InputLabel)
class SelectBoxListItem extends Widget<WidgetEvents> {

    constructor() {
        super("li");
    }

    public build(suppressCallback: boolean = false): JQuery<HTMLElement> {
        super.build(true)
            .append(this.buildLabel()
                .addClass("option")
                .attr("aria-hidden", "aria-hidden"));
        this.buildCallback(suppressCallback);
        return this.domObject;
    }

    public rebuild(suppressCallback: boolean = false): JQuery<HTMLElement> {
        super.rebuild(true);
        this.rebuildLabel();
        this.rebuildCallback(suppressCallback);
        return this.domObject;
    }
}

interface SelectBoxListItem extends MixinImplementing, InputLabel<WidgetEvents> {
}

class SelectBoxItem {
    private readonly _value: SelectBoxItemValue;
    private readonly _listItem: SelectBoxListItem;

    constructor() {
        this._value = new SelectBoxItemValue();
        this._listItem = new SelectBoxListItem();
    }

    public setId(id: string): this {
        this._value.setId(id);
        this._listItem.setId(id);
        return this;
    }

    public get id() {
        return this._value.id;
    }

    public get value(): SelectBoxItemValue {
        return this._value;
    }

    public get listItem(): SelectBoxListItem {
        return this._listItem;
    }

    public setLabel(label: string): this {
        this._value.setLabel(label);
        this._listItem.setLabel(label);
        return this;
    }

    public get label() {
        return this._value.label;
    }
}

const SelectBoxEvents = {
    ...WidgetEvents,
    ...InputEvents
};
type SelectBoxEvents = (typeof SelectBoxEvents[keyof typeof SelectBoxEvents]);

@mixin(OneIconContaining)
class SelectBox extends Widget<SelectBoxEvents> {
    private items: SelectBoxItem[] = [];
    private optionsViewButton: CheckBoxInput;

    constructor() {
        super();
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
        this.addChild("optionsViewButton");
    }

    public build(suppressCallback: boolean = false): JQuery<HTMLElement> {
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

    public rebuild(suppressCallback: boolean = false): JQuery<HTMLElement> {
        super.rebuild(true);
        for (let i of this.items) {
            if (i.value.built) {
                i.value.domObject.detach();
            }
            if (i.listItem.built) {
                i.listItem.domObject.detach();
            }
        }
        this.domObject.children(".current")
            .prepend(this.items.map(value => value.value.built ? value.value.domObject : value.value.build()));
        this.domObject.children("ul")
            .append(this.items.map(value => value.listItem.built ? value.listItem.domObject : value.listItem.build()));
        for (let i of this.items) {
            i.value.rebuild();
            i.listItem.rebuild();
        }
        this.optionsViewButton.rebuild();

        this.rebuildCallback(suppressCallback);
        return this.domObject;
    }

    public addItem(...items: SelectBoxItem[]): this {
        for (let item of items) {
            item.value.on2(InputEvents.input, () => this.dispatchEvent(SelectBoxEvents.input, [item.value.value]));
            item.value.on2(InputEvents.change, () => this.dispatchEvent(SelectBoxEvents.change, [item.value.value]));
            item.listItem.setInheritVisibility(true);
            let index = this.items.push(item);
            this.addChild("item" + index + "li", item.listItem);
            this.addChild("item" + index + "value", item.value);
        }
        return this;
    }

    public setChecked(index: number, value: boolean = true): this {
        this.items[index].value.setChecked(value)
            .tryRebuild();
        return this;
    }
}

interface SelectBox extends MixinImplementing, OneIconContaining<SelectBoxEvents> {
}

@mixin(ItemContaining, SpacingEditable)
class Box<EventType extends WidgetEvents | ItemContainingEvents> extends Widget<EventType> {
    constructor(htmlElementType?: string) {
        super(htmlElementType);
        this.mixinConstructor(ItemContaining, SpacingEditable);
    }

    public rebuild(suppressCallback: boolean = false): JQuery<HTMLElement> {
        super.rebuild(true);
        this.rebuildItems();
        this.rebuildCallback(suppressCallback);
        return this.domObject;
    }

    public build(suppressCallback: boolean = false): JQuery<HTMLElement> {
        super.build(true)
            .addClass("box");
        this.buildSpacing();
        this.buildItems();
        this.buildCallback(suppressCallback);
        return this.domObject;
    }
}

interface Box<EventType extends WidgetEvents> extends MixinImplementing, ItemContaining<EventType>, SpacingEditable<EventType> {
}

class ContentBox extends Box<WidgetEvents> {

    constructor(htmlElementType?: string) {
        super(htmlElementType);
        this.on(undefined, EventCallbacks.setHeightToRemaining);
    }

    public build(suppressCallback: boolean = false): JQuery<HTMLElement> {
        super.build(true)
            .addClass("default-content");
        this.buildCallback(suppressCallback);
        return this.domObject;
    }
}


export {
    Icon,
    IconEvents,
    IconType,
    Button,
    ButtonEvents,
    ButtonBox,
    FlexAlign,
    Top,
    TopEvents,
    Text,
    ListTile,
    FlexBox,
    TextInput,
    TextInputEvents,
    Box,
    ContentBox,
    SelectBoxItem,
    SelectBox,
    SelectBoxEvents
};