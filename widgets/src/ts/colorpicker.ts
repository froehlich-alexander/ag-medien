import {mixin, MixinImplementing, toObject} from "./base.js";
import {EventCallbacks} from "./Util.js";
import {Widget, WidgetBase, WidgetEvents} from "./Widget.js";
import {Color, FontSize, FontWeight} from "./WidgetBase.js";
import {Overlay} from "./Overlay.js";
import {Dialog, DialogEvents} from "./Dialog.js";
import {
    CheckboxEvents,
    FavoriteContaining,
    FavoriteEvents, IconContainingEvents,
    Input,
    InputEvents,
    Item,
    ItemContainingEvents
} from "./AbstractWidgets.js";
import {
    Button,
    ButtonEvents,
    FlexAlign,
    FlexBox,
    Icon,
    IconType,
    ListTile,
    SelectBox,
    SelectBoxEvents,
    SelectBoxItem,
    Text,
    TextInput,
    TextInputEvents
} from "./Widgets.js";
import {Callbacks} from "jquery";

type ColorSchemeMap = Map<string, ColorScheme>;

class ColorMap extends Map<string, string> {
}

enum Designs {
    light = "light",
    dark = "darke",
    system = "system",
}

/**
 * Class for the colorSchemes saved to the local storage
 */
class ColorSchemeData {
    public name: string | undefined;
    public author: string | undefined;
    public id: string | undefined;
    public current: boolean | undefined;
    public preDefined: boolean | undefined;
    public colors: { [index: string]: string } | undefined;
    public design: string & Designs | undefined;
}

class ColorSchemeInterface {
    protected _name: string | undefined;
    protected _author: string | undefined;
    protected _id: string | undefined;
    protected readonly _colors: ColorMap = new ColorMap();
    protected _design: Designs = Designs.system;

    protected _current: boolean = false;
    protected _preDefined: boolean = false;
}

class ColorScheme extends ColorSchemeInterface {
    protected override readonly _id: string = "";

    constructor(service: ColorPickerService, id?: string, name?: string, author?: string, colors?: ColorMap);
    constructor(rawDataObject: ColorSchemeInterface);

    /**
     * DON'T USE THIS CONSTRUCTOR!!! USE {@link get} instead<br>
     * This will insert (random) strings if you set null for {@link _name} or {@link _id}
     * @param service {ColorPickerService}
     * @param id {string | null}
     * @param author {string | null}
     * @param name {string | null}
     * @param colors {{string: string}}
     */
    public constructor(service: ColorPickerService | ColorSchemeInterface, id?: string, name?: string, author?: string, colors: ColorMap = new Map()) {
        super();
        console.assert(service != null, "service is null");
        if (service instanceof ColorPickerService) {
            this._id = id != null ? id : service.generateId();
            this._name = name != null ? name : service.generateName();
            this._author = author != null ? author : "unknown";
            this._preDefined = false;
            for (let key of colors.keys()) {
                this._colors.set(key, colors.get(key) != null ? Color.toHex(colors.get(key)!) : "inherit");
            }
            service.all.set(this._id, this);
        } else {
            for (let key of Object.keys(service)) {
                // console.log(key);
                // console.log(Object.getOwnPropertyDescriptor(service, key));
                // Object.defineProperty(this, key, Object.getOwnPropertyDescriptor(service, key));
                this[key as keyof ColorSchemeInterface] = service[key as keyof ColorSchemeInterface];
            }
        }
    }

    /**
     * Used for the {@link JSON.stringify} call
     * @return {ColorSchemeData}
     */
    public toJSON(): ColorSchemeData {
        let copy: ColorSchemeData = new ColorSchemeData;
        for (let key of Object.keys(this)) {
            let newKey: keyof ColorSchemeData = key.replace("#", "") as keyof ColorSchemeData;
            if (newKey.startsWith("_")) {
                newKey = newKey.substring(1, newKey.length) as keyof ColorSchemeData;
            }
            // Object.defineProperty(copy, newKey, {
            //     value: Object.getOwnPropertyDescriptor(this, key).value,
            //     enumerable: true,
            //     writable: true,
            //     configurable: true
            // });
            copy[newKey] = toObject(this[key as keyof this]);
        }
        // @ts-ignore
        // copy["current"] = this._current;
        // // @ts-ignore
        // copy["default"] = this._preDefined;
        return copy;
    }

    /**
     * Convert a json object (not a json string) to an object which defines the same <b>properties</b> as {@link ColorScheme}<br>
     * Then it calls the {@link ColorScheme} constructor and returns the {@link ColorScheme} object which defines also the functions, etc.
     * @param {Object} jsonColorScheme
     * @return {Object}
     */
    public static fromJSON(jsonColorScheme: ColorSchemeData): ColorScheme {
        let colorScheme: ColorSchemeInterface = new ColorSchemeInterface();
        for (let [key, value] of Object.entries(jsonColorScheme)) {
            let newKey = "";
            let newValue;
            switch (key) {
                //add special cases here
                case "colors":
                    newValue = new Map();
                    for (let [i, j] of Object.entries(value)) {
                        newValue.set(i, j);
                    }
                case "someThingThatWillNeverBeTrue":
                    //this is only reached in one of the special cases defined above
                    //in these cases you have to care about newValue but not about newKey (if you don't add a break statement)
                    newKey = "_" + key;
                    break;
                default:
                    newKey = "_" + key;
                    newValue = value;
                    break;
            }
            Object.defineProperty(colorScheme, newKey, {
                value: newValue,
                enumerable: true,
                writable: true,
                configurable: true
            });
        }
        return new ColorScheme(colorScheme);
    }

    /**
     * Copies this colorScheme into {@link colorScheme}<br>
     * Creates a new colorScheme if {@link colorScheme} is empty<br>
     * @param {ColorScheme} colorScheme
     * @returns {ColorScheme} {@link colorScheme}
     */
    public copy(colorScheme?: ColorScheme): ColorScheme {
        if (colorScheme === undefined) {
            colorScheme = new ColorScheme(new ColorSchemeInterface());
        }
        return colorScheme
            .setName(this.name)
            .setAuthor(this.author)
            .setDesign(this.design)
            .setColors(this.colors);
    }

