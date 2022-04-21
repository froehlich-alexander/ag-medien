var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { assertType, hasMixins, mixin, Mixin } from "./base.js";
import { WidgetEvents } from "./Widget.js";
import { CSSColorValue } from "./WidgetBase.js";
import { Icon, IconEvents, IconType, Text, TextInputEvents } from "./Widgets.js";
class ColorEditable extends Mixin {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "_backgroundColor", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new CSSColorValue()
        });
        Object.defineProperty(this, "_textColor", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new CSSColorValue()
        });
    }
    /**
     * Do not use this in a class which does not have the field "domObject" defined (does not extend {@link Widget})
     * @return {this}
     * @protected
     */
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
        // @ts-ignore
        Object.defineProperty(this, "_padding", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: [null, null, null, null]
        });
        // @ts-ignore
        Object.defineProperty(this, "_margin", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: [null, null, null, null]
        });
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
    /**
     * Set them to {@link undefined} or {@link null} to avoid overwriting the original value
     * @param {string} top
     * @param {string} right
     * @param {string} bottom
     * @param {string} left
     * @return {this}
     */
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
    /**
     * Set them to {@link undefined} or {@link null} to avoid overwriting the original value
     * @param {string} top
     * @param {string} right
     * @param {string} bottom
     * @param {string} left
     * @return {this}
     */
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
    /**
     * returns a copy
     * @return {[string, string, string, string]}
     */
    get padding() {
        return [...this._padding];
    }
    /**
     * returns a copy
     * @return {[string, string, string, string]}
     */
    get margin() {
        return [...this._margin];
    }
}
var IconContainingEvents;
(function (IconContainingEvents) {
    IconContainingEvents["iconClicked"] = "iconClicked";
})(IconContainingEvents || (IconContainingEvents = {}));
class IconContaining extends Mixin {
    _setIcon(fieldName, icon) {
        let icon1 = this[fieldName];
        assertType(icon1, Icon);
        if (icon.value !== undefined) {
            icon1.setValue(icon.value);
        }
        icon1.setType(icon.type);
        return this;
    }
    _getIcon(fieldName) {
        let icon = this[fieldName];
        assertType(icon, Icon);
        return icon;
    }
    _enableIcon(fieldName, value) {
        let icon = this[fieldName];
        assertType(icon, Icon);
        if (!value) {
            if (icon.value === undefined) {
                icon.set(null);
            }
        }
        icon.setInheritVisibility(value);
        return this;
    }
    _iconEnabled(fieldName) {
        let icon = this[fieldName];
        assertType(icon, Icon);
        return icon.inheritVisibility;
    }
}
class OneIconContaining extends IconContaining {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "_icon", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Icon()
        });
    }
    _constructor() {
        this.addChild("icon", this._icon);
        this._icon.on(IconEvents.clicked, () => this.dispatchEvent(IconContainingEvents.iconClicked, [this._icon, 0]));
    }
    setIcon(icon) {
        return super._setIcon("icon", icon);
    }
    enableIcon(value) {
        return super._enableIcon("icon", value);
    }
    iconEnabled() {
        return super._iconEnabled("icon");
    }
    get icon() {
        return this._icon;
    }
}
class LeadingTrailingIconContaining extends IconContaining {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "_leadingIcon", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Icon()
        });
        Object.defineProperty(this, "_trailingIcon", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Icon()
        });
    }
    _constructor() {
        this.addChild("leadingIcon", this._leadingIcon);
        this._leadingIcon.on(IconEvents.clicked, () => this.dispatchEvent(IconContainingEvents.iconClicked, [this._leadingIcon, 0]));
        this.addChild("trailingIcon", this._trailingIcon);
        this._trailingIcon.on(IconEvents.clicked, () => this.dispatchEvent(IconContainingEvents.iconClicked, [this._trailingIcon, 1]));
    }
    setLeadingIcon(icon) {
        return super._setIcon("leadingIcon", icon);
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
    enableTrailingIcon(value) {
        return super._enableIcon("trailingIcon", value);
    }
    trailingIconEnabled() {
        return super._iconEnabled("trailingIcon");
    }
    get leadingIcon() {
        return this._leadingIcon;
    }
    get trailingIcon() {
        return this._trailingIcon;
    }
}
var ItemContainingEvents;
(function (ItemContainingEvents) {
    ItemContainingEvents["itemAdded"] = "";
    ItemContainingEvents["itemRemoved"] = "";
})(ItemContainingEvents || (ItemContainingEvents = {}));
class Item extends Mixin {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "_index", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: -1
        });
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
        Object.defineProperty(this, "itemCount", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
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
            //insert items
            if (!(this.domObject.find(i.domObject).length > 0)) {
                if (pre !== undefined) {
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
            for (let item of (i instanceof Array ? i : [i])) {
                this.addChild(ItemContaining.itemChildrenPrefix + this.itemCount, item);
                if (this.built && !item.built) {
                    item.build();
                }
                this.dispatchEvent(ItemContainingEvents.itemAdded, [this.itemCount, item]);
                if (hasMixins(item, Item)) {
                    console.log(item.constructor);
                    item.setIndex(this.itemCount);
                }
                this.itemCount++;
            }
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
    /**
     * This orders the items new if some items are removed<br>
     * e.g. you delete item 2 from this list {1 -> x, 2 -> y, 3 -> e, 4 -> r} -> {1 -> x, 3 -> e, 4 -> r} -><br>
     * End product produced by this function: {1 -> x, 2 -> e, 3 -> r}<br>
     * (indexes still start at 0)
     * @param {number} indexes
     * @private
     */
    reassignDeletedIndexes(...indexes) {
        indexes.sort();
        let removed = new Map();
        for (let i = 0; i < this.itemCount; i++) {
            let item = this.children.get(ItemContaining.itemChildrenPrefix + i);
            let newIndex = i;
            //item does not exist
            if (item === undefined) {
                continue;
            }
            //delete items
            if (indexes.indexOf(i) !== -1) {
                this.children.delete(ItemContaining.itemChildrenPrefix + i);
                removed.set(i, item);
                item.hide();
                item.domObject.detach();
                continue;
            }
            //moving items
            for (let j of indexes) {
                //item does not have to move
                if (j > i) {
                    break;
                }
                newIndex -= 1;
            }
            this.children.delete(ItemContaining.itemChildrenPrefix + i);
            this.addChild(ItemContaining.itemChildrenPrefix + newIndex, item);
            if (hasMixins(item, Item)) {
                item.setIndex(newIndex);
            }
        }
        this.itemCount -= removed.size;
        //callback
        for (let [k, v] of removed.entries()) {
            this.dispatchEvent(ItemContainingEvents.itemRemoved, [k, v]);
        }
        //rebuild
        if (this.built && removed.size > 0) {
            this.rebuild();
        }
        console.assert(this.itemCount === [...this.children.keys()].filter(value => ItemContaining.isItem(value)).length);
    }
    orderItems() {
        for (let i = 0; i < this.itemCount; i++) {
            let item = this.getItem(i);
            if (hasMixins(item, Item)) {
                if (i !== item.index) {
                    this.setNewIndex(item, i, item.index);
                }
            }
        }
        return this;
    }
    setNewIndex(item, oldIndex, newIndex) {
        let otherItem = this.getItem(newIndex);
        if (otherItem !== undefined && hasMixins(otherItem, Item)) {
            this.setNewIndex(otherItem, newIndex, otherItem.index);
        }
        this.children.set(ItemContaining.itemChildrenPrefix + newIndex, item);
    }
    removeItems(...items) {
        let indexes = [];
        for (let [k, v] of this.children) {
            if (items.indexOf(v) !== -1 && ItemContaining.isItem(k)) {
                // this.children.delete(k);
                // this.dispatchEvent(ItemContainingEvents.itemRemoved, [ItemContaining.itemIndex(k), v]);
                indexes.push(ItemContaining.itemIndex(k));
            }
        }
        this.reassignDeletedIndexes(...indexes);
        return this;
    }
    removeItem(...indexes) {
        // for (let index of indexes) {
        //     let item = this.children.get(ItemContaining.itemChildrenPrefix + indexes);
        //     this.children.delete(ItemContaining.itemChildrenPrefix + index);
        //     this.dispatchEvent(ItemContainingEvents.itemRemoved, [index, item]);
        // }
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
    getItem(index) {
        return this.children.get(ItemContaining.itemChildrenPrefix + index);
    }
}
Object.defineProperty(ItemContaining, "itemChildrenPrefix", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: "item"
});
var CheckboxEvents;
(function (CheckboxEvents) {
    CheckboxEvents["selected"] = "selected";
    CheckboxEvents["unselected"] = "unselected";
    CheckboxEvents["checkStateChanged"] = "checkStateChanged";
})(CheckboxEvents || (CheckboxEvents = {}));
class CheckboxContaining extends Mixin {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "checkBoxIcon", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: Icon.of("check_box_outline_blank", IconType.material)
        });
        Object.defineProperty(this, "_checked", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
    }
    _constructor() {
        this.addChild("checkBoxIcon");
    }
    buildCheckbox() {
        this.domObject.addClass("checkable");
        this.on(WidgetEvents.clicked, () => this.setChecked(!this._checked));
        if (!this.checkBoxIcon.built) {
            this.checkBoxIcon.build();
        }
        return this.checkBoxIcon.domObject;
        // .addClass(this.checked ? "checked" : null)
        // .text(this.checked ? "check_box" : "check_box_outline_blank");
    }
    rebuildCheckbox() {
        this.domObject.toggleClass("checkable", this.checkboxEnabled);
        if (this.checkboxEnabled) {
            this.checkBoxIcon.set(this._checked ? "check_box" : "check_box_outline_blank", IconType.material)
                .rebuild()
                .toggleClass("checked", this._checked);
            // this.checkBoxIcon.domObject
            //     .text(this._checked ? "check_box" : "check_box_outline_blank")
            //     .addClass(this._checked ? "checked" : null);
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
            this.dispatchEvent(this._checked ? CheckboxEvents.selected : CheckboxEvents.unselected, [this._checked], undefined, CheckboxEvents.checkStateChanged);
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
var FavoriteEvents;
(function (FavoriteEvents) {
    FavoriteEvents["favoriteStateChanged"] = "favoriteStateChanged";
    FavoriteEvents["favored"] = "favored";
    FavoriteEvents["unFavored"] = "unFavored";
})(FavoriteEvents || (FavoriteEvents = {}));
class FavoriteContaining extends Mixin {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "_favored", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "favoriteIcon", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: Icon.of("favorite_border", IconType.material)
        });
    }
    _constructor() {
        this.addChild("favoriteIcon");
    }
    buildFavorite(triggerEventOnIcon = false) {
        this.domObject.addClass("favorable");
        (triggerEventOnIcon ? this.favoriteIcon : this).on(WidgetEvents.clicked, (event) => this.setFavored(!this._favored, event.originalEvent));
        if (!this.favoriteIcon.built) {
            this.favoriteIcon.build();
        }
        return this.favoriteIcon.domObject;
        // .addClass(this.checked ? "checked" : null)
        // .text(this.checked ? "check_box" : "check_box_outline_blank");
    }
    rebuildFavorite() {
        // this.domObject.toggleClass("favored", this.favoriteEnabled);
        if (this.favoriteEnabled) {
            this.favoriteIcon.set(this._favored ? "favorite" : "favorite_border", IconType.material)
                .rebuild()
                .toggleClass("favored", this._favored);
            // this.checkBoxIcon.domObject
            //     .text(this._checked ? "check_box" : "check_box_outline_blank")
            //     .addClass(this._checked ? "checked" : null);
        }
        return this;
    }
    setFavored(value, originalEvent = null) {
        let changed = this._favored !== value;
        this._favored = value;
        if (changed) {
            this.dispatchEvent(this._favored ? FavoriteEvents.favored : FavoriteEvents.unFavored, [this._favored], originalEvent, FavoriteEvents.favoriteStateChanged);
            if (this.built) {
                this.rebuildFavorite();
            }
        }
        return this;
    }
    enableFavorite(value) {
        this.favoriteIcon.setInheritVisibility(value);
        if (this.built) {
            this.rebuildFavorite();
        }
        return this;
    }
    get favoriteEnabled() {
        return this.favoriteIcon.inheritVisibility;
    }
    get favored() {
        return this._favored;
    }
    get favorite() {
        return this.favoriteIcon;
    }
}
class LabelContaining extends Mixin {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "_label", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Text()
        });
    }
    _constructor() {
        this.addChild("_label");
    }
    enableLabel(value) {
        this._label.setInheritVisibility(value);
        if (this.built) {
            this._label.rebuild();
        }
        return this;
    }
    get labelEnabled() {
        return this._label.inheritVisibility;
    }
    get label() {
        return this._label.get();
    }
    setLabel(label) {
        this._label.set(label);
        return this;
    }
}
class IdContaining extends Mixin {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "_id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
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
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "_disabled", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "_name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ""
        });
        Object.defineProperty(this, "_readonly", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "_required", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "_type", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ""
        });
        Object.defineProperty(this, "_value", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    rebuildInput(inputElement = this.domObject.find("input")) {
        inputElement.attr("id", this.id)
            .prop("disabled", this._disabled)
            .attr("name", this._name)
            .prop("readonly", this._readonly)
            .prop("required", this._required)
            .attr("type", this._type);
        return inputElement;
    }
    buildInput(element = $("<input>")) {
        element.val(this._value);
        if (this._type === "checkbox" || this._type === "radio") {
            return element
                .on("change", (event) => {
                this.dispatchEvent(TextInputEvents.change, [event.target.checked], event);
            })
                .on("input", (event) => {
                this.dispatchEvent(TextInputEvents.input, [event.target.checked], event);
            });
        }
        return element
            .on("change", (event) => {
            this.dispatchEvent(TextInputEvents.change, [event.target.value], event);
        })
            .on("input", (event) => {
            this.dispatchEvent(TextInputEvents.input, [event.target.value], event);
        });
    }
    get value() {
        return this.domObject.find("input").val() !== "" ? this.domObject.find("input").val() : null;
    }
    setValue(value) {
        var _a;
        this._value = value;
        (_a = this.domObject) === null || _a === void 0 ? void 0 : _a.find("input").val(value);
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
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "_label", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    buildLabel() {
        return $("<label></label>");
    }
    rebuildLabel(labelElement = this.domObject.find("label")) {
        assertType(this._label, "string");
        return labelElement
            .text(this._label)
            .attr("for", this.id);
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
export { OneIconContaining, LeadingTrailingIconContaining, IconContainingEvents, ColorEditable, SpacingEditable, ItemContaining, ItemContainingEvents, Item, CheckboxContaining, CheckboxEvents, FavoriteContaining, FavoriteEvents, LabelContaining, Input, InputEvents, InputLabel };
//# sourceMappingURL=AbstractWidgets.js.map