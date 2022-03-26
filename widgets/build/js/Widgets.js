var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var Icon_1;
import { Widget, WidgetEvents } from "./Widget.js";
import { mixin, MixinImplementing, Tripel } from "./base.js";
import { ColorEditable, EventCallbacks, ItemContaining, LeadingTrailingIconContaining, OneIconContaining, SpacingEditable, Util } from "./AbstractWidgets.js";
import { Font, FontWeight } from "./WidgetBase.js";
class Item {
    get index() {
        return this._index;
    }
    set index(value) {
        this._index = value;
    }
}
const IconEvents = Object.assign(Object.assign({}, WidgetEvents), { clicked: "clicked" });
var IconType;
(function (IconType) {
    IconType[IconType["material"] = 0] = "material";
})(IconType || (IconType = {}));
let Icon = Icon_1 = class Icon extends Widget {
    constructor() {
        super();
        this._clickable = true;
        this.mixinConstructor(SpacingEditable);
    }
    build(force = true) {
        if (!this.built && force) {
            super.build(true)
                .addClass("icon-widget")
                .css("cursor", this._clickable ? "pointer" : null)
                .on("click", () => this.dispatchEvent("clicked"));
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
Icon.Close = () => Icon_1.of("close", IconType.material);
Icon.Edit = () => Icon_1.of("edit", IconType.material);
Icon.Done = () => Icon_1.of("done", IconType.material);
Icon.Back = () => Icon_1.of("arrow_back", IconType.material);
Icon.Next = () => Icon_1.of("arrow_forward", IconType.material);
Icon.Delete = () => Icon_1.of("delete", IconType.material);
Icon.Cancel = () => Icon_1.of("cancel", IconType.material);
Icon.Info = () => Icon_1.of("info", IconType.material);
Icon = Icon_1 = __decorate([
    mixin(MixinImplementing, SpacingEditable)
], Icon);
const ButtonEvents = Object.assign(Object.assign({}, WidgetEvents), { clicked: "clicked" });
class Button extends Widget {
    build(suppressCallback = false) {
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
    getLabel() {
        return this.label;
    }
    setLabel(value) {
        this.label = value;
        return this;
    }
    getIcon() {
        return this.icon;
    }
    setIcon(value) {
        this.icon = value;
        if (this.icon != null) {
            this.icon.setInheritVisibility(true);
        }
        this.children.set("icon", this.icon);
        return this;
    }
}
Button.Cancel = () => new Button().setLabel("Cancel").setIcon(Icon.Cancel());
Button.Ok = () => new Button().setLabel("Ok").setIcon(Icon.Done());
Button.Back = () => new Button().setLabel("Back").setIcon(Icon.of("arrow_back", IconType.material));
Button.Next = () => new Button().setLabel("Next").setIcon(Icon.of("arrow_forward", IconType.material));
Button.Agree = () => new Button().setLabel("Agree").setIcon(Icon.Done());
Button.Delete = () => new Button().setLabel("Delete").setIcon(Icon.Delete());
var FlexAlign;
(function (FlexAlign) {
    FlexAlign["start"] = "start";
    FlexAlign["center"] = "center";
    FlexAlign["end"] = "end";
})(FlexAlign || (FlexAlign = {}));
class FlexBox extends Widget {
    constructor() {
        super();
        this.items = [];
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
            .addClass("flex-box-widget")
            .css("column-gap", this.itemSpacing);
        for (let i of Object.values(FlexAlign)) {
            this.buildAlign(i);
        }
        Util.addCssProperty(this.domObject, "padding-left", this.startSpacing);
        Util.addCssProperty(this.domObject, "padding-right", this.endSpacing);
        this.buildCallback(suppressCallback);
        return this.domObject;
    }
    addItem(item, mainAlign = FlexAlign.center, crossAlign = FlexAlign.center) {
        console.assert(!this.built);
        item.setInheritVisibility(true);
        this.children.set("flexbox" + this.items.push(new Tripel(item, mainAlign, crossAlign)).toString(10), item);
        return this;
    }
    isEmpty() {
        return this.items.length > 0;
    }
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
    addButton(button, mainAlign = FlexAlign.center, crossAlign = FlexAlign.center) {
        return super.addItem(button, mainAlign, crossAlign);
    }
}
let Text = class Text extends Widget {
    constructor() {
        super();
        this.mixinConstructor(ColorEditable, SpacingEditable);
        this._font = new Font();
    }
    set(value) {
        this.value = value;
        return this;
    }
    build(suppressCallback = false) {
        super.build(true)
            .addClass("text-widget")
            .text(this.value)
            .css("font-size", this._font.size)
            .css("font-weight", this._font.weight)
            .css("font-family", this._font.family);
        this.buildCallback(suppressCallback);
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
    mixin(MixinImplementing, ColorEditable, SpacingEditable)
], Text);
let Top = class Top extends FlexBox {
    constructor() {
        super();
        this.mixinConstructor(OneIconContaining);
        this.setIcon(Icon.Close());
        this.label = new Text().setFontWeight(FontWeight.bold);
        this.addItem(this.label);
        this.addItem(this.getIcon(), FlexAlign.end);
        this.setSpacing("20px", "20px", "10px");
        this.on(undefined, EventCallbacks.setHeight);
    }
    build(suppressCallback = false) {
        super.build(true)
            .addClass("title-widget");
        this.buildCallback(suppressCallback);
        return this.domObject;
    }
    getLabel() {
        return this.label.get();
    }
    setLabel(value) {
        this.label.set(value);
        return this;
    }
};
Top = __decorate([
    mixin(MixinImplementing, OneIconContaining)
], Top);
let ListTile = class ListTile extends FlexBox {
    constructor() {
        super();
        this._label = new Text();
        this._description = new Text();
        this.mixinConstructor(SpacingEditable, LeadingTrailingIconContaining, ColorEditable);
        this._label.setInheritVisibility(true);
        this._description.setInheritVisibility(false);
        this.addItem(this.getLeadingIcon(), FlexAlign.start);
        this.addItem(this._label, FlexAlign.start);
        this.addItem(this.getTrailingIcon(), FlexAlign.end);
    }
    build(suppressCallback = false) {
        super.build(true)
            .addClass("list-tile-widget");
        this.buildColor();
        this.buildSpacing();
        this.buildCallback(suppressCallback);
        return this.domObject;
    }
    get label() {
        return this._label;
    }
    get description() {
        return this._description;
    }
};
ListTile = __decorate([
    mixin(ColorEditable, SpacingEditable, LeadingTrailingIconContaining)
], ListTile);
const TextInputEvents = Object.assign(Object.assign({}, WidgetEvents), { change: "change", input: "input" });
class TextInput extends Widget {
    constructor() {
        super();
    }
    build(suppressCallback = false) {
        super.build(suppressCallback)
            .addClass("text-input")
            .append($("<input>")
            .addClass("field")
            .attr("id", this._id)
            .attr("placeholder", this._placeHolder)
            .attr("minLength", this._minLength)
            .attr("maxLength", this._maxLength)
            .prop("readonly", this._readonly)
            .prop("spellcheck", this._spellcheck)
            .attr("size", this._size)
            .attr("pattern", this._pattern))
            .append($("<label></label>")
            .text(this._label)
            .addClass("label")
            .attr("for", this._id))
            .append($("<span></span>")
            .addClass("underline"))
            .on("change", (event) => { this.dispatchEvent(TextInputEvents.change, [event.target.value]); })
            .on("input", (event) => { this.dispatchEvent(TextInputEvents.input, [event.target.value]); });
        this.buildCallback(suppressCallback);
        return this.domObject;
    }
    get value() {
        return this.domObject.find("input").get(0).value;
    }
    setLabel(_label) {
        this._label = _label;
        return this;
    }
    setId(id) {
        this._id = id;
        return this;
    }
    setPlaceHolder(placeHolder) {
        this._placeHolder = placeHolder;
        return this;
    }
    setMinLength(minLength) {
        this._minLength = minLength;
        return this;
    }
    setMaxLength(maxLength) {
        this._maxLength = maxLength;
        return this;
    }
    setReadonly(readonly) {
        this._readonly = readonly;
        return this;
    }
    setSpellcheck(spellcheck) {
        this._spellcheck = spellcheck;
        return this;
    }
    setSize(size) {
        this._size = size;
        return this;
    }
    setPattern(pattern) {
        this._pattern = pattern;
        return this;
    }
    get id() {
        return this._id;
    }
    get label() {
        return this._label;
    }
    get placeHolder() {
        return this._placeHolder;
    }
    get minLength() {
        return this._minLength;
    }
    get maxLength() {
        return this._maxLength;
    }
    get readonly() {
        return this._readonly;
    }
    get spellcheck() {
        return this._spellcheck;
    }
    get size() {
        return this._size;
    }
    get pattern() {
        return this._pattern;
    }
}
let Box = class Box extends Widget {
    constructor() {
        super();
        this.mixinConstructor(ItemContaining, SpacingEditable);
    }
    build(suppressCallback = false) {
        super.build(suppressCallback)
            .addClass("box");
        this.buildSpacing();
        this.buildItems(this.domObject);
        this.buildCallback(suppressCallback);
        return this.domObject;
    }
};
Box = __decorate([
    mixin(ItemContaining, SpacingEditable)
], Box);
export { Icon, IconEvents, IconType, Button, ButtonEvents, ButtonBox, FlexAlign, Top, Text, ListTile, FlexBox, TextInput, TextInputEvents };