    public get name(): string {
        return this._name!;
    }

    public setName(name: string): this {
        this._name = name;
        return this;
    }

    public get author(): string {
        return this._author!;
    }

    public setAuthor(author: string): this {
        this._author = author;
        return this;
    }

    public get id(): string {
        return this._id;
    }

    public get colors(): ColorMap {
        return this._colors;
    }

    public setColors(colors: ColorMap): this {
        for (let [k, v] of colors) {
            this._colors.set(k, v);
        }
        return this;
    }

    public get current(): boolean {
        return this._current;
    }

    public setCurrent(current: boolean): this {
        this._current = current;
        return this;
    }

    public get preDefined(): boolean {
        return this._preDefined;
    }

    public setPreDefined(preDefined: boolean): this {
        this._preDefined = preDefined;
        return this;
    }

    public get design(): Designs {
        return this._design;
    }

    public setDesign(design: Designs): this {
        this._design = design;
        return this;
    }

    public setColor(colorId: string, value: string): this {
        this._colors.set(colorId, value);
        return this;
    }
}


class ColorPickerService {
    // private current: string;
    // #preDefined: boolean = false;

    private readonly _all: ColorSchemeMap = new Map<string, ColorScheme>();
    private readonly _colorTypes: string[] = [];
    private readonly fruits: string[] = ["fgf", "fd", "gfdsg"];

    constructor() {
        let default1 = this.getDefault(true);
        //init colorTypes
        for (let i of default1.colors.keys()) {
            if (this._colorTypes.indexOf(i) == -1) {
                this._colorTypes.push(i);
            }
        }
        let all: { [index: number]: ColorSchemeData } = JSON.parse(window.localStorage.getItem("colors") ?? "{}");
        // let all = window.localStorage.getItem("colors") != null ? JSON.parse(window.localStorage.getItem("colors")) : {};
        for (let colorJson of Object.values(all)) {
            let color = ColorScheme.fromJSON(colorJson);
            this._all.set(color.id, color);
            // if (this._all.has(window.localStorage.getItem("current_color"))) {
            //     this.activate(this._all.get(window.localStorage.getItem("current_color")));
            // } else {
            //     this.activate(this.getDefault());
            // }

        }
        this._all.set(default1.id, default1);
        this.activate([...this._all.values()].find(v => v.current) ?? this.getDefault());
        // this.activate(this._all.get([...this._all.values()].find((v) => v.current)?.id ?? this.getDefault().id) ?? this.getDefault());
        // this.save(default1);
    }

    /**
     * Writes all colors into body to override the default colors
     */
    public activate(colorScheme: ColorScheme) {
        if (colorScheme !== this._all.get(colorScheme.id)) {
            throw "AUAUAUAUAUUA";
        }
        //write to body
        for (let [type, color] of colorScheme.colors.entries()) {
            document.body.style.setProperty(type, color);
        }
        $(document.body)
            .toggleClass("light-design", colorScheme.design === Designs.light)
            .toggleClass("dark-design", colorScheme.design === Designs.dark)
            .toggleClass("system-design", colorScheme.design === Designs.system);

        colorScheme.setCurrent(true);
        for (let i of this.all.values()) {
            if (i.id !== colorScheme.id) {
                i.setCurrent(false);
            }
        }
        this.save();
    }

    /**
     * Return a new {@link ColorScheme} instance and add it to {@link ColorPickerService.all}
     * @return {ColorScheme}
     */
    public getColorScheme(): ColorScheme;
    /**
     * Get the instance by the id given or create a new one and add ite to {@link ColorPickerService.all}
     * @param {string} id
     * @return {ColorScheme | undefined}
     */
    public getColorScheme(id: string): ColorScheme;

    public getColorScheme(id?: string): ColorScheme {
        //todo check necessary if
        if (id !== undefined && this._all.has(id)) {
            return this._all.get(id)!;
        }
        let newColorScheme = new ColorScheme(this, id);
        this._all.set(newColorScheme.id, newColorScheme);
        return newColorScheme;
    }

    /**
     *
     * @param {StyleSheetList} styleSheets
     * @param {string} href A {@link RegExp} which has to match the href of the stylesheet
     * @param {string} selector The selector which is used in the stylesheet (e.g. ":root")
     * @return {Map<string, string>}
     */
    public getCSSVariables(styleSheets: StyleSheetList = document.styleSheets, href?: string, selector?: string) {
        const cssVars: Map<string, string> = new Map<string, string>();

        for (let i = 0; i < styleSheets.length; i++) {
            if (href != null && !new RegExp(href).test(styleSheets[i].href ?? "")) {
                continue;
            }
            try {
                for (let j = 0; j < styleSheets[i].cssRules.length; j++) {
                    let rule: CSSStyleRule = <CSSStyleRule>styleSheets[i].cssRules[j];

                    if (!rule || !rule.style || (selector != null && rule.selectorText != selector)) {
                        continue;
                    }

                    for (let k = 0; k < rule.style.length; k++) {
                        if (rule.style.item(k).startsWith("--")) {
                            cssVars.set(rule.style.item(k), rule.style.getPropertyValue(rule.style.item(k)));
                        }
                    }
                }
            } catch (error) {
            }
        }
        console.log("cssVars");
        console.log(cssVars);
        return cssVars;
    };

    /**
     * This does <b>NOT</b> save the default object!!!
     * @return {ColorPickerService}
     * @param forceReload {boolean} whether it's forced to reload the default from the css stylesheet
     */
    public getDefault(forceReload: boolean = false): ColorScheme {
        let result = this._all.get("default");
        if (forceReload || result == null) {
            let colors: ColorMap = this.getCSSVariables(document.styleSheets, "farben.css");
            result = new ColorScheme(this, "default", "default", "default", colors)
                .setPreDefined(true);
        }
        return result;
    }

