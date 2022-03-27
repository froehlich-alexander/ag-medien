import { Icon, IconEvents } from "./Widgets.js";
import { WidgetEvents } from "./Widget.js";
import { Mixin, Pair } from "./base.js";
import { CSSColorValue } from "./WidgetBase.js";
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
        let w = 0;
        for (let i = 0; i < parent.children().length; i++) {
            w += parent.children().not(child).outerHeight(true);
        }
        child.css("max-height", `calc(100% - ${w}px`);
    }
    static setWidthToRemaining(parent, child) {
        let w = 0;
        for (let i = 0; i < parent.children().length; i++) {
            w += parent.children().not(child).outerWidth(true);
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
        this.children.set("icon", this.icon);
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
        this.children.set("leadingIcon", this.leadingIcon);
        this.leadingIcon.on(undefined, new Pair(IconEvents.clicked, () => this.dispatchEvent(IconContainingEvents.iconClicked, [this.leadingIcon, 0])));
        this.children.set("trailingIcon", this.trailingIcon);
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
class ItemContaining extends Mixin {
    constructor() {
        super(...arguments);
        this.itemCount = 0;
    }
    buildItem(item, inheritVisibility = true) {
        item.setInheritVisibility(inheritVisibility);
    }
    buildItems(domObject = this.domObject) {
        for (let i of [...this.children.entries()]
            .filter(value => ItemContaining.isItem(value[0]))
            .map(value => value[1])) {
            this.buildItem(i);
            domObject.append(i.build());
        }
        return this;
    }
    addItems(...items) {
        for (let i of items) {
            this.children.set(ItemContaining.itemChildrenPrefix + this.itemCount, i);
            this.itemCount++;
            this.dispatchEvent(ItemContainingEvents.itemAdded, [i]);
        }
        if (this.built) {
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
        for (let i = 0; i < this.itemCount; i++) {
            if (indexes.indexOf(i) !== -1) {
                continue;
            }
            let newIndex = i;
            let item = this.children.get(ItemContaining.itemChildrenPrefix + i);
            if (item === undefined) {
                continue;
            }
            for (let j of indexes) {
                if (j > i) {
                    break;
                }
                newIndex -= 1;
            }
            this.children.delete(ItemContaining.itemChildrenPrefix + i);
            this.children.set(ItemContaining.itemChildrenPrefix + newIndex, item);
        }
        this.itemCount -= indexes.length;
        if (this.built) {
            this.rebuild();
        }
        console.assert(this.itemCount === [...this.children.keys()].filter(value => ItemContaining.isItem(value)).length);
    }
    removeItems(...items) {
        let indexes = [];
        for (let [k, v] of this.children) {
            if (items.indexOf(v) !== -1 && ItemContaining.isItem(k)) {
                this.children.delete(k);
                this.dispatchEvent(ItemContainingEvents.itemRemoved, [ItemContaining.itemIndex(k), v]);
                indexes.push(ItemContaining.itemIndex(k));
            }
        }
        this.reassignDeletedIndexes(...indexes);
        return this;
    }
    removeItem(...indexes) {
        for (let index of indexes) {
            let item = this.children.get(ItemContaining.itemChildrenPrefix + indexes);
            this.children.delete(ItemContaining.itemChildrenPrefix + index);
            this.dispatchEvent(ItemContainingEvents.itemRemoved, [index, item]);
        }
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
export { Util, OneIconContaining, LeadingTrailingIconContaining, IconContainingEvents, EventCallbacks, ColorEditable, SpacingEditable, ItemContaining, ItemContainingEvents };
