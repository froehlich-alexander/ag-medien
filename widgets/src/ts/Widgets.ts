import {
    CheckboxContaining,
    ColorEditable, FavoriteContaining,
    IconContainingEvents,
    Input,
    InputEvents,
    InputLabel,
    ItemContaining,
    ItemContainingEvents, LabelContaining,
    LeadingTrailingIconContaining,
    OneIconContaining,
    SpacingEditable
} from "./AbstractWidgets.js";
import {Mixin, mixin, MixinImplementing, Tripel} from "./base.js";
import {EventCallbacks} from "./Util.js";
import {Widget, WidgetEvents} from "./Widget.js";
import {Font, FontFamily, FontSize, FontWeight} from "./WidgetBase.js";
import ClickEvent = JQuery.ClickEvent;

class Item extends Mixin {
    private _index: number = -1;

    public get index(): number {
        return this._index;
    }

    public setIndex(value: number): this {
        this._index = value;
        return this;
    }
}

const IconEvents = {
    ...WidgetEvents
};
type IconEvents = (typeof IconEvents)[keyof typeof IconEvents];

enum IconType {
    material,
    undefined
}

interface Icon extends MixinImplementing, SpacingEditable<IconEvents, HTMLDivElement> {
}

@mixin(SpacingEditable)
class Icon extends Widget<IconEvents, HTMLDivElement> {
    private _type: IconType = IconType.undefined;
    private _value: string | undefined | null;
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

    public static of(value: any, type?: IconType): Icon {
        return new Icon().set(value, type);
    }

    public override build(suppressCallback: boolean = false): JQuery<HTMLDivElement> {
        super.build(true)
            .addClass("icon-widget");
        return this.buildCallback(suppressCallback);
    }

    public override rebuild(suppressCallback: boolean = false): JQuery<HTMLDivElement> {
        super.rebuild(true)
            .css("cursor", this._clickable ? "pointer" : "");
        // console.assert(this._value !== undefined, "Value of this icon is not set. Maybe you forgot it?");
        // console.log(this.domObject);
        switch (this._type) {
            case IconType.material: {
                this.domObject.text(this._value ?? "")
                    .addClass("material-icons");
                break;
            }
            case IconType.undefined: {
                this.domObject.text("")
                    .removeClass("material-icons");
                this.hide();
            }
        }
        if (this._value === null) {
            this.hide();
        }

        return this.rebuildCallback(suppressCallback);
    }

    public set(value: string | null, type?: IconType): Icon {
        this.setValue(value);
        if (type != undefined) {
            this.setType(type);
        }
        return this;
    }

    public setValue(value: string | null): this {
        this._value = value;
        return this;
    }

    public setType(type: IconType): this {
        this._type = type;
        switch (type) {
            case IconType.material:
                console.assert(typeof this._value === "string", "The type of the value of this icon must be string when type == " + IconType[IconType.material]);
        }
        return this;
    }

    public override copy(other: this): this {
        super.copy(other);
        this.setClickable(other._clickable);
        this.setType(other.type);
        this._value = other._value;
        return this;
    }

    public setClickable(clickable: boolean): this {
        this._clickable = clickable;
        return this;
    }

    public get clickable(): boolean {
        return this._clickable;
    }

    public get type(): IconType {
        return this._type;
    }

    public get value(): string | undefined | null {
        return this._value;
    }
}

const ButtonEvents = {
    ...WidgetEvents
};

type ButtonEvents = (typeof IconEvents)[keyof typeof IconEvents];

interface Button extends MixinImplementing, OneIconContaining<ButtonEvents, HTMLDivElement>, LabelContaining<ButtonEvents, HTMLDivElement> {
}

@mixin(OneIconContaining, LabelContaining)
class Button extends Widget<ButtonEvents, HTMLDivElement> {
    // private readonly _label: Text;
    // private readonly icon: Icon | null;

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

    constructor() {
        super();
        this.mixinConstructor();
        this.enableIcon(true);
        this.enableLabel(true);
        this._label.setFontWeight(FontWeight.bold);
        // this.addChild("_label");
    }

