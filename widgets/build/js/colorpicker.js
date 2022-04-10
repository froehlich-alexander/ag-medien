import { Pair, toObject } from "./base.js";
import { Dialog, DialogEvents } from "./Dialog.js";
import { Overlay } from "./Overlay.js";
import { WidgetEvents } from "./Widget.js";
import { FontSize, FontWeight } from "./WidgetBase.js";
import { Button, ButtonEvents, FlexAlign, FlexBox, Icon, IconType, ListTile, SelectBox, SelectBoxEvents, SelectBoxItem, Text, TextInput, TextInputEvents, Top, TopEvents } from "./Widgets.js";
import { EventCallbacks } from "./AbstractWidgets.js";
class ColorMap extends Map {
}
class ColorScheme {
    /**
     * DON'T USE THIS CONSTRUCTOR!!! USE {@link get} instead<br>
     * This will insert (random) strings if you set null for {@link _name} or {@link _id}
     * @param service {ColorPickerService}
     * @param id {string | null}
     * @param author {string | null}
     * @param name {string | null}
     * @param colors {{string: string}}
     */
    constructor(service, id, name, author, colors = new Map()) {
        Object.defineProperty(this, "_name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_author", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_colors", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new ColorMap()
        });
        Object.defineProperty(this, "_current", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "_preDefined", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        console.assert(service != null, "service is null");
        if (service instanceof ColorPickerService) {
            this._id = id != null ? id : service.generateId();
            this._name = name != null ? name : service.generateName();
            this._author = author != null ? author : "unknown";
            this._preDefined = false;
            for (let key of colors.keys()) {
                this._colors.set(key, colors.get(key) ?? "inherit");
            }
            service.all.set(this._id, this);
        }
        else {
            for (let key of Object.keys(service)) {
                // console.log(key);
                // console.log(Object.getOwnPropertyDescriptor(service, key));
                // Object.defineProperty(this, key, Object.getOwnPropertyDescriptor(service, key));
                // @ts-ignore
                this[key] = service[key];
            }
        }
    }
    /**
     * @return {ColorScheme}
     */
    toJSON() {
        let copy = {};
        for (let key of Object.keys(this)) {
            let newKey = key.replace("#", "");
            if (newKey.startsWith("_")) {
                newKey = newKey.substring(1, newKey.length);
            }
            // Object.defineProperty(copy, newKey, {
            //     value: Object.getOwnPropertyDescriptor(this, key).value,
            //     enumerable: true,
            //     writable: true,
            //     configurable: true
            // });
            // @ts-ignore
            copy[newKey] = toObject(this[key]);
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
    static fromJSON(jsonColorScheme) {
        let colorScheme = {};
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
    copy(colorScheme) {
        if (colorScheme === undefined) {
            colorScheme = new ColorScheme({});
        }
        return colorScheme.setName(this.name)
            .setAuthor(this.author)
            .setColors(this.colors);
    }
    get name() {
        return this._name;
    }
    setName(name) {
        this._name = name;
        return this;
    }
    get author() {
        return this._author;
    }
    setAuthor(author) {
        this._author = author;
        return this;
    }
    get id() {
        return this._id;
    }
    get colors() {
        return this._colors;
    }
    setColors(colors) {
        for (let [k, v] of colors) {
            this._colors.set(k, v);
        }
        return this;
    }
    get current() {
        return this._current;
    }
    setCurrent(current) {
        this._current = current;
        return this;
    }
    get preDefined() {
        return this._preDefined;
    }
    setPreDefined(preDefined) {
        this._preDefined = preDefined;
        return this;
    }
}
class ColorPickerService {
    constructor() {
        // private current: string;
        // #preDefined: boolean = false;
        Object.defineProperty(this, "_all", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "_colorTypes", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "fruits", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["fgf", "fd", "gfdsg"]
        });
        let default1 = this.getDefault(true);
        for (let i of default1.colors.keys()) {
            if (this._colorTypes.indexOf(i) == -1) {
                this._colorTypes.push(i);
            }
        }
        this.save(default1);
        let all = window.localStorage.getItem("colors") != null ? JSON.parse(window.localStorage.getItem("colors")) : {};
        for (let colorJson of Object.values(all)) {
            let color = ColorScheme.fromJSON(colorJson);
            this._all.set(color.id, color);
            if (this._all.has(window.localStorage.getItem("current_color"))) {
                this.activate(this._all.get(window.localStorage.getItem("current_color")));
            }
            else {
                this.activate(this.getDefault());
            }
        }
    }
    /**
     * Writes all colors into body to override the default colors
     */
    activate(colorScheme) {
        for (let [type, color] of colorScheme.colors.entries()) {
            document.body.style.setProperty(type, color);
        }
        colorScheme.setCurrent(true);
    }
    /**
     * Return the instance by id or create a new one
     * @param id {string | null}
     */
    getColorScheme(id) {
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
    getCSSVariables(styleSheets = document.styleSheets, href, selector) {
        const cssVars = new Map();
        for (let i = 0; i < styleSheets.length; i++) {
            if (href != null && !new RegExp(href).test(styleSheets[i].href)) {
                continue;
            }
            try {
                for (let j = 0; j < styleSheets[i].cssRules.length; j++) {
                    let rule = styleSheets[i].cssRules[j];
                    if (!rule || !rule.style || (selector != null && rule.selectorText != selector)) {
                        continue;
                    }
                    for (let k = 0; k < rule.style.length; k++) {
                        if (rule.style.item(k).startsWith("--")) {
                            cssVars.set(rule.style.item(k), rule.style.getPropertyValue(rule.style.item(k)));
                        }
                    }
                }
            }
            catch (error) {
            }
        }
        console.log("cssVars");
        console.log(cssVars);
        return cssVars;
    }
    ;
    /**
     * This does <b>NOT</b> save the default object!!!
     * @return {ColorPickerService}
     * @param forceReload {boolean} whether it's forced to reload the default from the css stylesheet
     */
    getDefault(forceReload = false) {
        let result = this._all.get("default");
        if (forceReload || result == null) {
            let colors = this.getCSSVariables(document.styleSheets, undefined);
            result = new ColorScheme(this, "default", "default", "default", colors);
            result.setPreDefined(true);
        }
        return result;
    }
    /**
     * gets all data from local storage (if present) and writes them into this object<br>
     * <b>DO NOT CALL THIS IN A LOOP</b>, That would be very inefficient
     */
    reloadFromStorage(colorScheme) {
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
    generateName() {
        //TODO 20.03.2022 check if the logic below makes sense
        let r;
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
    generateId() {
        let r;
        do {
            r = Math.floor(Math.random() * 1000000).toString();
        } while (r in this._all);
        return r;
    }
    /**
     * Add this to #all and save
     * @return {ColorPickerService} this
     */
    save(...schemes) {
        for (let i of schemes) {
            this._all.set(i.id, i);
        }
        // let colors = window.localStorage.getItem("colors") != null ? JSON.parse(window.localStorage.getItem("colors")) : {};
        let colors = JSON.parse(window.localStorage.getItem("colors") ?? "{}");
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
    onChange(colorType, newColor) {
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
    get all() {
        return this._all;
    }
    delete(...colorScheme) {
        for (let i of colorScheme) {
            if (i instanceof ColorScheme) {
                i = i.id;
            }
            this._all.delete(i);
        }
        return this;
    }
    /**
     *
     * @param forceReload {boolean}
     * @return {ColorPickerService}
     */
    getCurrent(forceReload = false) {
        if (!forceReload) {
            for (let i in this._all) {
                if (this._all.get(i)?.current) {
                    return this._all.get(i);
                }
            }
        }
        return window.localStorage.getItem("current_color") != null ? (this._all.has(window.localStorage.getItem("current_color")) ? this._all.get(window.localStorage.getItem("current_color")) : this.getDefault()) : this.getDefault();
    }
    get colorTypes() {
        return this._colorTypes;
    }
    /**
     * Returns the display name of a color type
     * @param colorType {string}
     * @returns {string}
     */
    getDisplayColorName(colorType) {
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
class ColorPickerItem extends ListTile {
    constructor() {
        super();
        this.setInheritVisibility(true);
        this.setTrailingIcon(Icon.Edit());
        this.enableTrailingIcon(true);
        this.on(undefined, EventCallbacks.setHeight);
    }
    build(suppressCallback = false) {
        super.build(true)
            .addClass("item");
        this.buildCallback(suppressCallback);
        return this.domObject;
    }
}
class ColorPicker extends Dialog {
    constructor() {
        super();
        Object.defineProperty(this, "colorPickerService", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "top", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "colorSchemeDialog", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // private readonly colorSchemeNewDialog: Overlay<ColorSchemeNewDialog>;
        Object.defineProperty(this, "colorSchemeButton", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "colorSchemeLabel", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "colorSchemeBox", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
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
        this.colorSchemeDialog = new Overlay(new ColorSchemeDialog(this.colorPickerService));
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
        this.addChild("top", this.top);
        this.addChild("colorSchemeDialog", this.colorSchemeDialog);
        // this.children.set("colorSchemeNewDialog", this.colorSchemeNewDialog);
        // this.children.set("colorSchemeButton", this.colorSchemeButton);
        // this.children.set("colorSchemeLabel", this.colorSchemeLabel);
        this.addChild("colorSchemeBox", this.colorSchemeBox);
        this.on({
            "sizeSet": () => {
                this.domObject.children(".content").css("max-height", "calc(100% - "
                    // + this.domObject.find(".bottom").outerHeight(true) + "px - "
                    + this.domObject.children(".top").outerHeight(true) + "px)");
            }
        });
        this.enableButtons(false);
    }
    build(suppressCallback = false) {
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
            // .append(this.colorSchemeNewDialog.build())
            .append(this.top.build()
            .addClass("top"));
        // this.colorSchemeDialog.widget.domObject
        //     .addClass("color-scheme-dialog");
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
            this.addChild("colorPickerItem" + i, item);
            item.setVisibility(this.visibility);
            item.backgroundColor.set("var(" + colorType + ")");
            item.label.set(this.colorPickerService.getDisplayColorName(colorType));
            item.on(undefined, new Pair(ColorPickerItemEvents.colorChanged, (event, colorValue) => this.colorPickerService.onChange(event.target.label.get(), colorValue)));
            content.append(item.build());
            i++;
        }
        this.buildCallback(suppressCallback);
        return this.domObject;
    }
    setValue() {
        this.value = this.colorPickerService.getCurrent();
        return this.value;
    }
}
var ColorSchemeItemEvents;
(function (ColorSchemeItemEvents) {
    ColorSchemeItemEvents["infoCLicked"] = "infoCLicked";
})(ColorSchemeItemEvents || (ColorSchemeItemEvents = {}));
class ColorSchemeItem extends ListTile {
    constructor(colorScheme) {
        super();
        Object.defineProperty(this, "_colorScheme", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this._colorScheme = colorScheme;
        this.setLeadingIcon(Icon.Info());
        this.getLeadingIcon().on2(WidgetEvents.clicked, () => console.log("icon clicked")).on2(WidgetEvents.clicked, () => this.dispatchEvent(ColorSchemeItemEvents.infoCLicked));
        this.addItem(Icon.Back(), FlexAlign.start);
        this.setLabel(colorScheme.name);
        this.enableCheckbox(true);
    }
    build(suppressCallback = false) {
        super.build(true)
            .addClass("default-item");
        this.buildCallback(suppressCallback);
        return this.domObject;
    }
    rebuild(suppressCallback = false) {
        super.rebuild(true);
        this.rebuildCallback(suppressCallback);
        return this.domObject;
    }
    get colorScheme() {
        return this._colorScheme;
    }
}
class ColorSchemeDialog extends Dialog {
    constructor(colorPickerService) {
        super();
        Object.defineProperty(this, "colorSchemeNewDialog", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "colorSchemeInfoDialog", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "colorPickerService", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.colorPickerService = colorPickerService;
        this.colorSchemeNewDialog = new Overlay(new ColorSchemeNewDialog(this.colorPickerService, this.colorPickerService.getCurrent())
            .on2(DialogEvents.accepted, (event, value) => {
            console.log(value);
            this.rebuild();
            // this.aContent.addItems(value);
        }));
        this.colorSchemeInfoDialog = new Overlay(new ColorSchemeInfoDialog(this.colorPickerService, this.colorPickerService.getCurrent()));
        this.enableTop(true);
        this.aTop.setLabel("Color Schemes");
        this.aTop.on2(TopEvents.iconClicked, () => this.reject());
        this.enableContent(true);
        this.enableButtons(true);
        this.buttonBox
            .addButton(Button.Delete()
            .on2(ButtonEvents.clicked, (event) => {
            console.log("delete");
            this.colorPickerService.delete(...this.aContent.items);
        }), FlexAlign.end)
            .addButton(new Button().setLabel("New").setIcon(Icon.of("add", IconType.material))
            .on2(ButtonEvents.clicked, (event) => {
            console.log("new");
            this.colorSchemeNewDialog.widget.setBaseScheme(this.colorPickerService.getCurrent());
            this.colorSchemeNewDialog.widget.open();
        }), FlexAlign.end);
        this.addChild("colorSchemeNewDialog");
        this.addChild("colorSchemeInfoDialog");
    }
    rebuild(suppressCallback = false) {
        super.rebuild(true);
        //color schemes
        this.aContent.addItems(...[...this.colorPickerService.all.values()]
            .filter(value => this.aContent.items
            .filter(v => (v instanceof ColorSchemeItem))
            .map(value1 => value1.colorScheme.id).indexOf(value.id) == -1)
            .map(value => {
            let item = new ColorSchemeItem(value)
                .setInheritVisibility(true)
                .show();
            item.build();
            console.log(value);
            return item;
        }));
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
    build(suppressCallback = false) {
        super.build(true)
            .addClass("color-scheme-dialog")
            .append(this.colorSchemeNewDialog.build())
            .append(this.colorSchemeInfoDialog.build());
        //color schemes
        this.aContent.addItems(...[...this.colorPickerService.all.values()].map(value => new ColorSchemeItem(value)
            .setInheritVisibility(true)
            .on2(ColorSchemeItemEvents.infoCLicked, (event) => {
            console.log("info clicked");
            console.log(event.target);
            this.colorSchemeInfoDialog.widget
                // .setColorScheme((<ColorSchemeItem>event.target).colorScheme)
                .open(event.target.colorScheme);
        })));
        this.buildTop();
        this.buildContent();
        this.buildButtons();
        this.buildCallback(suppressCallback);
        return this.domObject;
    }
    setValue() {
        return null;
    }
}
var Utils;
(function (Utils) {
    function nameInput(identifier) {
        return new TextInput()
            .setId(identifier + "_name")
            .setLabel("Name")
            .setMinLength(3)
            .setSpellcheck(true);
    }
    Utils.nameInput = nameInput;
    function authorInput(identifier) {
        return new TextInput()
            .setId(identifier + "_author")
            .setLabel("Author")
            .setMinLength(5);
    }
    Utils.authorInput = authorInput;
    function colorSchemeSelectBox(service, identifier) {
        return new SelectBox()
            .addItems(...[...service.all.values()].map(v => {
            let item = new SelectBoxItem()
                .setLabel(v.name)
                .setId(identifier + v.id);
            item.value.setValue(v.id)
                .setChecked(v.current);
            return item;
        }));
    }
    Utils.colorSchemeSelectBox = colorSchemeSelectBox;
})(Utils || (Utils = {}));
class ColorSchemeNewDialog extends Dialog {
    constructor(service, baseScheme) {
        super(undefined, "form");
        Object.defineProperty(this, "baseScheme", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "service", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "nameInput", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "authorInput", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "colorSchemeSelectBox", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.service = service;
        this.enableContent(true);
        this.enableButtons(true);
        this.addButton(new Button().setLabel("Create").setIcon(Icon.of("add", IconType.material))
            .on(undefined, new Pair(ButtonEvents.clicked, () => this.accept())), FlexAlign.end);
        this.addButton(Button.Cancel().on(undefined, new Pair(ButtonEvents.clicked, () => this.reject())), FlexAlign.end);
        this.enableTop(true);
        this.aTop.setLabel("New Color-Scheme")
            .setDefaultTop(true)
            .on2(TopEvents.iconClicked, () => this.reject());
        // this.aTop.setIcon(Icon.Close().on(undefined, new Pair(IconEvents.clicked, () => {this.reject();
        //     console.log("close");})));
        this.baseScheme = baseScheme ?? service.getDefault();
        this.on(undefined, new Pair(DialogEvents.accepted, (event, value) => {
            console.log("accepted");
            console.log(event);
            console.log(value);
        }));
        this.on(undefined, new Pair(DialogEvents.rejected, (event, value) => {
            console.log("rejected");
            console.log(event);
            console.log(value);
        }));
        //ColorScheme field inputs
        this.nameInput = Utils.nameInput(ColorSchemeNewDialog.name);
        // .on2(TextInputEvents.input, (event, value) => {
        //     this._colorScheme.setName(value);
        //     this.nameInput.rebuild();
        //     this.service.save(this._colorScheme);
        // });
        this.authorInput = Utils.authorInput(ColorSchemeNewDialog.name);
        // .on2(TextInputEvents.input, (event, value) => {
        //     this._colorScheme.setAuthor(value);
        //     this.nameInput.rebuild();
        //     this.service.save(this._colorScheme);
        // });
        this.colorSchemeSelectBox = Utils.colorSchemeSelectBox(this.service, ColorSchemeNewDialog.name)
            .on2(SelectBoxEvents.input, (event, value) => this.baseScheme = this.service.getColorScheme(value));
        this.aContent.addItems(this.colorSchemeSelectBox, this.nameInput, this.authorInput);
    }
    build(suppressCallback = false) {
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
    rebuild(suppressCallback = false) {
        super.rebuild(true);
        this.rebuildCallback(suppressCallback);
        return this.domObject;
    }
    setValue() {
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
            .setColors(this.baseScheme.colors)
            .setCurrent(false)
            .setPreDefined(false)
            .setName(this.nameInput.value ?? this.baseScheme.name)
            .setAuthor(this.authorInput.value ?? this.baseScheme.author);
        this.service.save(scheme);
        return scheme;
    }
    open(value) {
        super.open(value);
        this.nameInput.setValue("")
            .setPlaceHolder(this.baseScheme.name);
        this.authorInput.setValue("")
            .setPlaceHolder(this.baseScheme.author);
        return this;
    }
    setBaseScheme(scheme) {
        this.baseScheme = scheme;
        return this;
    }
}
class ColorSchemeInfoDialog extends Dialog {
    constructor(service, colorScheme) {
        super();
        Object.defineProperty(this, "_colorScheme", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "colorSchemeBackup", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "nameInput", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "authorInput", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "service", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.colorSchemeBackup = colorScheme.copy();
        this.service = service;
        this._colorScheme = colorScheme;
        //ColorScheme field inputs
        this.nameInput = Utils.nameInput(ColorSchemeInfoDialog.name)
            .on2(TextInputEvents.input, (event, value) => {
            this._colorScheme.setName(value);
            this.nameInput.rebuild();
            this.service.save(this._colorScheme);
        });
        this.authorInput = Utils.authorInput(ColorSchemeInfoDialog.name)
            .on2(TextInputEvents.input, (event, value) => {
            this._colorScheme.setAuthor(value);
            this.nameInput.rebuild();
            this.service.save(this._colorScheme);
        });
        this.aContent.addItems(this.nameInput, this.authorInput);
        this.enableTop(true);
        this.enableContent(true);
        this.enableButtons(true);
        this.aTop.setLabel(colorScheme.name)
            .setDefaultTop(true)
            .on2(TopEvents.iconClicked, () => this.reject());
        this.addButton(Button.Reset()
            .on2(WidgetEvents.clicked, () => {
            this.colorSchemeBackup.copy(this._colorScheme);
            if (this._colorScheme.current) {
                this.service.activate(this._colorScheme);
            }
            this.service.save(this._colorScheme);
            this.rebuild();
        }), FlexAlign.end);
        this.addButton(Button.Activate().on2(WidgetEvents.clicked, () => {
            this.service.activate(this._colorScheme);
            this.service.save(this._colorScheme);
        }), FlexAlign.end);
    }
    build(suppressCallback = false) {
        super.build(true);
        this.domObject.addClass("color-scheme-info-dialog");
        this.buildTop();
        this.buildContent();
        this.buildButtons();
        this.buildCallback(suppressCallback);
        return this.domObject;
    }
    rebuild(suppressCallback = false) {
        super.rebuild(true);
        this.nameInput.setPlaceHolder(this._colorScheme.name);
        // this.nameInput.setLabel(this._colorScheme.name);
        this.authorInput.setPlaceHolder(this._colorScheme.author);
        // this.authorInput.setLabel(this._colorScheme.author);
        this.aTop.rebuild();
        this.aContent.rebuild();
        this.buttonBox.rebuild();
        this.nameInput.rebuild();
        this.authorInput.rebuild();
        this.rebuildCallback(suppressCallback);
        return this.domObject;
    }
    open(value) {
        super.open(value);
        this.setColorScheme(value);
        this.aTop.setLabel(this._colorScheme.name);
        this.nameInput.setValue(this._colorScheme.name);
        this.authorInput.setValue(this._colorScheme.author);
        return this;
    }
    setValue() {
        return this._colorScheme;
    }
    get colorScheme() {
        return this._colorScheme;
    }
    setColorScheme(colorScheme) {
        this._colorScheme = colorScheme;
        colorScheme.copy(this.colorSchemeBackup);
        this.tryRebuild();
        return this;
    }
}
export { ColorScheme, ColorPickerService, ColorPicker };
//# sourceMappingURL=colorpicker.js.map