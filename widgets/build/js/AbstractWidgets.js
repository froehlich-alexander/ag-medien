import { Icon } from "./Widgets.js";
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
}
class EventCallbacks {
}
EventCallbacks.setHeight = new Pair(WidgetEvents.sizeSet, function (event) {
    Util.setHeight(event.target.domObject);
});
EventCallbacks.setWidth = new Pair(WidgetEvents.sizeSet, function (event) {
    Util.setWidth(event.target.domObject);
});
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
        this.children.set("trailingIcon", this.trailingIcon);
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
class ItemContaining extends Mixin {
    buildItem(item, inheritVisibility = true) {
        item.setInheritVisibility(inheritVisibility);
    }
    buildItems(domObject = this.domObject) {
        for (let i of this._items) {
            this.buildItem(i);
            domObject.append(i.build());
        }
        return this;
    }
    addItems(...items) {
        for (let i of items) {
            this.children.set("item" + this._items.push(i), i);
        }
        return this;
    }
    get items() {
        return this._items;
    }
}
export { Util, OneIconContaining, LeadingTrailingIconContaining, EventCallbacks, ColorEditable, SpacingEditable, ItemContaining };
