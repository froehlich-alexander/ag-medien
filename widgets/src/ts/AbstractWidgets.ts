import {Icon} from "./Widgets.js";
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

abstract class IconContaining<EventType extends WidgetEvents> extends Mixin {
    protected _setIcon(fieldName: string, icon: Icon): this {
        // @ts-ignore
        this[fieldName].set(icon.getValue(), icon.getType());
        // @ts-ignore
        // if (this[fieldName] != null) {
        //     // @ts-ignore
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

class OneIconContaining<EventType extends WidgetEvents> extends IconContaining<EventType> {
    private readonly icon: Icon = new Icon();

    _constructor() {
        // @ts-ignore
        this.children.set("icon", this.icon);
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
        // @ts-ignore
        this.children.set("leadingIcon", this.leadingIcon);
        // @ts-ignore
        this.children.set("trailingIcon", this.trailingIcon);
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
        // @ts-ignore
        this.domObject.css("background-color", this._backgroundColor.get());
        // @ts-ignore
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

class SpacingEditable extends Mixin{
    private readonly _padding: [string, string, string, string] = [null, null, null, null];
    private readonly _margin: [string, string, string, string] = [null, null, null, null];

    buildSpacing() : this {
        // @ts-ignore
        this.domObject.css("padding-top", this._padding[0]);
        // @ts-ignore
        this.domObject.css("padding-right", this._padding[1]);
        // @ts-ignore
        this.domObject.css("padding-bottom", this._padding[2]);
        // @ts-ignore
        this.domObject.css("padding-left", this._padding[3]);

        // @ts-ignore
        this.domObject.css("margin-top", this._margin[0]);
        // @ts-ignore
        this.domObject.css("margin-right", this._margin[1]);
        // @ts-ignore
        this.domObject.css("margin-bottom", this._margin[2]);
        // @ts-ignore
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

export {Util, OneIconContaining, LeadingTrailingIconContaining, EventCallbacks, ColorEditable, SpacingEditable};