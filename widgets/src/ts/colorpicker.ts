import {EventCallbacks} from "./AbstractWidgets.js";
import {Pair} from "./base.js";
import {Dialog} from "./Dialog.js";
import {Overlay} from "./Overlay.js";
import {SelectMenu, SelectMenuItem} from "./SelectMenu.js";
import {WidgetEvents} from "./Widget.js";
import {FontSize, FontWeight} from "./WidgetBase.js";
import {Button, ButtonEvents, FlexAlign, FlexBox, Icon, IconType, ListTile, Text, Top} from "./Widgets.js";

type ColorSchemeMap = Map<string, ColorScheme>;

class ColorMap extends Map<string, string> {
}

class ColorScheme {
    private _name: string;
    private _author: string;
    private readonly _id: string;
    private _colors: ColorMap = new ColorMap();

    private _current: boolean = false;
    private _preDefined: boolean = false;

    /**
     * DON'T USE THIS CONSTRUCTOR!!! USE {@link get} instead<br>
     * This will insert (random) strings if you set null for {@link _name} or {@link _id}
     * @param service {ColorPickerService}
     * @param id {string | null}
     * @param author {string | null}
     * @param name {string | null}
     * @param colors {{string: string}}
     */
    public constructor(service: ColorPickerService | Object, id?: string, name?: string, author?: string, colors?: ColorMap) {
        console.assert(service != null, "service is null");
        if (service instanceof ColorPickerService) {
            this._id = id != null ? id : service.generateId();
            this._name = name != null ? name : service.generateName();
            this._author = author != null ? author : "unknown";
            this._preDefined = false;
            for (let key of colors.keys()) {
                this._colors.set(key, colors.get(key) != null ? colors.get(key) : "inherit");
            }
        } else {
            for (let key of Object.keys(service)) {
                console.log(key);
                console.log(Object.getOwnPropertyDescriptor(service, key));
                Object.defineProperty(this, key, Object.getOwnPropertyDescriptor(service, key));
            }
        }
    }

