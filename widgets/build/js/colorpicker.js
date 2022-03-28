var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { CheckboxContaining, EventCallbacks } from "./AbstractWidgets.js";
import { mixin, Pair, toObject } from "./base.js";
import { Dialog, DialogEvents } from "./Dialog.js";
import { Overlay } from "./Overlay.js";
import { WidgetEvents } from "./Widget.js";
import { FontSize, FontWeight } from "./WidgetBase.js";
import { Button, ButtonEvents, ContentBox, FlexAlign, FlexBox, Icon, IconType, ListTile, Text, TextInput, Top, TopEvents } from "./Widgets.js";
class ColorMap extends Map {
}
class ColorScheme {
    constructor(service, id, name, author, colors = new Map()) {
        this._colors = new ColorMap();
        this._current = false;
        this._preDefined = false;
        console.assert(service != null, "service is null");
        if (service instanceof ColorPickerService) {
            this._id = id != null ? id : service.generateId();
            this._name = name != null ? name : service.generateName();
            this._author = author != null ? author : "unknown";
            this._preDefined = false;
            for (let key of colors.keys()) {
                this._colors.set(key, colors.get(key) != null ? colors.get(key) : "inherit");
            }
            service.all.set(this._id, this);
        }
        else {
            for (let key of Object.keys(service)) {
                this[key] = service[key];
            }
        }
    }
    toJSON() {
        let copy = {};
        for (let key of Object.keys(this)) {
            let newKey = key.replace("#", "");
            if (newKey.startsWith("_")) {
                newKey = newKey.substring(1, newKey.length);
            }
            copy[newKey] = toObject(this[key]);
        }
        return copy;
    }
    static fromJSON(jsonColorScheme) {
        let colorScheme = {};
        for (let [key, value] of Object.entries(jsonColorScheme)) {
            let newKey = "";
            let newValue;
            switch (key) {
                case "colors":
                    newValue = new Map();
                    for (let [i, j] of Object.entries(value)) {
                        newValue.set(i, j);
                    }
                case "someThingThatWillNeverBeTrue":
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
        this._all = new Map();
        this._colorTypes = [];
        this.fruits = ["fgf", "fd", "gfdsg"];
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
    activate(colorScheme) {
        for (let [type, color] of colorScheme.colors.entries()) {
            document.body.style.setProperty(type, color);
        }
        colorScheme.setCurrent(true);
    }
    getColorScheme(id) {
        if (id != null && this._all.has(id)) {
            return this._all.get(id);
        }
        let n = new ColorScheme(this, id);
        this._all.set(n.id, n);
        return n;
    }
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
    getDefault(forceReload = false) {
        let result = this._all.get("default");
        if (forceReload || result == null) {
            let colors = this.getCSSVariables(document.styleSheets, null);
            result = new ColorScheme(this, "default", "default", "default", colors);
            result.setPreDefined(true);
        }
        return result;
    }
    reloadFromStorage(colorScheme) {
        let colors = window.localStorage.getItem("colors") != null ? JSON.parse(window.localStorage.getItem("colors")) : {};
        if (colorScheme.id in Object.keys(colors)) {
            colorScheme.setName(colors[colorScheme.id].name);
            colorScheme.setAuthor(colors[colorScheme.id].author);
            for (let i in colors[colorScheme.id].colors) {
                colorScheme.colors.set(i, colors[colorScheme.id].colors[i]);
            }
        }
    }
    generateName() {
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
    save(...schemes) {
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
    getCurrent(forceReload = false) {
        if (!forceReload) {
            for (let i in this._all) {
                if (this._all.get(i).current) {
                    return this._all.get(i);
                }
            }
        }
        return window.localStorage.getItem("current_color") != null ? (this._all.has(window.localStorage.getItem("current_color")) ? this._all.get(window.localStorage.getItem("current_color")) : this.getDefault()) : this.getDefault();
    }
    get colorTypes() {
        return this._colorTypes;
    }
    getDisplayColorName(colorType) {
        let newColorType = colorType.replace("--", "");
        newColorType = newColorType.charAt(0).toLocaleUpperCase() + newColorType.substring(1, newColorType.length);
        return newColorType;
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
        this.colorPickerService = new ColorPickerService();
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
        this.addChild("colorSchemeBox", this.colorSchemeBox);
        this.on({
            "sizeSet": () => {
                this.domObject.children(".content").css("max-height", "calc(100% - "
                    + this.domObject.children(".top").outerHeight(true) + "px)");
            }
        });
        this.enableButtons(false);
    }
    build(suppressCallback = false) {
        super.build(true)
            .addClass("color-picker")
            .append(this.colorSchemeDialog.build())
            .append(this.top.build()
            .addClass("top"));
        let content = $("<div></div>")
            .addClass("content")
            .appendTo(this.domObject);
        content.append(this.colorSchemeBox.build()
            .addClass("color-scheme"));
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
    ColorSchemeItemEvents["a"] = "a";
})(ColorSchemeItemEvents || (ColorSchemeItemEvents = {}));
let ColorSchemeItem = class ColorSchemeItem extends ListTile {
    constructor(colorScheme) {
        super();
        this._colorScheme = colorScheme;
        this.mixinConstructor(CheckboxContaining);
        this.enableCheckbox(true);
        this.setLeadingIcon(Icon.Info());
        this.setLabel(colorScheme.name);
    }
    build(suppressCallback = false) {
        super.build(true);
        this.buildCheckbox();
        this.buildCallback(suppressCallback);
        return this.domObject;
    }
    rebuild(suppressCallback = false) {
        super.rebuild(true);
        this.rebuildCheckbox();
        this.rebuildCallback(suppressCallback);
        return this.domObject;
    }
    get colorScheme() {
        return this._colorScheme;
    }
};
ColorSchemeItem = __decorate([
    mixin(CheckboxContaining)
], ColorSchemeItem);
class ColorSchemeDialog extends Dialog {
    constructor(colorPickerService) {
        super();
        this.colorPickerService = colorPickerService;
        this.colorSchemeNewDialog = new Overlay(new ColorSchemeNewDialog(this.colorPickerService, this.colorPickerService.getCurrent())
            .on2(DialogEvents.accepted, (event, value) => {
            console.log(value);
            this.rebuild();
        }));
        this.enableTop(true);
        this.aTop.setLabel("Color Schemes");
        this.aTop.on2(TopEvents.iconClicked, () => this.reject());
        this.enableContent(true);
        this.enableButtons(true);
        this.buttonBox
            .addButton(Button.Delete()
            .on2(ButtonEvents.clicked, (event) => {
            console.log("delete");
        }), FlexAlign.end)
            .addButton(new Button().setLabel("New").setIcon(Icon.of("add", IconType.material))
            .on2(ButtonEvents.clicked, (event) => {
            console.log("new");
            this.colorSchemeNewDialog.widget.setBaseScheme(this.colorPickerService.getCurrent());
            this.colorSchemeNewDialog.widget.open();
        }), FlexAlign.end);
        this.addChild("colorSchemeNewDialog");
    }
    rebuild(suppressCallback = false) {
        super.rebuild(true);
        this.aContent.addItems(...[...this.colorPickerService.all.values()]
            .filter(value => this.aContent.items.map((value1) => value1.colorScheme.id).indexOf(value.id) == -1)
            .map(value => {
            let item = new ColorSchemeItem(value)
                .setInheritVisibility(true)
                .show();
            item.build();
            console.log(value);
            return item;
        }));
        if (this.built) {
            this.rebuildCallback(suppressCallback);
        }
        return this.domObject;
    }
    build(suppressCallback = false) {
        super.build(true)
            .addClass("color-scheme-dialog")
            .append(this.colorSchemeNewDialog.build());
        this.aContent.addItems(...[...this.colorPickerService.all.values()].map(value => new ColorSchemeItem(value)
            .setInheritVisibility(true)));
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
class ColorSchemeNewDialog extends Dialog {
    constructor(service, baseScheme) {
        super();
        this.service = service;
        this.content = new ContentBox("form")
            .setInheritVisibility(true);
        this.enableButtons(true);
        this.addButton(new Button().setLabel("Create").setIcon(Icon.of("add", IconType.material))
            .on(undefined, new Pair(ButtonEvents.clicked, () => this.accept())), FlexAlign.end);
        this.addButton(Button.Cancel().on(undefined, new Pair(ButtonEvents.clicked, () => this.reject())), FlexAlign.end);
        this.enableTop(true);
        this.aTop.setLabel("New Color-Scheme");
        this.aTop.on(undefined, new Pair(TopEvents.iconClicked, () => this.reject()));
        if (baseScheme != null) {
            this.baseScheme = baseScheme;
        }
        this.addChild("content", this.content);
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
    }
    build(suppressCallback = false) {
        super.build(true)
            .addClass("color-scheme-new-dialog");
        for (let i of Object.keys(ColorScheme)) {
            this.content.addItems();
        }
        this.content.addItems(...[
            new TextInput()
                .setId("_name")
                .setLabel("Name")
                .setMinLength(3)
                .setSpellcheck(true),
            new TextInput()
                .setId("_author")
                .setLabel("Author")
                .setMinLength(5)
        ].map(value => value.setId(ColorSchemeNewDialog.name + value.id)
            .setPlaceHolder(this.baseScheme[value.id.value])));
        this.buildTop()
            .addClass("default");
        this.domObject.append(this.content.build());
        this.buildButtons();
        this.buildCallback(suppressCallback);
        return this.domObject;
    }
    setValue() {
        console.log("setValue");
        let inputs = {};
        for (let i of this.content.items.filter((value) => value.id.startsWith(ColorSchemeNewDialog.name))) {
            let id = i.id.substring(ColorSchemeNewDialog.name.length, i.id.length);
            console.log(id);
            if (i.value != null) {
                inputs[id] = i.value;
            }
            else {
                inputs[id] = this.baseScheme[id];
            }
        }
        let tempScheme = new ColorScheme(inputs);
        let scheme = this.service.getColorScheme()
            .setColors(this.baseScheme.colors)
            .setCurrent(false)
            .setPreDefined(false)
            .setName(tempScheme.name)
            .setAuthor(tempScheme.author);
        this.service.save(scheme);
        return scheme;
    }
    setBaseScheme(scheme) {
        this.baseScheme = scheme;
        return this;
    }
}
export { ColorScheme, ColorPickerService, ColorPicker };
