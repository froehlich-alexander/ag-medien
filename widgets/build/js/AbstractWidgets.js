var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { mixin, Mixin, Pair } from "./base.js";
import { WidgetEvents } from "./Widget.js";
import { CSSColorValue } from "./WidgetBase.js";
import { Icon, IconEvents, IconType, TextInputEvents } from "./Widgets.js";
class Util {
    static setHeight(element) {
        element.outerHeight(element.outerHeight(false), false);
    }
    static setWidth(element) {
        element.outerWidth(element.outerWidth(false), false);
    }
    static addCssProperty(element, property, value) {
        if (value == null || value == "") {
            return element;
        }
        if (element.get(0).style.getPropertyValue(property) === "") {
            element.css(property, value);
        }
        else {
            element.css(property, "calc(" + element.get(0).style.getPropertyValue(property) + "+" + value + ")");
        }
        return element;
    }
    static setHeightToRemaining(parent, child) {
        let children = parent.children().not(child).not(".overlay-widget");
        let w = 0;
        for (let i = 0; i < children.length; i++) {
            w += children.eq(i).outerHeight(true);
        }
        child.css("max-height", `calc(100% - ${w}px`);
    }
    static setWidthToRemaining(parent, child) {
        let children = parent.children().not(child).not(".overlay-widget");
        let w = 0;
        for (let i = 0; i < children.length; i++) {
            w += children.eq(i).outerWidth(true);
        }
        child.css("max-width", `calc(100% - ${w}px`);
    }
}
class EventCallbacks {
}
EventCallbacks.setHeight = new Pair(WidgetEvents.sizeSet, function (event) {
    Util.setHeight(event.target.domObject);
});
EventCallbacks.setWidth = new Pair(WidgetEvents.sizeSet, function (event) {
    Util.setWidth(event.target.domObject);
});
EventCallbacks.setWidthToRemaining = new Pair(WidgetEvents.sizeSet, function (event) {
    Util.setWidthToRemaining(event.target.domObject.parent(), event.target.domObject);
});
EventCallbacks.setHeightToRemaining = new Pair(WidgetEvents.sizeSet, function (event) {
    Util.setHeightToRemaining(event.target.domObject.parent(), event.target.domObject);
});
var IconContainingEvents;
(function (IconContainingEvents) {
    IconContainingEvents["iconClicked"] = "iconClicked";
})(IconContainingEvents || (IconContainingEvents = {}));
class IconContaining extends Mixin {
    _setIcon(fieldName, icon) {
        this[fieldName].set(icon.getValue(), icon.getType());
        return this;
    }
    _getIcon(fieldName) {
        return this[fieldName];
    }
    _enableIcon(fieldName, value) {
        if (this[fieldName] != null) {
            this[fieldName].setInheritVisibility(value);
        }
        return this;
    }
    _iconEnabled(fieldName) {
        return this[fieldName].inheritVisibility;
    }
}
class OneIconContaining extends IconContaining {
    constructor() {
        super(...arguments);
        this.icon = new Icon();
    }
    _constructor() {
        this.addChild("icon", this.icon);
        this.icon.on(undefined, new Pair(IconEvents.clicked, () => this.dispatchEvent(IconContainingEvents.iconClicked, [this.icon, 0])));
    }
    setIcon(icon) {
        return super._setIcon("icon", icon);
    }
    getIcon() {
        return super._getIcon("icon");
    }
    enableIcon(value) {
        return super._enableIcon("icon", value);
    }
    iconEnabled() {
        return super._iconEnabled("icon");
    }
}
class LeadingTrailingIconContaining extends IconContaining {
    constructor() {
        super(...arguments);
        this.leadingIcon = new Icon();
        this.trailingIcon = new Icon();
    }
    _constructor() {
        this.addChild("leadingIcon", this.leadingIcon);
        this.leadingIcon.on(undefined, new Pair(IconEvents.clicked, () => this.dispatchEvent(IconContainingEvents.iconClicked, [this.leadingIcon, 0])));
        this.addChild("trailingIcon", this.trailingIcon);
        this.trailingIcon.on(undefined, new Pair(IconEvents.clicked, () => this.dispatchEvent(IconContainingEvents.iconClicked, [this.trailingIcon, 1])));
    }
    setLeadingIcon(icon) {
        return super._setIcon("leadingIcon", icon);
    }
    getLeadingIcon() {
        return super._getIcon("leadingIcon");
    }
    enableLeadingIcon(value) {
        return super._enableIcon("leadingIcon", value);
    }
    leadingIconEnabled() {
        return super._iconEnabled("leadingIcon");
    }
    setTrailingIcon(icon) {
        return super._setIcon("trailingIcon", icon);
    }
    getTrailingIcon() {
        return super._getIcon("trailingIcon");
    }
    enableTrailingIcon(value) {
        return super._enableIcon("trailingIcon", value);
    }
    trailingIconEnabled() {
        return super._iconEnabled("trailingIcon");
    }
}
class ColorEditable extends Mixin {
    constructor() {
        super(...arguments);
        this._backgroundColor = new CSSColorValue();
        this._textColor = new CSSColorValue();
    }
    buildColor() {
        this.domObject.css("background-color", this._backgroundColor.get());
        this.domObject.css("color", this._textColor.get());
        return this;
    }
    get backgroundColor() {
        return this._backgroundColor;
    }
    get textColor() {
        return this._textColor;
    }
}
class SpacingEditable extends Mixin {
    constructor() {
        super(...arguments);
        this._padding = [null, null, null, null];
        this._margin = [null, null, null, null];
    }
    buildSpacing() {
        this.domObject.css("padding-top", this._padding[0]);
        this.domObject.css("padding-right", this._padding[1]);
        this.domObject.css("padding-bottom", this._padding[2]);
        this.domObject.css("padding-left", this._padding[3]);
        this.domObject.css("margin-top", this._margin[0]);
        this.domObject.css("margin-right", this._margin[1]);
        this.domObject.css("margin-bottom", this._margin[2]);
        this.domObject.css("margin-left", this._margin[3]);
        return this;
    }
    setPadding(top, right, bottom, left) {
        if (top != null) {
            this._padding[0] = top;
        }
        if (right != null) {
            this._padding[1] = right;
        }
        if (bottom != null) {
            this._padding[2] = bottom;
        }
        if (left != null) {
            this._padding[3] = left;
        }
        return this;
    }
    setMargin(top, right, bottom, left) {
        if (top != null) {
            this._margin[0] = top;
        }
        if (right != null) {
            this._margin[1] = right;
        }
        if (bottom != null) {
            this._margin[2] = bottom;
        }
        if (left != null) {
            this._margin[3] = left;
        }
        return this;
    }
    get padding() {
        return [...this._padding];
    }
    get margin() {
        return [...this._margin];
    }
}
var ItemContainingEvents;
(function (ItemContainingEvents) {
    ItemContainingEvents["itemAdded"] = "";
    ItemContainingEvents["itemRemoved"] = "";
})(ItemContainingEvents || (ItemContainingEvents = {}));
class Item {
    constructor() {
        this._index = -1;
    }
    get index() {
        return this._index;
    }
    setIndex(index) {
        this._index = index;
        return this;
    }
}
class ItemContaining extends Mixin {
    constructor() {
        super(...arguments);
        this.itemCount = 0;
    }
    buildItem(item, inheritVisibility = true) {
        item.setInheritVisibility(inheritVisibility);
    }
    buildItems() {
        for (let i of [...this.children.entries()]
            .filter(value => ItemContaining.isItem(value[0]))
            .sort()
            .map(value => value[1])) {
            this.buildItem(i);
            this.domObject.append(i.build());
        }
        return this;
    }
    rebuildItems() {
        console.log("rebuild items");
        let pre;
        for (let i of [...this.children.entries()]
            .filter(value => ItemContaining.isItem(value[0]))
            .sort()
            .map(value => value[1])) {
            if (!(this.domObject.find(i.domObject).length > 0)) {
                if (pre !== undefined) {
                    console.log(this.domObject);
                    console.log(pre.label.get());
                    pre.domObject.after(i.domObject);
                }
                else {
                    this.domObject.append(i.domObject);
                }
            }
            i.rebuild();
            pre = i;
        }
        return this;
    }
    addItems(...items) {
        for (let i of items) {
            this.addChild(ItemContaining.itemChildrenPrefix + this.itemCount, i);
            this.dispatchEvent(ItemContainingEvents.itemAdded, [this.itemCount, i]);
            if (i instanceof Item) {
                i.setIndex(this.itemCount);
            }
            this.itemCount++;
        }
        if (this.built && items.length > 0) {
            this.rebuild();
        }
        return this;
    }
    static isItem(key) {
        return key.startsWith(ItemContaining.itemChildrenPrefix) &&
            !Number.isNaN(Number.parseInt(key.substring(ItemContaining.itemChildrenPrefix.length, key.length), 10));
    }
    static itemIndex(key) {
        return Number.parseInt(key.substring(ItemContaining.itemChildrenPrefix.length, key.length), 10);
    }
    reassignDeletedIndexes(...indexes) {
        indexes.sort();
        let removed = new Map();
        for (let i = 0; i < this.itemCount; i++) {
            let item = this.children.get(ItemContaining.itemChildrenPrefix + i);
            let newIndex = i;
            if (item === undefined) {
                continue;
            }
            if (indexes.indexOf(i) !== -1) {
                this.children.delete(ItemContaining.itemChildrenPrefix + i);
                removed.set(i, item);
                item.domObject.detach();
                continue;
            }
            for (let j of indexes) {
                if (j > i) {
                    break;
                }
                newIndex -= 1;
            }
            this.children.delete(ItemContaining.itemChildrenPrefix + i);
            this.addChild(ItemContaining.itemChildrenPrefix + newIndex, item);
            if (item instanceof Item) {
                item.setIndex(newIndex);
            }
        }
        this.itemCount -= removed.size;
        for (let [k, v] of removed.entries()) {
            this.dispatchEvent(ItemContainingEvents.itemRemoved, [k, v]);
        }
        if (this.built && removed.size > 0) {
            this.rebuild();
        }
        console.assert(this.itemCount === [...this.children.keys()].filter(value => ItemContaining.isItem(value)).length);
    }
    removeItems(...items) {
        let indexes = [];
        for (let [k, v] of this.children) {
            if (items.indexOf(v) !== -1 && ItemContaining.isItem(k)) {
                indexes.push(ItemContaining.itemIndex(k));
            }
        }
        this.reassignDeletedIndexes(...indexes);
        return this;
    }
    removeItem(...indexes) {
        this.reassignDeletedIndexes(...indexes);
        return this;
    }
    get items() {
        return [...this.children.entries()]
            .filter(value => ItemContaining.isItem(value[0]))
            .sort()
            .map(value => value[1]);
    }
    get itemLength() {
        return this.itemCount;
    }
}
ItemContaining.itemChildrenPrefix = "item";
var CheckboxEvents;
(function (CheckboxEvents) {
    CheckboxEvents["selected"] = "selected";
    CheckboxEvents["unselected"] = "unselected";
    CheckboxEvents["checkStateChanged"] = "checkStateChanged";
})(CheckboxEvents || (CheckboxEvents = {}));
class CheckboxContaining extends Mixin {
    constructor() {
        super(...arguments);
        this.checkBoxIcon = Icon.of("check_box_outline_blank", IconType.material);
    }
    _constructor() {
        this.addChild("checkBoxIcon");
    }
    buildCheckbox() {
        this.domObject.addClass("checkable");
        this.on2(WidgetEvents.clicked, () => this.setChecked(!this._checked));
        if (!this.checkBoxIcon.built) {
            this.checkBoxIcon.build();
        }
        return this.checkBoxIcon.domObject;
    }
    rebuildCheckbox() {
        this.domObject.toggleClass("checkable", this.checkboxEnabled);
        if (this.checkboxEnabled) {
            this.checkBoxIcon.set(this._checked ? "check_box" : "check_box_outline_blank", IconType.material)
                .domObject.toggleClass("checked", this._checked);
        }
        return this;
    }
    get checked() {
        return this._checked;
    }
    setChecked(value) {
        let changed = this._checked !== value;
        this._checked = value;
        if (changed) {
            this.dispatchEvent(this._checked ? CheckboxEvents.selected : CheckboxEvents.unselected, [this._checked], CheckboxEvents.checkStateChanged);
            if (this.built) {
                this.rebuildCheckbox();
            }
        }
        return this;
    }
    get checkboxEnabled() {
        return this.checkBoxIcon.inheritVisibility;
    }
    enableCheckbox(value) {
        this.checkBoxIcon.setInheritVisibility(value);
        if (this.built) {
            this.rebuildCheckbox();
        }
        return this;
    }
    get checkbox() {
        return this.checkBoxIcon;
    }
}
class IdContaining extends Mixin {
    setId(id) {
        this._id = id;
        return this;
    }
    get id() {
        return this._id;
    }
}
var InputEvents;
(function (InputEvents) {
    InputEvents["change"] = "change";
    InputEvents["input"] = "input";
})(InputEvents || (InputEvents = {}));
let Input = class Input extends Mixin {
    rebuildInput(inputElement = this.domObject.find("input")) {
        inputElement.attr("id", this._id)
            .prop("disabled", this._disabled)
            .attr("name", this._name)
            .prop("readonly", this._readonly)
            .prop("required", this._required)
            .attr("type", this._type);
        return inputElement;
    }
    buildInput(element = $("<input>")) {
        if (this._type === ("checkbox" || "radio")) {
            return element
                .on("change", (event) => {
                this.dispatchEvent(TextInputEvents.change, [event.target.checked]);
            })
                .on("input", (event) => {
                this.dispatchEvent(TextInputEvents.input, [event.target.checked]);
            });
        }
        return element
            .on("change", (event) => {
            this.dispatchEvent(TextInputEvents.change, [event.target.value]);
        })
            .on("input", (event) => {
            this.dispatchEvent(TextInputEvents.input, [event.target.value]);
        });
    }
    get value() {
        return this.domObject.find("input").val();
    }
    setValue(value) {
        this.domObject.find("input").val(value);
        return this;
    }
    setId(id) {
        this._id = id;
        console.log("input id");
        return this;
    }
    setDisabled(disabled) {
        this._disabled = disabled;
        return this;
    }
    setName(name) {
        this._name = name;
        return this;
    }
    setReadonly(readonly) {
        this._readonly = readonly;
        return this;
    }
    setRequired(required) {
        this._required = required;
        return this;
    }
    setType(type) {
        this._type = type;
        return this;
    }
    get id() {
        return this._id;
    }
    get disabled() {
        return this._disabled;
    }
    get name() {
        return this._name;
    }
    get readonly() {
        return this._readonly;
    }
    get required() {
        return this._required;
    }
    get type() {
        return this._type;
    }
};
Input = __decorate([
    mixin(IdContaining)
], Input);
let InputLabel = class InputLabel extends Mixin {
    buildLabel() {
        return $("<label></label>");
    }
    rebuildLabel(labelElement = this.domObject.find("label")) {
        return labelElement
            .text(this._label)
            .attr("for", this._id);
    }
    setLabel(label) {
        this._label = label;
        return this;
    }
    get label() {
        return this._label;
    }
};
InputLabel = __decorate([
    mixin(IdContaining)
], InputLabel);
export { Util, OneIconContaining, LeadingTrailingIconContaining, IconContainingEvents, EventCallbacks, ColorEditable, SpacingEditable, ItemContaining, ItemContainingEvents, Item, CheckboxContaining, CheckboxEvents, Input, InputEvents, InputLabel };