    public override build(suppressCallback: boolean = false): JQuery<HTMLDivElement> {
        super.build(true)
            .addClass("button-widget")
            .append(this.icon.build())
            // .append($("<div></div>")
            //     .text(this.label)
            //     .addClass("text"))
            .append(this._label.build());
        // .on("click", () => this.dispatchEvent(ButtonEvents.clicked));
        this.buildCallback(suppressCallback);
        return this.domObject;
    }

    public override rebuild(suppressCallback: boolean = false): JQuery<HTMLDivElement> {
        super.rebuild(true);
        this.icon.rebuild();
        this._label.rebuild();

        return this.rebuildCallback(suppressCallback);
    }

    // public setLabel(value: string): Button {
    //     this._label.set(value);
    //     return this;
    // }
    //
    // public get label(): string {
    //     return this._label.get();
    // }
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
class FlexBox<EventType extends WidgetEvents, HtmlElementType extends HTMLElement = HTMLDivElement> extends Widget<EventType, HtmlElementType> {
    private readonly items: Tripel<Widget<WidgetEvents>, FlexAlign, FlexAlign>[] = [];
    private _startSpacing: string = "";
    private _endSpacing: string = "";
    private _itemSpacing: string = "";

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

    public override build(suppressCallback: boolean = false): JQuery<HtmlElementType> {
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

    public override rebuild(suppressCallback: boolean = false): JQuery<HtmlElementType> {
        super.rebuild(true);
        this.domObject
            .css("column-gap", this._itemSpacing)
            .css("padding-left", this._startSpacing)
            .css("padding-right", this._endSpacing);
        this.items.map(v => v.first.rebuild());

        this.rebuildCallback(suppressCallback);
        return this.domObject;
    }

    public addItem<ItemHtmlElementType extends HTMLElement, ItemType extends Widget<WidgetEvents, ItemHtmlElementType>>(item: ItemType, mainAlign: FlexAlign = FlexAlign.center, crossAlign: FlexAlign = FlexAlign.center): this {
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

    public setStartSpacing(value: string): this {
        this._startSpacing = value;
        return this;
    }

    public setEndSpacing(value: string): this {
        this._endSpacing = value;
        return this;
    }

    public setStartEndSpacing(value: string): this {
        this.setStartSpacing(value);
        return this.setEndSpacing(value);
    }

    public setItemSpacing(value: string): this {
        this._itemSpacing = value;
        return this;
    }

    public get startSpacing(): string {
        return this._startSpacing;
    }

    public get endSpacing(): string {
        return this._endSpacing;
    }

    public get itemSpacing(): string {
        return this._itemSpacing;
    }
}

class ButtonBox<HtmlElementType extends HTMLElement = HTMLDivElement> extends FlexBox<WidgetEvents, HtmlElementType> {

    constructor() {
        super();
        this.on(...EventCallbacks.setHeight);
        this.setSpacing("2rem", "2rem", "1rem");
    }

    public override build(suppressCallback: boolean = false): JQuery<HtmlElementType> {
        super.build(true)
            .addClass("button-box-widget");
        this.buildCallback(suppressCallback);
        return this.domObject;
    }

    public addButton(button: Button, mainAlign: FlexAlign = FlexAlign.center, crossAlign: FlexAlign = FlexAlign.center): this {
        return super.addItem(button, mainAlign, crossAlign);
    }
}

interface Text extends MixinImplementing, ColorEditable<WidgetEvents, HTMLDivElement>, SpacingEditable<WidgetEvents, HTMLDivElement> {
}

@mixin(ColorEditable, SpacingEditable)
class Text extends Widget<WidgetEvents, HTMLDivElement> {
    private value: string = "";
    private _font: Font;

    constructor() {
        super();
        this.mixinConstructor();
        // createMixinFields(this, new ColorEditable(), new SpacingEditable());
        this._font = new Font();
    }

    public set(value: string): this {
        this.value = value;
        return this;
    }

    public override build(suppressCallback: boolean = false): JQuery<HTMLDivElement> {
        super.build(true)
            .addClass("text-widget");
        this.buildCallback(suppressCallback);
        return this.domObject;
    }

    public override rebuild(suppressCallback: boolean = false): JQuery<HTMLDivElement> {
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

const TopEvents = {
    ...WidgetEvents,
    ...IconContainingEvents
};
type TopEvents = (typeof TopEvents[keyof typeof TopEvents]);

@mixin(OneIconContaining)
class Top<HtmlElementType extends HTMLElement = HTMLDivElement> extends FlexBox<TopEvents, HtmlElementType> {
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
        this.addItem(this.icon, FlexAlign.end);
        this.setSpacing("20px", "20px", "10px");

        this.on(...EventCallbacks.setHeight);
    }

    public override build(suppressCallback: boolean = false): JQuery<HtmlElementType> {
        super.build(true)
            .addClass("title-widget");
        // .append(this.label.build(suppressCallback))
        // .append(this.icon != null ? this.icon.build() : null);
        this.buildCallback(suppressCallback);
        return this.domObject;
    }

    public override rebuild(suppressCallback: boolean = false): JQuery<HtmlElementType> {
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

interface Top<HtmlElementType extends HTMLElement = HTMLDivElement> extends MixinImplementing, OneIconContaining<WidgetEvents, HtmlElementType> {
}

@mixin(ColorEditable, SpacingEditable, LeadingTrailingIconContaining, CheckboxContaining, FavoriteContaining, LabelContaining)
class ListTile<EventType extends WidgetEvents | IconContainingEvents, HtmlElementType extends HTMLElement = HTMLDivElement> extends FlexBox<EventType, HtmlElementType> {
    // private readonly _label: Text = new Text();
    private readonly _description: Text = new Text();

    constructor() {
        super();
        this.mixinConstructor();

        this.enableLabel(true);
        this._description.setInheritVisibility(false);

        // this.children.set("lable", this._label);
        // this.children.set("description", this._description);
        this.addItem(this.leadingIcon, FlexAlign.start);
        this.addItem(this._label, FlexAlign.start);
        this.addItem(this.favorite, FlexAlign.start);
        this.addItem(this.trailingIcon, FlexAlign.end);
        this.addItem(this.checkbox, FlexAlign.end);
        this.setSpacing("1rem", "1rem", "1rem");
        this.enableCheckbox(false);
        this.enableFavorite(false);
    }

    public override build(suppressCallback: boolean = false): JQuery<HtmlElementType> {
        super.build(true)
            .addClass("list-tile-widget");
        // .append(this.getLeadingIcon().build())
        // .append(this._label.build())
        // .append(this.getTrailingIcon().build());

        this.buildColor();
        this.buildSpacing();
        this.buildFavorite(true);
        this.buildCheckbox();

        this.buildCallback(suppressCallback);
        return this.domObject;
    }

    public override rebuild(suppressCallback: boolean = false): JQuery<HtmlElementType> {
        super.rebuild(true);
        this.rebuildCheckbox();
        this.rebuildFavorite();
        this.rebuildCallback(suppressCallback);
        return this.domObject;
    }

    public setDescription(description: string): this {
        this._description.set(description);
        return this;
    }

    public get description(): Text {
        return this._description;
    }
}

interface ListTile<EventType extends WidgetEvents | IconContainingEvents, HtmlElementType extends HTMLElement = HTMLDivElement> extends FlexBox<EventType, HtmlElementType>, MixinImplementing, ColorEditable<EventType, HtmlElementType>, SpacingEditable<EventType, HtmlElementType>, LeadingTrailingIconContaining<EventType, HtmlElementType>, CheckboxContaining<EventType, HtmlElementType>, FavoriteContaining<EventType, HtmlElementType>, LabelContaining<EventType, HtmlElementType> {
}

const TextInputEvents = {
    ...WidgetEvents,
    ...InputEvents
};
type TextInputEvents = (typeof TextInputEvents[keyof typeof TextInputEvents]);

@mixin(Input, InputLabel)
class TextInput<HtmlElementType extends HTMLElement = HTMLDivElement> extends Widget<TextInputEvents, HtmlElementType> {
    // private _id: string;
    // private _label: string;
    private _placeHolder: string | null = null;
    private _minLength: number | null = null;
    private _maxLength: number | null = null;
    // private _readonly: boolean;
    private _spellcheck: boolean | undefined = undefined;
    private _size: number | null = null;
    private _pattern: string | null = null;

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

    public override build(suppressCallback: boolean = false): JQuery<HtmlElementType> {
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

    public override rebuild(suppressCallback: boolean = false): JQuery<HtmlElementType> {
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

    public get placeHolder(): string | null {
        return this._placeHolder;
    }

    public get minLength(): number | null {
        return this._minLength;
    }

    public get maxLength(): number | null {
        return this._maxLength;
    }

    public get spellcheck(): boolean | undefined {
        return this._spellcheck;
    }

    public get size(): number | null {
        return this._size;
    }

    public get pattern(): string | null {
        return this._pattern;
    }
}

interface TextInput<HtmlElementType extends HTMLElement = HTMLDivElement> extends MixinImplementing, Input<string, WidgetEvents | InputEvents, HtmlElementType>, InputLabel<WidgetEvents, HtmlElementType> {
}

@mixin(Input)
class CheckBoxInput extends Widget<WidgetEvents | InputEvents, HTMLInputElement> {
    private _checked: boolean = false;

    constructor() {
        super("input");
        this.mixinConstructor();
        this.setType("checkbox");
    }

    public override build(suppressCallback: boolean = false): JQuery<HTMLInputElement> {
        super.build(true);
        this.buildInput(<JQuery<HTMLInputElement>>this.domObject);
        this.buildCallback(suppressCallback);
        return this.domObject;
    }

    public override rebuild(suppressCallback: boolean = false): JQuery<HTMLInputElement> {
        super.rebuild(true);
        this.rebuildInput(<JQuery<HTMLInputElement>>this.domObject);

        let update = this.domObject.get(0)!.checked !== this._checked;
        this.domObject
            .prop("checked", this._checked);
        if (update) {
            this.dispatchEvent(InputEvents.input, [this.checked]);
            this.dispatchEvent(InputEvents.change, [this.checked]);
        }

        this.rebuildCallback(suppressCallback);
        return this.domObject;
    }

    public get checked(): boolean {
        this._checked = this.domObject.prop("checked");
        return this._checked;
    }

    public setChecked(checked: boolean): this {
        this._checked = checked;
        return this;
    }
}

interface CheckBoxInput extends MixinImplementing, Input<string, WidgetEvents | InputEvents, HTMLInputElement> {
}

@mixin(Input, Item)
class SelectBoxItemValue extends Widget<WidgetEvents | InputEvents> {
    private _label: string = "";
    private _checked: boolean = false;

    constructor() {
        super();
        this.setType("radio");
        this.setName("42"); //we need any name so that only 1 item can be selected at once
        this.on(InputEvents.input, (event, value) => this._checked = value);
    }

    public override build(suppressCallback: boolean = false): JQuery<HTMLElement> {
        super.build(true)
            .addClass("value")
            .append(this.buildInput())
            .append($("<p></p>")
                .text(this._label)
                .addClass("input-text"));
        this.show();
        this.buildCallback(suppressCallback);
        return this.domObject;
    }

    public override rebuild(suppressCallback: boolean = false): JQuery<HTMLElement> {
        super.rebuild(true);
        let a = this.rebuildInput();
        // console.log("rebuild input ", this._checked)
        a.prop("checked", this._checked);
        console.assert(a.prop("checked") === this._checked)
        // console.log(this._checked);
        // console.log(a.prop("checked"));
        // console.log(a);
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
        // this._checked = this.domObject.find("input")
        //     .prop("checked");
        return this._checked;
    }
}

interface SelectBoxItemValue extends MixinImplementing, Input<string, WidgetEvents | InputEvents, HTMLElement>, Item {
}

@mixin(InputLabel, Item)
class SelectBoxListItem extends Widget<WidgetEvents, HTMLLIElement> {

    constructor() {
        super("li");
    }

    public override build(suppressCallback: boolean = false): JQuery<HTMLLIElement> {
        super.build(true)
            .append(this.buildLabel()
                .addClass("option")
                .attr("aria-hidden", "aria-hidden"));
        this.buildCallback(suppressCallback);
        return this.domObject;
    }

    public override rebuild(suppressCallback: boolean = false): JQuery<HTMLLIElement> {
        super.rebuild(true);
        this.rebuildLabel();
        this.rebuildCallback(suppressCallback);
        return this.domObject;
    }
}

interface SelectBoxListItem extends MixinImplementing, InputLabel<WidgetEvents, HTMLLIElement>, Item {
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

    public get index(): number {
        return this._value.index;
    }

    public setIndex(value: number): this {
        this._value.setIndex(value);
        this._listItem.setIndex(value);
        return this;
    }
}

const SelectBoxEvents = {
    ...WidgetEvents,
    ...InputEvents
};
type SelectBoxEvents = (typeof SelectBoxEvents[keyof typeof SelectBoxEvents]);

@mixin(OneIconContaining)
class SelectBox<HtmlElementType extends HTMLElement = HTMLDivElement> extends Widget<SelectBoxEvents, HtmlElementType> {
    private _items: SelectBoxItem[] = [];
    private liItems: Box<WidgetEvents, HTMLDivElement, SelectBoxListItem> = new Box<WidgetEvents, HTMLDivElement, SelectBoxListItem>("ul").show();
    private inputItems: Box<WidgetEvents, HTMLDivElement, SelectBoxItemValue> = new Box<WidgetEvents, HTMLDivElement, SelectBoxItemValue>().show();
    private optionsViewButton: CheckBoxInput;

    constructor() {
        super();
        this.mixinConstructor();
        this.setIcon(Icon.of("expand_more", IconType.material));
        this.enableIcon(true);
        this.optionsViewButton = new CheckBoxInput()
            .setInheritVisibility(true)
            .show()
            .on(InputEvents.change, (_, value) => this.domObject.find(".current")
                .toggleClass("options-view-button-checked", value));
        this.on(SelectBoxEvents.change, (event, ...args) => console.log(args));
        this.on(WidgetEvents.clicked, (event) => {
            if ($((event.originalEvent! as ClickEvent).target).closest(this.optionsViewButton.domObject).length < 1) {
                this.optionsViewButton.setChecked(false).tryRebuild();
            }
        });
        this.addChild("optionsViewButton");
    }

    public override build(suppressCallback: boolean = false): JQuery<HtmlElementType> {
        super.build(true)
            .addClass("select-box-widget")
            // .append($("<div></div>")
            .append(this.inputItems.build()
                .addClass("current")
                .append(this.optionsViewButton.build()
                    .addClass("options-view-button"))
                .append(this.icon.build()
                    .addClass("icon")))
            .append(this.liItems.build())
        // .append("<ul></ul>");

        this.buildCallback(suppressCallback);
        return this.domObject;
    }

    public override rebuild(suppressCallback: boolean = false): JQuery<HtmlElementType> {
        super.rebuild(true);
        this.liItems.orderItems().rebuild();
        this.inputItems.orderItems().rebuild();
        //
        // this.domObject.find(".current").children(".value").detach();
        // this.domObject.find("ul").children("li").detach();
        //
        // for (let i of this._items) {
        //     if (i.value.built) {
        //         i.value.domObject.detach();
        //     }
        //     if (i.listItem.built) {
        //         i.listItem.domObject.detach();
        //     }
        // }
        // this.domObject.children(".current")
        //     .prepend(this._items.map(value => value.value.built ? value.value.domObject : value.value.build().on("click", () => console.log("click curr", value.value))));
        // this.domObject.children("ul")
        //     .append(this._items.map(value => value.listItem.built ? value.listItem.domObject : value.listItem.build().on("click", () => console.log("click li", value.listItem))));
        // for (let i of this._items) {
        //     i.value.rebuild();
        //     i.listItem.rebuild();
        // }
        this.optionsViewButton.rebuild();

        this.rebuildCallback(suppressCallback);
        return this.domObject;
    }

    public addItems(...items: SelectBoxItem[]): this {
        for (let item of items) {
            item.value.on(InputEvents.input, () => this.dispatchEvent(SelectBoxEvents.input, [item.value]));
            item.value.on(InputEvents.change, () => this.dispatchEvent(SelectBoxEvents.change, [item.value]));
            let index = this._items.push(item) - 1;
            this.liItems.addItems(item.listItem.setInheritVisibility(true).show());
            this.inputItems.addItems(item.value);
            // item.listItem.setInheritVisibility(true);
            // let index = this._items.push(item);
            // this.addChild("item" + index + "li", item.listItem);
            // this.addChild("item" + index + "value", item.value);
        }
        return this;
    }

    public removeItems(...items: SelectBoxItem[]): this {
        console.info("not tested yet")
        let itemsToRemove: SelectBoxItem[] = [];
        for (let item of items) {
            for (let i of this._items.splice(this._items.indexOf(item), 1)) {
                //TODO 09.04.2022 clean up event handlers
                itemsToRemove.push(i);
            }
        }
        this.inputItems.removeItems(...itemsToRemove.map(v => v.value));
        this.liItems.removeItems(...itemsToRemove.map(v => v.listItem));
        return this;
    }

    public setChecked(index: number, checked?: boolean): this;
    public setChecked(value: string, checked?: boolean): this;
    public setChecked(index: number | string, checked: boolean = true): this {
        if (typeof index === "number") {
            this._items[index].value.setChecked(checked);
            this.tryRebuild();
        } else {
            for (let i of this._items) {
                if (i.value.value === index) {
                    i.value.setChecked(checked);
                } else {
                    if (checked) {
                        i.value.setChecked(false);
                    }
                }
            }
        }
        return this;
    }

    public get items(): SelectBoxItem[] {
        return this._items;
    }

    public has(item: SelectBoxItem): boolean;
    public has(itemId: string): boolean;
    public has(item: SelectBoxItem | string): boolean {
        if (item instanceof SelectBoxItem) {
            item = item.id;
        }
        for (let i of this.items) {
            if (item === i.id) {
                return true;
            }
        }
        return false;
    }
}

interface SelectBox<HtmlElementType extends HTMLElement = HTMLDivElement> extends MixinImplementing, OneIconContaining<SelectBoxEvents, HtmlElementType> {
}

@mixin(ItemContaining, SpacingEditable)
class Box<EventType extends WidgetEvents | ItemContainingEvents, HtmlElementType extends HTMLElement = HTMLDivElement, ItemType extends Widget<WidgetEvents, any> = Widget<WidgetEvents>> extends Widget<EventType, HtmlElementType> {
    constructor(htmlElementType?: string) {
        super(htmlElementType);
        this.mixinConstructor(ItemContaining, SpacingEditable);
    }

    public override rebuild(suppressCallback: boolean = false): JQuery<HtmlElementType> {
        super.rebuild(true);
        this.rebuildItems();
        this.rebuildCallback(suppressCallback);
        return this.domObject;
    }

    public override build(suppressCallback: boolean = false): JQuery<HtmlElementType> {
        super.build(true)
            .addClass("box");
        this.buildSpacing();
        this.buildItems();
        this.buildCallback(suppressCallback);
        return this.domObject;
    }
}

interface Box<EventType extends WidgetEvents | ItemContainingEvents, HtmlElementType extends HTMLElement = HTMLDivElement, ItemType extends Widget<WidgetEvents, any> = Widget<WidgetEvents>> extends MixinImplementing, ItemContaining<EventType, HtmlElementType, ItemType>, SpacingEditable<EventType, HtmlElementType> {
}

class ContentBox<HtmlElementType extends HTMLElement = HTMLDivElement, ItemType extends Widget<WidgetEvents> = Widget<WidgetEvents>> extends Box<WidgetEvents, HtmlElementType, ItemType> {

    constructor(htmlElementType?: string) {
        super(htmlElementType);
        this.on(...EventCallbacks.setHeightToRemaining);
    }

    public override build(suppressCallback: boolean = false): JQuery<HtmlElementType> {
        super.build(true)
            .addClass("content");
        return this.buildCallback(suppressCallback);
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