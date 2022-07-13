import {toObject} from "../widgets/src/ts/base.js";
import {Color} from "../widgets/src/ts/WidgetBase.js";

type ColorSchemeMap = Map<string, ColorScheme>;

class ColorMap extends Map<string, string> {
}

export enum Designs {
    light = "light",
    dark = "darke",
    system = "system",
}

/**
 * Class for the colorSchemes saved to the local storage
 */
class ColorSchemeData {
    public name: string | undefined;
    public description?: string;
    public author: string | undefined;
    public id: string | undefined;
    public current: boolean | undefined;
    public preDefined: boolean | undefined;
    public colors: { [index: string]: string } | undefined;
    public design: string & Designs | undefined;
}

class ColorSchemeInterface {
    protected _name?: string;
    protected _description?: string;
    protected _author?: string;
    protected _id?: string;
    protected readonly _colors: ColorMap = new ColorMap();
    protected _design: Designs = Designs.system;

    protected _current: boolean = false;
    protected _preDefined: boolean = false;
}

class ColorScheme extends ColorSchemeInterface {
    protected override readonly _id: string = "";

    constructor(service: ColorPickerService, id?: string, name?: string, description?: string, author?: string, design?: Designs, colors?: ColorMap);
    constructor(rawDataObject: ColorSchemeInterface);

    /**
     * DON'T USE THIS CONSTRUCTOR!!!<br>
     * USE {@link ColorPickerService.getColorScheme} or {@link ColorPickerService.newColorScheme} instead<br>
     * This will insert (random) strings if you set null for {@link _name} and / or {@link _id}
     * @param {ColorPickerService | ColorSchemeInterface} service
     * @param {string} id
     * @param {string} name
     * @param {string} description
     * @param {string} author
     * @param {Designs} design
     * @param {ColorMap} colors
     */
    public constructor(service: ColorPickerService | ColorSchemeInterface, id?: string, name?: string, description?: string, author?: string, design?: Designs, colors: ColorMap = new Map()) {
        super();
        console.assert(service != null, "service is null");
        if (service instanceof ColorPickerService) {
            this._id = id != null ? id : service.generateId();
            this._name = name != null ? name : service.generateName();
            this._description = description ?? "No Description";
            this._author = author != null ? author : "unknown";
            this._design = design ?? Designs.system;
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
            .setDescription(this.description)
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

    public get description(): string {
        return this._description!;
    }

    public setDescription(description: string): this {
        this._description = description;
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
    private readonly fruits: string[] = ["Strawberry", "Fraise", "Erdbeere"];
    private readonly callbacks: {
        "delete": ((colorScheme: ColorScheme) => any)[],
        "add": ((colorScheme: ColorScheme) => any)[],
        "activate": ((colorScheme: ColorScheme) => any)[]
    } = {delete: [], add: [], activate: []};

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
        this.trigger("activate", colorScheme);
    }

    /**
     * Returns the instance by the id given or {@link null} if the no item with the id was found
     * @param {string} id
     * @return {ColorScheme | undefined}
     */

    public getColorScheme(id: string): ColorScheme | undefined {
        return this._all.get(id);
        // //t odo check necessary if
        // if (id !== undefined && this._all.has(id)) {
        //     return this._all.get(id)!;
        // }
        // let newColorScheme = new ColorScheme(this, id);
        // this._all.set(newColorScheme.id, newColorScheme);
        // this.trigger("add", newColorScheme);
        // return newColorScheme;
    }

    public newColorScheme({ name, description, author, design, colors}: { [k in keyof ColorScheme]?: ColorScheme[k] }): ColorScheme {
        let newColorScheme = new ColorScheme(this, undefined, name, description, author, design, colors);
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
            result = new ColorScheme(this, "default", "default", "Default Color Scheme", "AG-Medien", Designs.system, colors)
                .setPreDefined(true);
        }
        return result;
    }

    /**
     * gets all data from local storage (if present) and writes them into this object<br>
     * <b>DO NOT CALL THIS IN A LOOP</b>, That would be very inefficient
     * @deprecated no reason to reload anything from storage at any time after init
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
     * @deprecated
     */
    public onChange(colorType: string, newColor: string) {
        let colorScheme = this.getCurrent();
        if (colorScheme.preDefined) {
            colorScheme = new ColorScheme(this, undefined, undefined, undefined, undefined, undefined, this.getCurrent().colors);
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

    public delete(...colorSchemes: (ColorScheme | string)[] | ((ColorScheme | string)[][])): this {
        console.log(colorSchemes);
        let edited = false;
        for (let i of colorSchemes) {
            for (let j of (Array.isArray(i) ? i : [i])) {
                if (j instanceof ColorScheme) {
                    j = j.id;
                }

                let deletingColorScheme = this._all.get(j);
                if (deletingColorScheme !== undefined) {
                    if (deletingColorScheme.preDefined) {
                        //TODO 12.04.2022 alert user ??? bc predefined?
                        console.log("cannot delete predefined color scheme", deletingColorScheme);
                        continue;
                    }
                    if (deletingColorScheme.current) {
                        this.activate(this.getDefault());
                    }
                    console.log(j);
                    console.log(this._all.delete(j));
                    edited = true;
                    this.trigger("delete", deletingColorScheme)
                } else {
                    console.warn("Cannot find ColorScheme (-id)'", j, "' in ColorPickerService.all");
                }
            }
        }
        console.log(this._all);
        if (edited) {
            this.save();
        }
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

    public on(event: keyof ColorPickerService["callbacks"], handler: ColorPickerService["callbacks"][typeof event][number]) {
        this.callbacks[event].push(handler);
    }

    private trigger(event: keyof ColorPickerService["callbacks"], ...args: Parameters<ColorPickerService["callbacks"][typeof event][number]>) {
        let handler: ColorPickerService["callbacks"][typeof event][number];
        for (handler of this.callbacks[event]) {
            // @ts-ignore
            handler(...args);
        }
    }
}

export {ColorPickerService};
export {ColorScheme};