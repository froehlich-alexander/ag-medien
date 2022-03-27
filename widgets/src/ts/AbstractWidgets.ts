import {cssNumber} from "jquery";
import {Icon, IconEvents} from "./Widgets.js";
import {EventHandler, Widget, WidgetEvents} from "./Widget.js";
import {Mixin, Pair} from "./base.js";
import {CSSColorValue} from "./WidgetBase.js";

class Util {
    static setHeight(element: JQuery<HTMLElement>): void {
        element.outerHeight(element.outerHeight(false), false);
    }

    static setWidth(element: JQuery<HTMLElement>): void {
        element.outerWidth(element.outerWidth(false), false);
    }

    /**
     * Add something to a css-property of a Html Element
     * @param element the {@link JQuery} Html Element
     * @param property the name of the css property
     * @param value the value to add to
     */
    static addCssProperty(element: JQuery<HTMLElement>, property: string, value: string | number): JQuery<HTMLElement> {
        if (value == null || value == "") {
            return element;
        }
        if (element.get(0).style.getPropertyValue(property) === "") {
            element.css(property, value);
        } else {
            element.css(property, "calc(" + element.get(0).style.getPropertyValue(property) + "+" + value + ")");
        }
        return element;
    }

    static setHeightToRemaining(parent: JQuery<HTMLElement>, child: JQuery<HTMLElement>): void {
        let w = 0;
        for (let i = 0; i < parent.children().length; i++) {
            w += parent.children().not(child).outerHeight(true);
        }
        child.css("max-height", `calc(100% - ${w}px`);
    }

    static setWidthToRemaining(parent: JQuery<HTMLElement>, child: JQuery<HTMLElement>): void {
        let w = 0;
        for (let i = 0; i < parent.children().length; i++) {
            w += parent.children().not(child).outerWidth(true);
        }
        child.css("max-width", `calc(100% - ${w}px`);
    }
}

class EventCallbacks {
    /**
     * Calculates and sets the height of an element
     * @type Pair
     */
    static setHeight = new Pair<WidgetEvents, EventHandler<WidgetEvents, Widget<WidgetEvents>>>(
        WidgetEvents.sizeSet, function (event) {
            Util.setHeight(event.target.domObject);
        });

    /**
     * Calculates and sets the width of an element
     * @type Pair
     */
    static setWidth = new Pair<WidgetEvents, EventHandler<WidgetEvents, Widget<WidgetEvents>>>(
        WidgetEvents.sizeSet, function (event) {
            Util.setWidth(event.target.domObject);
        });

    // static setWidthToRemaining = (child: Widget<WidgetEvents>) => new Pair<WidgetEvents, EventHandler<WidgetEvents, Widget<WidgetEvents>>>(WidgetEvents.sizeSet, function (event) {
    //     Util.setWidthToRemaining(event.target.domObject, child.domObject);
    // });
    //
    // static setHeightToRemaining = (child: Widget<WidgetEvents>) => new Pair<WidgetEvents, EventHandler<WidgetEvents, Widget<WidgetEvents>>>(WidgetEvents.sizeSet, function (event) {
    //     Util.setHeightToRemaining(event.target.domObject, child.domObject);
    // });

    static setWidthToRemaining = new Pair<WidgetEvents, EventHandler<WidgetEvents, Widget<WidgetEvents>>>(WidgetEvents.sizeSet, function (event) {
        Util.setWidthToRemaining(event.target.domObject.parent(), event.target.domObject);
    });

    static setHeightToRemaining = new Pair<WidgetEvents, EventHandler<WidgetEvents, Widget<WidgetEvents>>>(WidgetEvents.sizeSet, function (event) {
        Util.setHeightToRemaining(event.target.domObject.parent(), event.target.domObject);
    });
}

// interface IconContainingInterface {
//     setIcon(icon: Icon): this;
//
//     getIcon(): Icon;
//
//     enableIcon(value: boolean): this;
//
//     iconEnabled(): boolean;
// }

enum IconContainingEvents {
    iconClicked = "iconClicked"
}

abstract class IconContaining<EventType extends WidgetEvents> extends Mixin {
    protected _setIcon(fieldName: string, icon: Icon): this {
        // @ts-ignore
        this[fieldName].set(icon.getValue(), icon.getType());
        // if (this[fieldName] != null) {
        //
        //     this.children.set(fieldName, this[fieldName]);
        // }
        return this;
    }

    protected _getIcon(fieldName: string): Icon {
        // @ts-ignore
        return this[fieldName];
    }

    protected _enableIcon(fieldName: string, value: boolean): this {
        // @ts-ignore
        if (this[fieldName] != null) {
            // @ts-ignore
            this[fieldName].setInheritVisibility(value);
        }
        return this;
    }

    protected _iconEnabled(fieldName: string): boolean {
        // @ts-ignore
        return this[fieldName].inheritVisibility;
    }
}

interface IconContaining<EventType extends WidgetEvents> extends Mixin, Widget<WidgetEvents | IconContainingEvents> {
}

class OneIconContaining<EventType extends WidgetEvents> extends IconContaining<EventType> {
    private readonly icon: Icon = new Icon();

    _constructor() {
        this.children.set("icon", this.icon);
        this.icon.on(undefined, new Pair(IconEvents.clicked, () => this.dispatchEvent(IconContainingEvents.iconClicked, [this.icon, 0])));
    }

    public setIcon(icon: Icon): this {
        return super._setIcon("icon", icon);
    }

    public getIcon(): Icon {
        return super._getIcon("icon");
    }

    public enableIcon(value: boolean): this {
        return super._enableIcon("icon", value);
    }

    public iconEnabled(): boolean {
        return super._iconEnabled("icon");
    }
}