    /**
     * gets all data from local storage (if present) and writes them into this object<br>
     * <b>DO NOT CALL THIS IN A LOOP</b>, That would be very inefficient
     */
    public reloadFromStorage(colorScheme: ColorScheme) {
        // let colors = window.localStorage.getItem("colors") != null ? JSON.parse(window.localStorage.getItem("colors")) : {};
        let colors = JSON.parse(window.localStorage.getItem("colors") ?? "{}");
        if (colorScheme.id in Object.keys(colors)) {
            colorScheme.setName(colors[colorScheme.id].name);
            colorScheme.setAuthor(colors[colorScheme.id].author);
            for (let i in colors[colorScheme.id].colors) {
                colorScheme.colors.set(i, colors[colorScheme.id].colors[i]);
            }
        }
    }

    public generateName(): string {
        //TODO 20.03.2022 check if the logic below makes sense
        let r: string;
        let i = 0;
        do {
            r = this.fruits[Math.floor(Math.random() * this.fruits.length)];
            i++;
        } while (r in this.fruits && i < this.fruits.length);
        if (r in this.fruits) {
            return this.generateId();
        }
        return r;
    }

    public generateId(): string {
        let r: string;
        do {
            r = Math.floor(Math.random() * 1000000).toString();
        }
        while (r in this._all);
        return r;
    }

    /**
     * Add this to #all and save
     * @return {ColorPickerService} this
     */
    public save(...schemes: ColorScheme[]): this {
        for (let i of schemes) {
            this._all.set(i.id, i);
        }
        // let colors = window.localStorage.getItem("colors") != null ? JSON.parse(window.localStorage.getItem("colors")) : {};
        // let colors = JSON.parse(window.localStorage.getItem("colors") ?? "{}");
        // for (let [id, color] of this._all.entries()) {
        //     colors[id] = color;
        // }

        window.localStorage.setItem("colors", JSON.stringify(toObject(this._all)));
        return this;
    }

    /**
     * should be used when the color input onChange fires
     * @param colorType {string}
     * @param newColor {string}
     */
    public onChange(colorType: string, newColor: string) {
        let colorScheme = this.getCurrent();
        if (colorScheme.preDefined) {
            colorScheme = new ColorScheme(this, undefined, undefined, undefined, this.getCurrent().colors);
            console.log("hmm");
            console.log(colorScheme);
        }

        colorScheme.colors.set(colorType, newColor);
        this.activate(colorScheme);
        this.save(colorScheme);
    }

    public get all() {
        return this._all;
    }

    public delete(...colorScheme: (ColorScheme | string)[] | (ColorScheme | string)[][]): this {
        console.log(colorScheme);
        for (let i of colorScheme) {
            for (let j of (i instanceof Array ? i : [i])) {
                if (j instanceof ColorScheme) {
                    j = j.id;
                }

                let colorScheme1 = this._all.get(j);
                if (colorScheme1 !== undefined) {
                    if (colorScheme1.preDefined) {
                        //TODO 12.04.2022 alert user ??? bc predefined?
                        continue;
                    }
                    if (colorScheme1.current) {
                        this.activate(this.getDefault());
                    }
                    console.log(j);
                    console.log(this._all.delete(j));
                } else {
                    console.warn("Cannot find ColorScheme (-id)'", j, "' in ColorPickerService.all");
                }
            }
        }
        console.log(this._all);
        this.save();
        return this;
    }

    /**
     *
     * @param {boolean} forceReload
     * @return {ColorScheme}
     */
    public getCurrent(forceReload: boolean = false): ColorScheme {
        if (!forceReload) {
            for (let colorScheme of this._all.values()) {
                if (colorScheme.current) {
                    return colorScheme;
                }
            }
        }
        return this._all.get(window.localStorage.getItem("current_color") ?? this.getDefault().id) ?? this.getDefault();
        // return window.localStorage.getItem("current_color") != null ? (this._all.has(window.localStorage.getItem("current_color")) ?
        //     this._all.get(window.localStorage.getItem("current_color")) : this.getDefault()) : this.getDefault();
    }

    public get colorTypes(): string[] {
        return this._colorTypes;
    }

    /**
     * Returns the display name of a color type
     * @param colorType {string}
     * @returns {string}
     */
    public getDisplayColorName(colorType: string): string {
        let newColorType = colorType.replace("--", "");
        newColorType = newColorType.charAt(0).toLocaleUpperCase() + newColorType.substring(1, newColorType.length);
        return newColorType;
        //todo parse string
    }
}

// const ColorPickerItemEvents = {
//     // ...WidgetEvents,
//     colorChanged: "colorChanged",
// };
// type ColorPickerItemEvents = (typeof ColorPickerItemEvents)[keyof typeof ColorPickerItemEvents];

enum ColorPickerItemEvents {
    colorChanged = "colorChanged",
    editClicked = "editClicked",
}

class ColorPickerItem extends ListTile<WidgetEvents & IconContainingEvents & CheckboxEvents & FavoriteEvents & ColorPickerItemEvents, HTMLDivElement> {
    private _colorType: string;

    constructor(colorType: string) {
        super();
        this._colorType = colorType;
        this.setInheritVisibility(true)
            .setTrailingIcon(Icon.Edit())
            .enableTrailingIcon(true)
            .on(...EventCallbacks.setHeight)
            .on(IconContainingEvents.iconClicked, (event, _, index) =>
                index === 1 ? this.dispatchEvent(ColorPickerItemEvents.editClicked) : null);
    }

    public override build(suppressCallback: boolean = false): JQuery<HTMLDivElement> {
        super.build(true)
            .addClass("item");

        return this.buildCallback(suppressCallback);
    }

    public setColorType(colorType: string): this {
        this._colorType = colorType;
        return this;
    }

    public get colorType(): string {
        return this._colorType;
    }
}

