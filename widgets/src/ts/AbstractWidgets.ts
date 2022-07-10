import {assertType, hasMixins, mixin, Mixin} from "./base.js";
import {Widget, WidgetBase, WidgetEvents} from "./Widget.js";
import {CSSColorValue} from "./WidgetBase.js";
import {Icon, IconEvents, IconType, Text, TextInputEvents} from "./Widgets.js";
import Event = JQuery.Event;

class ColorEditable<EventType extends WidgetEvents, HtmlElementType extends HTMLElement> extends Mixin {
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

interface ColorEditable<EventType extends WidgetEvents, HtmlElementType extends HTMLElement> extends Mixin, Widget<EventType, HtmlElementType> {
}

class SpacingEditable<EventType extends WidgetEvents, HtmlElementType extends HTMLElement> extends Mixin {
    // @ts-ignore
    private readonly _padding: [string, string, string, string] = [null, null, null, null];
    // @ts-ignore
    private readonly _margin: [string, string, string, string] = [null, null, null, null];

    protected buildSpacing(): this {
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

interface SpacingEditable<EventType extends WidgetEvents, HtmlElementType extends HTMLElement> extends Mixin, Widget<EventType, HtmlElementType> {
}

enum IconContainingEvents {
    iconClicked = "iconClicked"
}

abstract class IconContaining<EventType extends WidgetEvents & IconContainingEvents, HtmlElementType extends HTMLElement> extends Mixin {
    protected _setIcon(fieldName: keyof this, icon: Icon): this {
        let icon1 = this[fieldName];
        assertType<Icon>(icon1, Icon);
        if (icon.value !== undefined) {
            icon1.setValue(icon.value);
        }
        icon1.setType(icon.type);
        return this;
    }

    protected _getIcon(fieldName: keyof this & string): Icon {
        let icon = this[fieldName];
        assertType<Icon>(icon, Icon);
        return icon as unknown as Icon;
    }

    protected _enableIcon(fieldName: keyof this, value: boolean): this {
        let icon = this[fieldName];
        assertType<Icon>(icon, Icon);
        if (!value) {
            if (icon.value === undefined) {
                icon.set(null);
            }
        }
        icon.setInheritVisibility(value);
        return this;
    }

    protected _iconEnabled(fieldName: keyof this): boolean {
        let icon = this[fieldName];
        assertType<Icon>(icon, Icon);
        return icon.inheritVisibility;
    }
}

interface IconContaining<EventType extends WidgetEvents & IconContainingEvents, HtmlElementType extends HTMLElement> extends Mixin, Widget<EventType, HtmlElementType> {
}

class OneIconContaining<EventType extends WidgetEvents&IconContainingEvents, HtmlElementType extends HTMLElement> extends IconContaining<EventType, HtmlElementType> {
    private readonly _icon: Icon = new Icon();

    _constructor() {
        this.addChild("icon", this._icon);
        this._icon.on(IconEvents.clicked, () => this.dispatchEvent(IconContainingEvents.iconClicked, [this._icon, 0]));
    }

    public setIcon(icon: Icon): this {
        return super._setIcon("icon", icon);
    }

    public enableIcon(value: boolean): this {
        return super._enableIcon("icon", value);
    }

    public iconEnabled(): boolean {
        return super._iconEnabled("icon");
    }

    public get icon(): Icon {
        return this._icon;
    }
}

class LeadingTrailingIconContaining<EventType extends WidgetEvents & IconContainingEvents, HtmlElementType extends HTMLElement> extends IconContaining<EventType, HtmlElementType> {
    private readonly _leadingIcon: Icon = new Icon();
    private readonly _trailingIcon: Icon = new Icon();

    _constructor(): void {
        this.addChild("leadingIcon", this._leadingIcon);
        this._leadingIcon.on(IconEvents.clicked, () => this.dispatchEvent(IconContainingEvents.iconClicked, [this._leadingIcon, 0]));
        this.addChild("trailingIcon", this._trailingIcon);
        this._trailingIcon.on(IconEvents.clicked, () => this.dispatchEvent(IconContainingEvents.iconClicked, [this._trailingIcon, 1]));
    }

    public setLeadingIcon(icon: Icon): this {
        return super._setIcon("leadingIcon", icon);
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

    public enableTrailingIcon(value: boolean): this {
        return super._enableIcon("trailingIcon", value);
    }

    public trailingIconEnabled(): boolean {
        return super._iconEnabled("trailingIcon");
    }

    public get leadingIcon(): Icon {
        return this._leadingIcon;
    }

    public get trailingIcon(): Icon {
        return this._trailingIcon;
    }
}

enum ItemContainingEvents {
    itemAdded = "",
    itemRemoved = "",
}

class Item extends Mixin {
    private _index: number = -1;

    public get index(): number {
        return this._index;
    }

    public setIndex(index: number): this {
        this._index = index;
        return this;
    }
}

class ItemContaining<EventType extends WidgetEvents, HtmlElementType extends HTMLElement, ItemType extends WidgetBase<WidgetEvents, HTMLElement>> extends Mixin {
    private static itemChildrenPrefix: string = "item";
    private itemCount = 0;

    protected buildItem(item: ItemType, inheritVisibility: boolean = true): void {
        item.setInheritVisibility(inheritVisibility);
    }

    protected buildItems(): this {
        for (let i of [...this.children.entries()]
            .filter(value => ItemContaining.isItem(value[0]))
            .sort()
            .map(value => value[1])) {
            this.buildItem(i as ItemType);
            this.domObject.append(i.build());
        }
        return this;
    }

    protected rebuildItems(): this {
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
                } else {
                    this.domObject.append(i.domObject);
                }
            }
            i.rebuild();
            pre = i;
        }
        return this;
    }