    /**
     * @return {ColorScheme}
     */
    protected toJSON(): ColorScheme {
        let copy = {};
        for (let key of Object.keys(this)) {
            let newKey = key.replace("#", "");
            if (newKey.startsWith("_")) {
                newKey = newKey.substring(1, newKey.length);
            }
            Object.defineProperty(copy, newKey, {
                value: Object.getOwnPropertyDescriptor(this, key).value,
                enumerable: true,
                writable: true,
                configurable: true
            });
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
    public static fromJSON(jsonColorScheme: Object): ColorScheme {
        let colorScheme = {};
        for (let [key, value] of Object.entries(jsonColorScheme)) {
            console.log(key);
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
                    console.log("defualt switch");
                    newValue = value;
                    break;
            }
            console.log(newValue);
            Object.defineProperty(colorScheme, newKey, {
                value: newValue,
                enumerable: true,
                writable: true,
                configurable: true
            });
        }
        return new ColorScheme(colorScheme);
    }

    public get name(): string {
        return this._name;
    }

    public setName(name: string): this {
        this._name = name;
        return this;
    }

    public get author(): string {
        return this._author;
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
        this._colors = colors;
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
}


class ColorPickerService {
    // private current: string;
    // #preDefined: boolean = false;

    private _all: ColorSchemeMap = new Map<string, ColorScheme>();
    private _colorTypes: string[] = [];
    private fruits: string[] = ["fgf", "fd", "gfdsg"];

    constructor() {
        let default1 = this.getDefault(true);
        for (let i of default1.colors.keys()) {
            if (this._colorTypes.indexOf(i) == -1) {
                this._colorTypes.push(i);
            }
        }
        this.save(default1);
        let all = window.localStorage.getItem("colors") != null ? JSON.parse(window.localStorage.getItem("colors")) : {};
        console.log(all);
        for (let colorJson of Object.values(all)) {
            let color = ColorScheme.fromJSON(colorJson);
            this._all.set(color.id, color);

            if (this._all.has(window.localStorage.getItem("current_color"))) {
                this.activate(this._all.get(window.localStorage.getItem("current_color")));
            } else {
                this.activate(this.getDefault());
            }
        }
    }

    /**
     * Writes all colors into body to override the default colors
     */
    activate(colorScheme: ColorScheme) {
        for (let [type, color] of colorScheme.colors.entries()) {
            document.body.style.setProperty(type, color);
        }
        colorScheme.setCurrent(true);
    }

    /**
     * Return the instance by id or create a new one
     * @param id {string | null}
     */
    getColorScheme(id?: string): ColorScheme {
        //todo check necessary if
        if (id != null && this._all.has(id)) {
            return this._all.get(id);
        }
        let n = new ColorScheme(this, id);
        this._all.set(n.id, n);
        return n;
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
            if (href != null && !new RegExp(href).test(styleSheets[i].href)) {
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
    public getDefault(forceReload: boolean = false) {
        let result = this._all.get("default");
        if (forceReload || result == null) {
            let colors: ColorMap = this.getCSSVariables(document.styleSheets, null);
            result = new ColorScheme(this, "default", "default", "default", colors);
            result.setPreDefined(true);
        }
        return result;
    }

    /**
     * gets all data from local storage (if present) and writes them into this object<br>
     * <b>DO NOT CALL THIS IN A LOOP</b>, That would be very inefficient
     */
    public reloadFromStorage(colorScheme: ColorScheme) {
        let colors = window.localStorage.getItem("colors") != null ? JSON.parse(window.localStorage.getItem("colors")) : {};
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
        console.log("save");
        console.log(schemes);
        for (let i of schemes) {
            this._all.set(i.id, i);
        }
        let colors = window.localStorage.getItem("colors") != null ? JSON.parse(window.localStorage.getItem("colors")) : {};
        for (let [id, color] of this._all.entries()) {
            colors[id] = color;
        }
        window.localStorage.setItem("colors", JSON.stringify(colors));
        return this;
    }

    /**
     * should be used when the color input onChange fires
     * @param colorType {string}
     * @param newColor {string}
     */
    onChange(colorType: string, newColor: string) {
        let colorScheme = this.getCurrent();
        if (colorScheme == null || colorScheme.preDefined) {
            colorScheme = new ColorScheme(this, null, null, null, this.getColorScheme(colorType).colors);
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

    /**
     *
     * @param forceReload {boolean}
     * @return {ColorPickerService}
     */
    public getCurrent(forceReload = false) {
        if (!forceReload) {
            for (let i in this._all) {
                if (this._all.get(i).current) {
                    return this._all.get(i);
                }
            }
        }
        return window.localStorage.getItem("current_color") != null ? (this._all.has(window.localStorage.getItem("current_color")) ? this._all.get(window.localStorage.getItem("current_color")) : this.getDefault()) : this.getDefault();
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

const ColorPickerItemEvents = {
    ...WidgetEvents,
    colorChanged: "colorChanged",
};
type ColorPickerItemEvents = (typeof ColorPickerItemEvents)[keyof typeof ColorPickerItemEvents];

class ColorPickerItem extends ListTile<ColorPickerItemEvents> {
    constructor() {
        super();
        this.setInheritVisibility(true);
        this.setTrailingIcon(Icon.Edit());
        this.enableTrailingIcon(true);
        this.on(undefined, EventCallbacks.setHeight);
    }

    public build(suppressCallback: boolean = false): JQuery<HTMLElement> {
        super.build(true)
            .addClass("item");

        this.buildCallback(suppressCallback);
        return this.domObject;
    }
}

class ColorPicker extends Dialog<WidgetEvents, ColorScheme> {
    private readonly colorPickerService: ColorPickerService;
    private readonly top: Top;
    private readonly colorSchemeDialog: Overlay<SelectMenu>;
    private readonly colorSchemeButton: Button;
    private readonly colorSchemeLabel: Text;
    private readonly colorSchemeBox: FlexBox;

    public constructor() {
        super();
        this.colorPickerService = new ColorPickerService();
        this.colorSchemeDialog = new Overlay<SelectMenu>(new SelectMenu(null, null)
            .setMaxSelected(1)
            .setMinSelected(1)
            .setTitle("Color Scheme")
            .addButton(Button.Delete().on(undefined, new Pair(ButtonEvents.clicked, (event) => {

            })), FlexAlign.end)
            .addButton(new Button().setLabel("New").setIcon(Icon.of("add", IconType.material))
                .on(undefined, new Pair(ButtonEvents.clicked, (event) => {

            })), FlexAlign.end)
            .enableButtons(true)
        );
        this.colorSchemeButton = new Button()
            .setInheritVisibility(true)
            .setIcon(Icon.of("expand_more", IconType.material))
            .setLabel("Anything")
            .on(undefined, new Pair(ButtonEvents.clicked, () => this.colorSchemeDialog.widget.open()));
        this.colorSchemeLabel = new Text().set("Color-Scheme")
            .setInheritVisibility(true)
            .setFontWeight(FontWeight.bold)
            .setFontSize(FontSize.large);
        this.colorSchemeBox = new FlexBox().setInheritVisibility(true)
            .addItem(this.colorSchemeLabel, FlexAlign.start)
            .addItem(this.colorSchemeButton, FlexAlign.start)
            .setSpacing("3rem", "1rem", "2rem");

        this.top = new Top().setLabel("Color-Picker")
            .setInheritVisibility(true)
            .setIcon(Icon.Close().setClickable(true));
        this.children.set("top", this.top);
        this.children.set("colorSchemeDialog", this.colorSchemeDialog);
        // this.children.set("colorSchemeButton", this.colorSchemeButton);
        // this.children.set("colorSchemeLabel", this.colorSchemeLabel);
        this.children.set("colorSchemeBox", this.colorSchemeBox);

        this.on({
            "sizeSet": () => {
                this.domObject.children(".content").css("max-height", "calc(100% - "
                    // + this.domObject.find(".bottom").outerHeight(true) + "px - "
                    + this.domObject.children(".top").outerHeight(true) + "px)");
            }
        });
        this.enableButtons(false);
    }

    public build(suppressCallback: boolean = false): JQuery<HTMLElement> {
        //color schemes
        for (let scheme of this.colorPickerService.all.values()) {
            let item = new SelectMenuItem<string>()
                .setInheritVisibility(true)
                .setLabel(scheme.name)
                .setCheckbox(true)
                .setValue(scheme.id)
                .setSelected(scheme.current)
                .setIcon(Icon.Info());
            this.colorSchemeDialog.widget.addItems(item);
        }

        super.build(true)
            .addClass("color-picker")
            .append(this.colorSchemeDialog.build())
            .append(this.top.build()
                .addClass("top"));
        this.colorSchemeDialog.widget.domObject
            .addClass("color-scheme-dialog");
        let content = $("<div></div>")
            .addClass("content")
            .appendTo(this.domObject);

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
        content.append(this.colorSchemeBox.build()
            .addClass("color-scheme"));

        //color items
        let i = 0;
        for (let colorType of this.colorPickerService.colorTypes) {
            let item = new ColorPickerItem();
            this.children.set("colorPickerItem" + i, item);

            item.setVisibility(this.visibility);
            item.backgroundColor.set("var(" + colorType + ")");
            item.label.set(this.colorPickerService.getDisplayColorName(colorType));
            item.on(undefined, new Pair(ColorPickerItemEvents.colorChanged, (event, colorValue) => this.colorPickerService.onChange((<ColorPickerItem>event.target).label.get(), colorValue)));

            content.append(item.build());
            i++;
        }

        this.buildCallback(suppressCallback);
        return this.domObject;
    }

    protected setValue(): ColorScheme {
        this.value = this.colorPickerService.getCurrent();
        return this.value;
    }
}

class ColorSchemeNewDialog extends Dialog<any, ColorScheme> {
    private baseScheme: ColorScheme;
    private newScheme: ColorScheme = new ColorScheme({});

    constructor(baseScheme: ColorScheme) {
        super();
        this.baseScheme = baseScheme;
    }

    protected setValue(): ColorScheme {
        return this.value;
    }
}

export {ColorScheme, ColorPickerService, ColorPicker};