class ColorPicker extends Dialog<WidgetEvents & DialogEvents, HTMLDivElement, HTMLDivElement, ColorPickerItem | FlexBox<WidgetEvents>> {
    private readonly colorPickerService: ColorPickerService;
    private readonly colorSchemeDialog: Overlay<ColorSchemeDialog>;
    // private readonly colorSchemeNewDialog: Overlay<ColorSchemeNewDialog>;
    private readonly colorSchemeButton: Button;
    private readonly colorSchemeLabel: Text;
    private readonly colorSchemeBox: FlexBox<WidgetEvents>;
    private readonly colorPickerNormalInput: Overlay<ColorPickerNormalInput>;
    private readonly colorPickerGradientInput: Overlay<ColorPickerGradientInputDialog>;

    public constructor() {
        super();
        this.colorPickerService = new ColorPickerService();
        // this.colorSchemeNewDialog = new Overlay<ColorSchemeNewDialog>(new ColorSchemeNewDialog(this.colorPickerService, this.colorPickerService.getCurrent()));
        // this.colorSchemeDialog = new Overlay<Dialog<WidgetEvents, null>>((null, null)
        //     .setMaxSelected(1)
        //     .setMinSelected(1)
        //     .setTitle("Color Scheme")
        //     .addButton(Button.Delete().on(undefined, new Pair(ButtonEvents.clicked, (event) => {
        //     })), FlexAlign.end)
        //     .addButton(new Button().setLabel("New").setIcon(Icon.of("add", IconType.material))
        //         .on(undefined, new Pair(ButtonEvents.clicked, (event) => {
        //             console.log("new");
        //             this.colorSchemeNewDialog.widget.setBaseScheme(this.colorPickerService.getCurrent());
        //             this.colorSchemeNewDialog.widget.open();
        //         })), FlexAlign.end)
        //     .enableButtons(true)
        // );
        this.colorSchemeDialog = new Overlay<ColorSchemeDialog>(new ColorSchemeDialog(this.colorPickerService)
            .on(DialogEvents.finished, () => this.rebuild()));
        this.colorSchemeButton = new Button()
            .setInheritVisibility(true)
            .setIcon(Icon.of("expand_more", IconType.material))
            .on(ButtonEvents.clicked, () => this.colorSchemeDialog.widget.open())
            .on(...EventCallbacks.setWidthToRemaining);
        this.colorSchemeLabel = new Text().set("Color-Scheme")
            .setInheritVisibility(true)
            .setFontWeight(FontWeight.bold)
            .setFontSize(FontSize.large);
        this.colorSchemeBox = new FlexBox().setInheritVisibility(true)
            .addItem(this.colorSchemeLabel, FlexAlign.start)
            .addItem(this.colorSchemeButton, FlexAlign.start)
            .setSpacing("3rem", "1rem", "2rem");
        this.colorPickerNormalInput = new Overlay<ColorPickerNormalInput>(new ColorPickerNormalInput()
            .on(ColorPickerInputEvents.colorChanged, (event) => console.log(this.colorPickerService.getCurrent().id))
            .on(ColorPickerInputEvents.colorChanged, (event) => this.colorPickerService.activate(this.colorPickerService
                .getCurrent().setColor(event.target.colorId, event.target.value!))));
        // .on(ColorPickerInputEvents.colorChanged, (event)=>{
        //     this.aContent.items.find(v=>v instanceof ColorPickerItem && v.colorType === event.target.colorId)!
        //         .dispatchEvent(ColorPickerItemEvents.colorChanged);
        // }));
        this.colorPickerGradientInput = new Overlay<ColorPickerGradientInputDialog>(new ColorPickerGradientInputDialog());

        this.enableTop(true);
        this.aTop.setLabel("Color-Picker")
            .on(IconContainingEvents.iconClicked, () => this.reject())
            .setDefaultTop(true);
        this.enableContent(true);
        // this.top = new Top().setLabel("Color-Picker")
        //     .setInheritVisibility(true)
        //     .setIcon(Icon.Close().setClickable(true));
        // this.addChild("top", this.top);
        this.addChild("colorSchemeDialog", this.colorSchemeDialog);
        this.addChild("colorPickerNormalInput", this.colorPickerNormalInput);
        this.addChild("colorPickerGradientInput", this.colorPickerGradientInput);
        // this.children.set("colorSchemeNewDialog", this.colorSchemeNewDialog);
        // this.children.set("colorSchemeButton", this.colorSchemeButton);
        // this.children.set("colorSchemeLabel", this.colorSchemeLabel);
        this.addChild("colorSchemeBox", this.colorSchemeBox);

        // this.on("sizeSet", () => this.domObject.children(".content").css("max-height", "calc(100% - "
        //     // + this.domObject.find(".bottom").outerHeight(true) + "px - "
        //     + this.domObject.children(".title-widget").outerHeight(true) + "px)"));
        this.enableButtons(false);
    }