class LeadingTrailingIconContaining<EventType extends WidgetEvents> extends IconContaining<EventType> {
    private readonly leadingIcon: Icon = new Icon();
    private readonly trailingIcon: Icon = new Icon();

    _constructor() {
        this.children.set("leadingIcon", this.leadingIcon);
        this.leadingIcon.on(undefined, new Pair(IconEvents.clicked, () => this.dispatchEvent(IconContainingEvents.iconClicked, [this.leadingIcon, 0])));
        this.children.set("trailingIcon", this.trailingIcon);
        this.trailingIcon.on(undefined, new Pair(IconEvents.clicked, () => this.dispatchEvent(IconContainingEvents.iconClicked, [this.trailingIcon, 1])));
    }

    public setLeadingIcon(icon: Icon): this {
        return super._setIcon("leadingIcon", icon);
    }

    public getLeadingIcon(): Icon {
        return super._getIcon("leadingIcon");
    }

    public enableLeadingIcon(value: boolean): this {
        return super._enableIcon("leadingIcon", value);
    }

    public leadingIconEnabled(): boolean {
        return super._iconEnabled("leadingIcon");
    }

    public setTrailingIcon(icon: Icon): this {
        return super._setIcon("trailingIcon", icon);
    }

    public getTrailingIcon(): Icon {
        return super._getIcon("trailingIcon");
    }

    public enableTrailingIcon(value: boolean): this {
        return super._enableIcon("trailingIcon", value);
    }

    public trailingIconEnabled(): boolean {
        return super._iconEnabled("trailingIcon");
    }
}

class ColorEditable extends Mixin {
    private readonly _backgroundColor: CSSColorValue = new CSSColorValue();
    private readonly _textColor: CSSColorValue = new CSSColorValue();

    /**
     * Do not use this in a class which does not have the field "domObject" defined (does not extend {@link Widget})
     * @return {this}
     * @protected
     */
    protected buildColor(): this {
        this.domObject.css("background-color", this._backgroundColor.get());
        this.domObject.css("color", this._textColor.get());
        return this;
    }

    public get backgroundColor(): CSSColorValue {
        return this._backgroundColor;
    }

    public get textColor(): CSSColorValue {
        return this._textColor;
    }
}

interface ColorEditable extends Mixin, Widget<WidgetEvents> {
}

class SpacingEditable extends Mixin {
    private readonly _padding: [string, string, string, string] = [null, null, null, null];
    private readonly _margin: [string, string, string, string] = [null, null, null, null];

    buildSpacing(): this {
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
    public setPadding(top?: string, right?: string, bottom?: string, left?: string): this {
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
    public setMargin(top?: string, right?: string, bottom?: string, left?: string): this {
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
    public get padding(): [string, string, string, string] {
        return [...this._padding];
    }

    /**
     * returns a copy
     * @return {[string, string, string, string]}
     */
    public get margin(): [string, string, string, string] {
        return [...this._margin];
    }
}

interface SpacingEditable extends Mixin, Widget<WidgetEvents> {
}

enum ItemContainingEvents {
    itemAdded = "",
    itemRemoved = "",
}

class ItemContaining extends Mixin {
    private static itemChildrenPrefix: string = "item";
    private itemCount = 0;

    protected buildItem(item: Widget<WidgetEvents>, inheritVisibility: boolean = true): void {
        item.setInheritVisibility(inheritVisibility);
    }

    protected buildItems(domObject: JQuery<HTMLElement> = this.domObject): this {
        for (let i of [...this.children.entries()]
            .filter(value => ItemContaining.isItem(value[0]))
            .map(value => value[1])) {
            this.buildItem(i);
            domObject.append(i.build());
        }
        return this;
    }

    public addItems(...items: Widget<WidgetEvents>[]): this {
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

    private static isItem(key: string): boolean {
        return key.startsWith(ItemContaining.itemChildrenPrefix) &&
            !Number.isNaN(Number.parseInt(key.substring(ItemContaining.itemChildrenPrefix.length, key.length), 10));
    }

    private static itemIndex(key: string): number {
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
    private reassignDeletedIndexes(...indexes: number[]) {
        indexes.sort();
        for (let i = 0; i < this.itemCount; i++) {
            //deleted items
            if (indexes.indexOf(i) !== -1) {
                continue;
            }
            let newIndex = i;
            let item = this.children.get(ItemContaining.itemChildrenPrefix + i);
            //item does not exist
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
        //rebuild
        if (this.built) {
            this.rebuild();
        }
        console.assert(this.itemCount === [...this.children.keys()].filter(value => ItemContaining.isItem(value)).length);
    }

    public removeItems(...items: Widget<WidgetEvents>[]): this {
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

    public removeItem(...indexes: number[]): this {
        for (let index of indexes) {
            let item = this.children.get(ItemContaining.itemChildrenPrefix + indexes);
            this.children.delete(ItemContaining.itemChildrenPrefix + index);
            this.dispatchEvent(ItemContainingEvents.itemRemoved, [index, item]);
        }
        this.reassignDeletedIndexes(...indexes);
        return this;
    }

    public get items(): Widget<WidgetEvents>[] {
        return [...this.children.entries()]
            .filter(value => ItemContaining.isItem(value[0]))
            .sort()
            .map(value => value[1]);
    }

    public get itemLength(): number {
        return this.itemCount;
    }
}

interface ItemContaining extends Mixin, Widget<WidgetEvents | ItemContainingEvents> {
}

export {
    Util,
    OneIconContaining,
    LeadingTrailingIconContaining,
    IconContainingEvents,
    EventCallbacks,
    ColorEditable,
    SpacingEditable,
    ItemContaining,
    ItemContainingEvents
};