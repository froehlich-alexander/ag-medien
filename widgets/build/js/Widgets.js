var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var Icon_1;
import { Widget, WidgetEvents } from "./Widget.js";
import { Mixin, mixin, MixinImplementing, Tripel } from "./base.js";
import { CheckboxContaining, ColorEditable, EventCallbacks, IconContainingEvents, Input, InputEvents, InputLabel, ItemContaining, LeadingTrailingIconContaining, OneIconContaining, SpacingEditable } from "./AbstractWidgets.js";
import { Font, FontWeight } from "./WidgetBase.js";
class Item extends Mixin {
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
const ButtonEvents = {
    ...WidgetEvents
};
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
        this.addChild("icon", this.icon);
        return this;
    }
}
Button.Cancel = () => new Button().setLabel("Cancel").setIcon(Icon.Cancel());
Button.Ok = () => new Button().setLabel("Ok").setIcon(Icon.Done());
Button.Back = () => new Button().setLabel("Back").setIcon(Icon.of("arrow_back", IconType.material));
Button.Next = () => new Button().setLabel("Next").setIcon(Icon.of("arrow_forward", IconType.material));
Button.Agree = () => new Button().setLabel("Agree").setIcon(Icon.Done());
Button.Delete = () => new Button().setLabel("Delete").setIcon(Icon.Delete());
Button.Save = () => new Button().setLabel("Save").setIcon(Icon.of("save", IconType.material));
Button.Activate = () => new Button().setLabel("Activate").setIcon(Icon.of("favorite", IconType.material));
Button.Reset = () => new Button().setLabel("Reset").setIcon(Icon.of("restart_alt", IconType.material));
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
            .addClass("flex-box-widget");
        for (let i of Object.values(FlexAlign)) {
            this.buildAlign(i);
        }
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
        this.mixinConstructor(ColorEditable, SpacingEditable);
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
        this._defaultTop = true;
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
        this._label = new Text();
        this._description = new Text();
        this.mixinConstructor(SpacingEditable, LeadingTrailingIconContaining, ColorEditable, CheckboxContaining);
        this._label.setInheritVisibility(true);
        this._description.setInheritVisibility(false);
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
        this.mixinConstructor(Input, InputLabel);
    }
    build(suppressCallback = false) {
        super.build(suppressCallback)
            .addClass("text-input")
            .append(this.buildInput()
            .addClass("field"))
            .append(this.buildLabel()
            .addClass("label"))
            .append($("<span></span>")
            .addClass("underline"));
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
        this.rebuildLabel();
        return this.domObject;
    }
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
    get placeHolder() {
        return this._placeHolder;
    }
    get minLength() {
        return this._minLength;
    }
    get maxLength() {
        return this._maxLength;
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
};
TextInput = __decorate([
    mixin(Input, InputLabel)
], TextInput);
let CheckBoxInput = class CheckBoxInput extends Widget {
    constructor() {
        super("input");
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
        this.setType("radio");
        this._checked = false;
        this.setName("42");
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
        this.items = [];
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
    addItem(...items) {
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
    setChecked(index, value = true) {
        this.items[index].value.setChecked(value)
            .tryRebuild();
        return this;
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