    public override build(suppressCallback: boolean = false): JQuery<HTMLDivElement> {
        //color schemes
        // for (let scheme of this.colorPickerService.all.values()) {
        //     let item = new SelectMenuItem<string>()
        //         .setInheritVisibility(true)
        //         .setLabel(scheme.name)
        //         .setCheckbox(true)
        //         .setValue(scheme.id)
        //         .setSelected(scheme.current)
        //         .setIcon(Icon.Info());
        //     this.colorSchemeDialog.widget.addItems(item);
        // }

        super.build(true)
            .addClass("color-picker")
            .append(this.colorSchemeDialog.build())
            .append(this.colorPickerNormalInput.build())
            .append(this.colorPickerGradientInput.build())
            // .append(this.colorSchemeNewDialog.build())
            // .append(this.top.build()
            //     .addClass("top"));
            .append(this.buildTop());
        // this.colorSchemeDialog.widget.domObject
        //     .addClass("color-scheme-dialog");
        // let content = $("<div></div>")
        //     .addClass("content")
        //     .appendTo(this.domObject);

        //color scheme select menu
        // content.append($("<div></div>")
        //     .addClass("color-scheme-select-button")
        //     .on("click", this.colorSchemeDialog.open))

        // content.append($("<div></div>")
        //     .addClass("color-scheme")
        //     .append(this.colorSchemeLabel.build()
        //         .addClass("label"))
        //     .append(this.colorSchemeButton.build()
        //         .addClass("button")));
        this.aContent.addItems(this.colorSchemeBox);
        this.aContent.addItems(this.colorPickerService.colorTypes
            // not needed because colorType won't change
            // filter old items
            // .filter(v => this.aContent.items.findIndex(value => value.colorType === v) === -1)
            .map(v => {
                let item = new ColorPickerItem(v);
                item.backgroundColor.set(`var(${v})`);
                item.setLabel(this.colorPickerService.getDisplayColorName(v));
                return item.setInheritVisibility(true).on(ColorPickerItemEvents.colorChanged, (event, colorValue) => this.colorPickerService.onChange((<ColorPickerItem>event.target).colorType, colorValue))
                    .on(ColorPickerItemEvents.editClicked, (event) => {
                        //TODO distinct between normal and gradient colors
                        if (true) {
                            console.log("edit clicked")
                            this.colorPickerNormalInput.widget
                                .setColorId(event.target.colorType)
                                .open();
                        }
                    });
            }));

        this.domObject.append(this.buildContent());
        this.colorSchemeBox.domObject
            .addClass("color-scheme");

        //color items
        // let i = 0;
        // for (let colorType of this.colorPickerService.colorTypes) {
        //     let item = new ColorPickerItem(colorType);
        //     this.addChild("colorPickerItem" + i, item);
        //
        //     item.setVisibility(this.visibility);
        //     item.backgroundColor.set("var(" + colorType + ")");
        //     item.label.set(this.colorPickerService.getDisplayColorName(colorType));
        //     item.on(ColorPickerItemEvents.colorChanged, (event, colorValue) => this.colorPickerService.onChange((<ColorPickerItem>event.target).label.get(), colorValue));
        //
        //     this.aContent.domObject.append(item.build());
        //     i++;
        // }

        return this.buildCallback(suppressCallback);
    }

    public override rebuild(suppressCallback: boolean = false): JQuery<HTMLDivElement> {
        super.rebuild(true);
        this.colorSchemeButton.setLabel(this.colorPickerService.getCurrent().name)
            .rebuild();
        return this.rebuildCallback(suppressCallback);
    }
}

enum ColorSchemeItemEvents {
    infoClicked = "infoClicked",
}

interface ColorSchemeItem extends MixinImplementing, Item {
}

@mixin(Item)
class ColorSchemeItem extends ListTile<WidgetEvents & IconContainingEvents & CheckboxEvents & FavoriteEvents & ColorSchemeItemEvents> {
    private readonly _colorScheme: ColorScheme;

    constructor(colorScheme: ColorScheme) {
        super();
        this.mixinConstructor();
        this._colorScheme = colorScheme;
        this.setLeadingIcon(Icon.Info());
        this.leadingIcon.on(WidgetEvents.clicked, () => console.log("icon clicked"))
            .on(WidgetEvents.clicked, (event) => {
                this.dispatchEvent(ColorSchemeItemEvents.infoClicked);
                event.originalEvent?.stopPropagation();
            });
        // this.addItem(Icon.of("favorite", IconType.material), FlexAlign.start);
        this.enableFavorite(true)
            .setLabel(colorScheme.name)
            .enableCheckbox(true)
            .on(FavoriteEvents.unFavored, (event, favored) => console.log(favored, this.domObject?.closest(event.originalEvent?.target).length))
            .on(FavoriteEvents.unFavored, (event) => ((event.originalEvent instanceof MouseEvent) && this.domObject?.closest(event.originalEvent.tar!).length > 0) ? this.setFavored(true) : null);
    }

    public override build(suppressCallback: boolean = false): JQuery<HTMLDivElement> {
        super.build(true)
            .addClass("default-item");
        this.buildCallback(suppressCallback);
        return this.domObject;
    }

    public override rebuild(suppressCallback: boolean = false): JQuery<HTMLDivElement> {
        super.rebuild(true);
        this.rebuildCallback(suppressCallback);
        // console.log("item rebuild");
        this.setLabel(this._colorScheme.name);
        this.setFavored(this._colorScheme.current);
        this._label.rebuild();
        return this.domObject;
    }

    public get colorScheme(): ColorScheme {
        return this._colorScheme;
    }
}

class ColorSchemeDialog extends Dialog<WidgetEvents & DialogEvents, HTMLDivElement, HTMLDivElement, ColorSchemeItem> {
    private readonly colorSchemeNewDialog: Overlay<ColorSchemeNewDialog>;
    private readonly colorSchemeInfoDialog: Overlay<ColorSchemeInfoDialog>;
    private readonly colorPickerService: ColorPickerService;

    constructor(colorPickerService: ColorPickerService) {
        super();
        this.colorPickerService = colorPickerService;
        this.colorSchemeNewDialog = new Overlay<ColorSchemeNewDialog>(new ColorSchemeNewDialog(this.colorPickerService, this.colorPickerService.getCurrent())
            .on(DialogEvents.accepted, () => {
                this.rebuild();
                // this.aContent.addItems(value);
            }));
        this.colorSchemeInfoDialog = new Overlay<ColorSchemeInfoDialog>(new ColorSchemeInfoDialog(this.colorPickerService, this.colorPickerService.getCurrent())
            .on(DialogEvents.accepted, () => this.rebuild()));

        this.enableTop(true);
        this.aTop.setLabel("Color Schemes");
        this.aTop.on(IconContainingEvents.iconClicked, () => this.reject());

        this.enableContent(true);

        this.enableButtons(true);
        this.buttonBox
            .addButton(Button.Delete()
                .on(ButtonEvents.clicked, (event) => {
                    console.log("delete");
                    this.colorPickerService.delete(this.aContent.items
                        .filter(v => v.checked && !v.colorScheme.preDefined)
                        //TODO 12.04.2022 alert if one is trying to delete pre defined colorSchemes
                        .map(v => v.colorScheme));
                    this.rebuild();
                }), FlexAlign.end)
            .addButton(new Button().setLabel("New").setIcon(Icon.of("add", IconType.material))
                .on(ButtonEvents.clicked, (event) => {
                    console.log("new");
                    this.colorSchemeNewDialog.widget.setBaseScheme(this.colorPickerService.getCurrent());
                    this.colorSchemeNewDialog.widget.open();
                }), FlexAlign.end);

        this.addChild("colorSchemeNewDialog");
        this.addChild("colorSchemeInfoDialog");
    }