    public addItems(...items: ItemType[] | ItemType[][]): this {
        for (let i of items) {
            for (let item of (i instanceof Array ? i : [i])) {
                this.addChild(ItemContaining.itemChildrenPrefix + this.itemCount, item);
                if (this.built && !item.built) {
                    item.build();
                }
                this.dispatchEvent(ItemContainingEvents.itemAdded, [this.itemCount, item]);
                if (hasMixins<Item>(item, Item)) {
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
            if (hasMixins<Item>(item, Item)) {
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

    public orderItems(): this {
        for (let i = 0; i < this.itemCount; i++) {
            let item = this.getItem(i);
            if (hasMixins<Item>(item, Item)) {
                if (i !== item.index) {
                    this.setNewIndex(item, i, item.index);
                }
            }
        }
        return this;
    }

    private setNewIndex(item: ItemType, oldIndex: number, newIndex: number): void {
        let otherItem = this.getItem(newIndex);
        if (otherItem !== undefined && hasMixins<Item>(otherItem, Item)) {
            this.setNewIndex(otherItem, newIndex, otherItem.index);
        }
        this.children.set(ItemContaining.itemChildrenPrefix + newIndex, item);
    }

    public removeItems(...items: ItemType[]): this {
        let indexes = [];
        for (let [k, v] of this.children) {
            if (items.indexOf(v as ItemType) !== -1 && ItemContaining.isItem(k)) {
                // this.children.delete(k);
                // this.dispatchEvent(ItemContainingEvents.itemRemoved, [ItemContaining.itemIndex(k), v]);
                indexes.push(ItemContaining.itemIndex(k));
            }
        }
        this.reassignDeletedIndexes(...indexes);
        return this;
    }

    public removeItem(...indexes: number[]): this {
        // for (let index of indexes) {
        //     let item = this.children.get(ItemContaining.itemChildrenPrefix + indexes);
        //     this.children.delete(ItemContaining.itemChildrenPrefix + index);
        //     this.dispatchEvent(ItemContainingEvents.itemRemoved, [index, item]);
        // }
        this.reassignDeletedIndexes(...indexes);
        return this;
    }

    public get items(): ItemType[] {
        return [...(this.children.entries() as IterableIterator<[string, ItemType]>)]
            .filter(value => ItemContaining.isItem(value[0]))
            .sort()
            .map(value => value[1]);
    }

    public get itemLength(): number {
        return this.itemCount;
    }

    public getItem(index: number): ItemType | undefined {
        return this.children.get(ItemContaining.itemChildrenPrefix + index) as ItemType;
    }
}

interface ItemContaining<EventType extends WidgetEvents, HtmlElementType extends HTMLElement, ItemType extends WidgetBase<WidgetEvents, HTMLElement>> extends Mixin, Widget<EventType, HtmlElementType> {
}

enum CheckboxEvents {
    selected = "selected",
    unselected = "unselected",
    checkStateChanged = "checkStateChanged"
}

interface CheckboxContaining<EventType extends WidgetEvents & CheckboxEvents, HtmlElementType extends HTMLElement> extends Widget<EventType, HtmlElementType> {
}

class CheckboxContaining<EventType extends WidgetEvents & CheckboxEvents, HtmlElementType extends HTMLElement> extends Mixin {
    private readonly checkBoxIcon: Icon = Icon.of("check_box_outline_blank", IconType.material);
    private _checked: boolean = false;

    _constructor() {
        this.addChild("checkBoxIcon");
    }

    public buildCheckbox(): JQuery<HTMLElement> {
        this.domObject.addClass("checkable");
        this.on(WidgetEvents.clicked, () => this.setChecked(!this._checked));
        if (!this.checkBoxIcon.built) {
            this.checkBoxIcon.build();
        }
        return this.checkBoxIcon.domObject;
        // .addClass(this.checked ? "checked" : null)
        // .text(this.checked ? "check_box" : "check_box_outline_blank");
    }

    protected rebuildCheckbox(): this {
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

    public get checked(): boolean {
        return this._checked;
    }

    public setChecked(value: boolean): this {
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

    get checkboxEnabled(): boolean {
        return this.checkBoxIcon.inheritVisibility;
    }

    public enableCheckbox(value: boolean): this {
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

enum FavoriteEvents {
    favoriteStateChanged = "favoriteStateChanged",
    favored = "favored",
    unFavored = "unFavored"
}

interface FavoriteContaining<EventType extends WidgetEvents & FavoriteEvents, HtmlElementType extends HTMLElement> extends Widget<EventType, HtmlElementType> {
}

class FavoriteContaining<EventType extends WidgetEvents & FavoriteEvents, HtmlElementType extends HTMLElement> extends Mixin {
    private _favored: boolean = false;
    private favoriteIcon: Icon = Icon.of("favorite_border", IconType.material);

    _constructor() {
        this.addChild("favoriteIcon");
    }

    public buildFavorite(triggerEventOnIcon: boolean = false): JQuery<HTMLDivElement> {
        this.domObject.addClass("favorable");
        (triggerEventOnIcon ? this.favoriteIcon : this).on(WidgetEvents.clicked, (event) => this.setFavored(!this._favored, event.originalEvent));
        if (!this.favoriteIcon.built) {
            this.favoriteIcon.build();
        }
        return this.favoriteIcon.domObject;
        // .addClass(this.checked ? "checked" : null)
        // .text(this.checked ? "check_box" : "check_box_outline_blank");
    }

    protected rebuildFavorite(): this {
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

    public setFavored(value: boolean, originalEvent: Event | null = null): this {
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

    public enableFavorite(value: boolean): this {
        this.favoriteIcon.setInheritVisibility(value);
        if (this.built) {
            this.rebuildFavorite();
        }
        return this;
    }

    get favoriteEnabled(): boolean {
        return this.favoriteIcon.inheritVisibility;
    }

    public get favored(): boolean {
        return this._favored;
    }

    get favorite() {
        return this.favoriteIcon;
    }
}

interface LabelContaining<EventType extends WidgetEvents & FavoriteEvents, HtmlElementType extends HTMLElement> extends Widget<EventType, HtmlElementType> {
}

class LabelContaining<EventType extends WidgetEvents & FavoriteEvents, HtmlElementType extends HTMLElement> extends Mixin {
    protected readonly _label: Text = new Text();

    _constructor() {
        this.addChild("_label");
    }

    public enableLabel(value: boolean): this {
        this._label.setInheritVisibility(value);
        if (this.built) {
            this._label.rebuild();
        }
        return this;
    }

    get labelEnabled(): boolean {
        return this._label.inheritVisibility;
    }

    public get label(): string {
        return this._label.get();
    }

    public setLabel(label: string): this {
        this._label.set(label);
        return this;
    }
}

class IdContaining extends Mixin {
    protected _id?: string;

    public setId(id: string): this {
        this._id = id;
        return this;
    }

    public get id(): string {
        return this._id!;
    }
}

enum InputEvents {
    change = "change",
    input = "input",
}

@mixin(IdContaining)
class Input<ValueType extends string | number, EventType extends WidgetEvents & InputEvents, HtmlElementType extends HTMLElement = HTMLInputElement> extends Mixin {
    private _disabled: boolean = false;
    private _name: string = "";
    private _readonly: boolean = false;
    private _required: boolean = false;
    private _type: string = "";
    private _value?: ValueType;

    protected rebuildInput(inputElement: JQuery<HTMLInputElement> = this.domObject.find("input")): JQuery<HTMLInputElement> {
        inputElement.attr("id", this.id)
            .prop("disabled", this._disabled)
            .attr("name", this._name)
            .prop("readonly", this._readonly)
            .prop("required", this._required)
            .attr("type", this._type);
        return inputElement;
    }

    protected buildInput(element: JQuery<HTMLInputElement> = $("<input>")): JQuery<HTMLInputElement> {
        element.val(this._value!);
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

    public get value(): ValueType | null {
        return <ValueType>this.domObject.find("input").val() !== "" ? <ValueType>this.domObject.find("input").val() : null;
    }

    public setValue(value: ValueType): this {
        this._value = value;
        this.domObject?.find("input").val(value);
        return this;
    }

    public setDisabled(disabled: boolean): this {
        this._disabled = disabled;
        return this;
    }

    public setName(name: string): this {
        this._name = name;
        return this;
    }

    public setReadonly(readonly: boolean): this {
        this._readonly = readonly;
        return this;
    }

    public setRequired(required: boolean): this {
        this._required = required;
        return this;
    }

    public setType(type: string): this {
        this._type = type;
        return this;
    }

    public get disabled(): boolean {
        return this._disabled;
    }

    public get name(): string {
        return this._name;
    }

    public get readonly(): boolean {
        return this._readonly;
    }

    public get required(): boolean {
        return this._required;
    }

    public get type(): string {
        return this._type;
    }
}

interface Input<ValueType extends string | number, EventType extends WidgetEvents & InputEvents, HtmlElementType extends HTMLElement = HTMLInputElement> extends IdContaining, Widget<EventType, HtmlElementType> {
}

@mixin(IdContaining)
class InputLabel<EventType extends WidgetEvents, HtmlElementType extends HTMLElement> extends Mixin {
    private _label: string | undefined;

    protected buildLabel(): JQuery<HTMLLabelElement> {
        return $("<label></label>");
    }

    protected rebuildLabel(labelElement: JQuery<HTMLLabelElement> = this.domObject.find("label")): JQuery<HTMLLabelElement> {
        assertType<string>(this._label, "string");
        return labelElement
            .text(this._label)
            .attr("for", this.id);
    }

    public setLabel(label: string): this {
        this._label = label;
        return this;
    }

    public get label(): string | undefined {
        return this._label;
    }
}

interface InputLabel<EventType extends WidgetEvents, HtmlElementType extends HTMLElement> extends IdContaining, Widget<EventType, HtmlElementType> {
}


export {
    OneIconContaining,
    LeadingTrailingIconContaining,
    IconContainingEvents,
    ColorEditable,
    SpacingEditable,
    ItemContaining,
    ItemContainingEvents,
    Item,
    CheckboxContaining,
    CheckboxEvents,
    FavoriteContaining,
    FavoriteEvents,
    LabelContaining,
    Input,
    InputEvents,
    InputLabel
};