    public override rebuild(suppressCallback: boolean = false): JQuery<HTMLDivElement> {
        super.rebuild(true);
        //color schemes
        this.aContent.addItems([...this.colorPickerService.all.values()]
            .filter(value => this.aContent.items
                // .filter(v => v instanceof ColorSchemeItem)//todo redundant? performance?
                .map(value1 => value1.colorScheme.id).indexOf(value.id) === -1)
            .map(value => {
                console.log(value === this.colorPickerService.all.get(value.id));
                let item = new ColorSchemeItem(value)
                    .setInheritVisibility(true)
                    .show()
                    .on(ColorSchemeItemEvents.infoClicked, (event) => {
                        console.log("info clicked");
                        console.log(event.target);
                        this.colorSchemeInfoDialog.widget
                            .open(event.target.colorScheme);
                    })
                    .on(FavoriteEvents.favored, (event) => {
                        console.log("item activate");
                        this.colorPickerService.activate(item.colorScheme);
                        event.originalEvent?.stopPropagation();
                        this.aContent.rebuild();
                    });
                item.build();
                return item;
            }));

        let indexesToDelete: number[] = [];
        this.aContent.items.map(value => value.colorScheme.id)
            .forEach((value, index) => {
                if (this.colorPickerService.all.get(value) === undefined) {
                    // this.aContent.removeItem(index);
                    indexesToDelete.push(index);
                }
            });
        this.aContent.removeItem(...indexesToDelete);
        let i = 0;
        for (let c of this.colorPickerService.all.values()) {
            this.aContent.items.find(value => value.colorScheme.id === c.id)!.setIndex(i);
            i++;
        }
        this.aContent.orderItems().rebuild();
        // .filter()
        // .map(value => new SelectMenuItem<string>()
        //     .setInheritVisibility(true)
        //     .setLabel(value.name)
        //     .setCheckbox(true)
        //     .setValue(value.id)
        //     .setSelected(value.current)
        //     .setIcon(Icon.Info())));

        if (this.built) {
            this.rebuildCallback(suppressCallback);
        }
        return this.domObject;
    }

    public override build(suppressCallback: boolean = false): JQuery<HTMLDivElement> {
        super.build(true)
            .addClass("color-scheme-dialog")
            .append(this.colorSchemeNewDialog.build())
            .append(this.colorSchemeInfoDialog.build());

        //color schemes
        // this.aContent.addItems(...[...this.colorPickerService.all.values()].map((value, index) => new ColorSchemeItem(value)
        //     .setInheritVisibility(true)
        //     .on(ColorSchemeItemEvents.infoCLicked, (event) => {
        //         console.log("info clicked");
        //         console.log(event.target);
        //         this.colorSchemeInfoDialog.widget
        //             // .setColorScheme((<ColorSchemeItem>event.target).colorScheme)
        //             .open((<ColorSchemeItem>event.target).colorScheme);
        //     })));

        this.buildTop();
        this.buildContent();
        this.buildButtons();
        this.buildCallback(suppressCallback);
        return this.domObject;
    }
}

namespace Utils {
    export function nameInput(identifier: string): TextInput {
        return new TextInput()
            .setId(identifier + "_name")
            .setLabel("Name")
            .setMinLength(3)
            .setSpellcheck(true);
    }

    export function authorInput(identifier: string): TextInput {
        return new TextInput()
            .setId(identifier + "_author")
            .setLabel("Author")
            .setMinLength(5);
    }

    export function colorSchemeSelectBox(service: ColorPickerService, identifier: string): SelectBox {
        let box = new SelectBox();
        return box
            // .addItems(...[...service.all.values()]
            //     .filter(v => !box.has(v.id))
            //     .map(v => {
            //         let item = new SelectBoxItem()
            //             .setLabel(v.name)
            //             .setId(identifier + v.id);
            //         item.value.setValue(v.id)
            //             .setChecked(v.current);
            //         return item;
            //     }))
            .on(WidgetEvents.rebuild, (event) => event.target
                .addItems(...[...service.all.values()]
                    .filter(v => !event.target.has(identifier + v.id))
                    .map(v => {
                        let item = new SelectBoxItem()
                            .setLabel(v.name)
                            .setId(identifier + v.id);
                        item.value.setValue(v.id)
                            .setChecked(v.current);
                        return item;
                    }))
                .removeItems(...event.target.items
                    .filter(v => !service.all.has(v.id.substring(identifier.length)))));
    }

    export function designSelectBox(current: Designs, identifier: string): SelectBox {
        return new SelectBox()
            .addItems(...Object.entries(Designs)
                .map(v => {
                    let item = new SelectBoxItem()
                        .setId(identifier + v[0])
                        .setLabel(v[1]);
                    item.value.setValue(v[1])
                        .setChecked(current === v[0]);
                    return item;
                }));
    }
}

class ColorSchemeNewDialog extends Dialog<WidgetEvents & DialogEvents, HTMLDivElement, HTMLDivElement, WidgetBase<WidgetEvents, HTMLDivElement>> {
    private _baseScheme: ColorScheme;
    private readonly _colorScheme: ColorScheme;
    private readonly service: ColorPickerService;
    private readonly nameInput: TextInput;
    private readonly authorInput: TextInput;
    private readonly designInput: SelectBox;
    private readonly colorSchemeSelectBox: SelectBox;

    constructor(service: ColorPickerService, baseScheme: ColorScheme) {
        super(undefined, "form");
        this.service = service;
        this.enableContent(true);
        this.enableButtons(true);
        this.addButton(new Button().setLabel("Create").setIcon(Icon.of("add", IconType.material))
            .on(ButtonEvents.clicked, () => this.accept()), FlexAlign.end);
        this.addButton(Button.Cancel().on(ButtonEvents.clicked, () => this.reject()), FlexAlign.end);
        this.enableTop(true);
        this.aTop.setLabel("New Color-Scheme")
            .setDefaultTop(true)
            .on(IconContainingEvents.iconClicked, () => this.reject());
        // this.aTop.setIcon(Icon.Close().on(undefined, new Pair(IconEvents.clicked, () => {this.reject();
        //     console.log("close");})));

        this._baseScheme = baseScheme ?? service.getDefault();
        this._colorScheme = this._baseScheme.copy()
            //should be redundant
            .setPreDefined(false)
            .setCurrent(false);

        this.on(DialogEvents.accepted, (event) => {
            console.log("accepted");
            console.log(event);
            this.service.save(this._colorScheme.copy(this.service.getColorScheme()));
        });

        //ColorScheme field inputs
        this.nameInput = Utils.nameInput(ColorSchemeNewDialog.name)
            .on(TextInputEvents.input, (event, value) => {
                this._colorScheme.setName(value);
                this.nameInput.rebuild();
            });

        this.authorInput = Utils.authorInput(ColorSchemeNewDialog.name)
            .on(TextInputEvents.input, (event, value) => {
                this._colorScheme.setAuthor(value);
                this.nameInput.rebuild();
            });

        this.designInput = Utils.designSelectBox(this._baseScheme.design, ColorSchemeNewDialog.name)
            .on(InputEvents.input, (event, value) => {
                this._colorScheme.setDesign(value.value);
            });

        this.colorSchemeSelectBox = Utils.colorSchemeSelectBox(this.service, ColorSchemeNewDialog.name)
            .on(SelectBoxEvents.input, (event, value) => this.setBaseScheme(this.service.getColorScheme(value)!).rebuild());

        this.aContent.addItems(this.colorSchemeSelectBox, this.nameInput, this.authorInput, this.designInput);
    }

    public override build(suppressCallback: boolean = false): JQuery<HTMLDivElement> {
        super.build(true)
            .addClass("color-scheme-new-dialog");

        // for (let i of Object.keys(ColorScheme)) {
        //     this.content.addItems();
        // }

        //choose Base Widget
        // this.content.addItems();

        //ColorScheme field inputs
        // this.content.addItems(...[
        //     new TextInput()
        //         .setId("_name")
        //         .setLabel("Name")
        //         .setMinLength(3)
        //         .setSpellcheck(true),
        //     new TextInput()
        //         .setId("_author")
        //         .setLabel("Author")
        //         .setMinLength(5)
        // ].map(value => value.setId(ColorSchemeNewDialog.name + value.id)
        //     // @ts-ignore
        //     .setPlaceHolder(this.baseScheme[value.id.value])));

        this.buildTop();
        this.buildContent();
        this.buildButtons();

        this.buildCallback(suppressCallback);
        return this.domObject;
    }

    public override rebuild(suppressCallback: boolean = false): JQuery<HTMLDivElement> {
        super.rebuild(true);

        this.nameInput.setPlaceHolder(this._baseScheme.name);
        this.authorInput.setPlaceHolder(this._baseScheme.author);
        this.designInput.setChecked(this._baseScheme.design);

        this.rebuildCallback(suppressCallback);
        return this.domObject;
    }

    private setValue(): ColorScheme {
        throw "setVALUE";
        console.log("setValue");
        // let inputs = {};
        // for (let i of this.content.items.filter((value: TextInput) => value.id.startsWith(ColorSchemeNewDialog.name))) {
        //     let id = (<TextInput>i).id.substring(ColorSchemeNewDialog.name.length, (<TextInput>i).id.length);
        //     console.log(id);
        //     if ((<TextInput>i).value != null) {
        //         // @ts-ignore
        //         inputs[id] = (<TextInput>i).value;
        //     } else {
        //         // @ts-ignore
        //         inputs[id] = this.baseScheme[id];
        //     }
        // }
        // let tempScheme = new ColorScheme(inputs);
        let scheme = this.service.getColorScheme()
            .setColors(this._baseScheme.colors)
            .setCurrent(false)
            .setPreDefined(false)
            .setName(this.nameInput.value ?? this._baseScheme.name)
            .setAuthor(this.authorInput.value ?? this._baseScheme.author)
            .setDesign(this.designInput.items.find(v => v.value.checked)!.value.value! as Designs);
        this.service.save(scheme);
        return scheme;
    }

    public override open(baseScheme?: ColorScheme): this {
        this._baseScheme = (baseScheme ?? this._baseScheme) ?? this.service.getCurrent();
        this.colorSchemeSelectBox.rebuild();
        this.colorSchemeSelectBox.setChecked(this._baseScheme.id)
            .rebuild();
        // super.open(baseScheme);
        super.open();
        this.nameInput.setValue("")
            .setPlaceHolder(this._baseScheme.name);
        this.authorInput.setValue("")
            .setPlaceHolder(this._baseScheme.author);
        this.designInput.setChecked(this._baseScheme.design);
        return this;
    }

    public setBaseScheme(scheme: ColorScheme): this {
        this._baseScheme = scheme;
        return this;
    }

    public get baseScheme(): ColorScheme {
        return this._baseScheme;
    }

    public get colorScheme(): ColorScheme {
        return this._colorScheme;
    }
}

class ColorSchemeInfoDialog extends Dialog<WidgetEvents & DialogEvents, HTMLDivElement, HTMLDivElement, TextInput<HTMLDivElement> | SelectBox<HTMLDivElement>> {
    private _colorScheme: ColorScheme;
    private readonly colorSchemeBackup: ColorScheme;
    private readonly nameInput: TextInput;
    private readonly authorInput: TextInput;
    private readonly designInput: SelectBox;
    private readonly service: ColorPickerService;

    constructor(service: ColorPickerService, colorScheme: ColorScheme) {
        super();
        this.colorSchemeBackup = colorScheme.copy();
        this.service = service;
        this._colorScheme = colorScheme;

        //ColorScheme field inputs
        this.nameInput = Utils.nameInput(ColorSchemeInfoDialog.name)
            .on(TextInputEvents.input, (event, value) => {
                this._colorScheme.setName(value);
                // this.nameInput.rebuild();
                this.service.save(this._colorScheme);
            });

        this.authorInput = Utils.authorInput(ColorSchemeInfoDialog.name)
            .on(TextInputEvents.input, (event, value) => {
                this._colorScheme.setAuthor(value);
                this.nameInput.rebuild();
                this.service.save(this._colorScheme);
            });

        this.designInput = Utils.designSelectBox(this._colorScheme.design, ColorSchemeInfoDialog.name)
            .on(InputEvents.input, (event, value) => {
                this._colorScheme.setDesign(value.value);
                this.service.activate(this._colorScheme);
            });

        this.aContent.addItems(this.nameInput, this.authorInput, this.designInput);

        this.enableTop(true);
        this.enableContent(true);
        this.enableButtons(true);
        this.aTop.setLabel(colorScheme.name)
            .setDefaultTop(true)
            .on(IconContainingEvents.iconClicked, () => this.acceptOrReject());
        this.addButton(Button.Reset()
            .on(WidgetEvents.clicked, () => {
                this.colorSchemeBackup.copy(this._colorScheme);
                if (this._colorScheme.current) {
                    this.service.activate(this._colorScheme);
                }
                this.service.save(this._colorScheme);
                this.rebuild();
            }), FlexAlign.end);
        this.addButton(Button.Activate().on(WidgetEvents.clicked, () => {
            this.service.activate(this._colorScheme);
            this.service.save(this._colorScheme);
        }), FlexAlign.end);
    }

    public override build(suppressCallback: boolean = false): JQuery<HTMLDivElement> {
        super.build(true);
        this.domObject.addClass("color-scheme-info-dialog");

        this.buildTop();
        this.buildContent();
        this.buildButtons();

        this.buildCallback(suppressCallback);
        return this.domObject;
    }

    public override rebuild(suppressCallback: boolean = false): JQuery<HTMLDivElement> {
        super.rebuild(true);

        this.nameInput.setPlaceHolder(this._colorScheme.name);
        // this.nameInput.setLabel(this._colorScheme.name);
        this.authorInput.setPlaceHolder(this._colorScheme.author);
        // this.authorInput.setLabel(this._colorScheme.author);
        console.log("setChecked", this._colorScheme.design);
        // console.log(this._colorScheme.design);
        // console.log(this.designInput);
        // console.log(this.designInput.items);
        this.designInput.setChecked(this._colorScheme.design);
        console.log([...this.designInput.items.values()].map(v => v.value)
            .map(v => v.value + v.domObject.find("input").prop("checked") + " vs " + v.checked).join())

        this.aTop.rebuild();
        this.aContent.rebuild();
        this.buttonBox.rebuild();
        this.nameInput.rebuild();
        this.authorInput.rebuild();
        this.designInput.rebuild();

        this.rebuildCallback(suppressCallback);
        return this.domObject;
    }

    public override open(value?: ColorScheme): this {
        super.open();
        if (value !== undefined) {
            this.setColorScheme(value);
        }
        this.aTop.setLabel(this._colorScheme.name);
        this.nameInput.setValue(this._colorScheme.name);
        this.authorInput.setValue(this._colorScheme.author);
        this.tryRebuild();
        return this;
    }

    public override acceptOrReject(): this {
        return JSON.stringify(this._colorScheme.copy()) !== JSON.stringify(this.colorSchemeBackup.toJSON()) ? this.accept() : this.reject();
    }

    public get colorScheme(): ColorScheme {
        return this._colorScheme;
    }

    public setColorScheme(colorScheme: ColorScheme): this {
        this._colorScheme = colorScheme;
        colorScheme.copy(this.colorSchemeBackup);
        return this;
    }
}

enum ColorPickerInputEvents {
    colorChanged = "colorChanged"
}

interface ColorPickerNormalInput extends MixinImplementing, Input<string, WidgetEvents & InputEvents, HTMLDivElement> {
}

@mixin(Input)
class ColorPickerNormalInput extends Dialog<WidgetEvents & InputEvents, HTMLDivElement> {
    private _colorId?: string;

    constructor() {
        super();
        this.mixinConstructor()
            .enableTop(false)
            .enableContent(false)
            .enableButtons(false)
            .setType("color")
            .setName("normal-color-input")
            .setId("normal-color-input")
            .on(InputEvents.change, () => console.log("change"))
            .on(InputEvents.input, () => console.log("input"))
            .on(InputEvents.change, () => {
                this.accept();
                this.dispatchEvent(ColorPickerInputEvents.colorChanged);
            });
    }

    public override build(suppressCallback: boolean = false): JQuery<HTMLDivElement> {
        super.build(true)
            .addClass("color-picker-normal-input")
            .append(this.buildInput())
        return this.buildCallback(suppressCallback);
    }

    public override rebuild(suppressCallback: boolean = false): JQuery<HTMLDivElement> {
        super.rebuild(true);
        if (this._colorId !== undefined) {
            console.log(this.domObject.css(this._colorId).substring(0, 7))
            this.setValue(this.domObject.css(this._colorId).substring(0, 7));
        }
        this.rebuildInput();
        return this.rebuildCallback(suppressCallback);
    }

    public get colorId(): string {
        return this._colorId!;
    }

    public setColorId(value: string): this {
        this._colorId = value;
        return this;
    }
}

class ColorPickerGradientInputDialog extends Dialog<WidgetEvents & DialogEvents> {
}

export {ColorScheme, ColorPickerService, ColorPicker};