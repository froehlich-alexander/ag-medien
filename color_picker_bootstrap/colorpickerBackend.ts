import {css} from "jquery";
import {ClassComponent} from "./jsxFactory";

type ColorSchemeMap = Map<string, ColorScheme>;

export class ColorMap extends Map<string, string> {
}

export type Design = "light" | "dark" | "system";


export const Designs: { [k in Design]: k } & { all: () => Design[], __all?: Design[] } = {
    light: "light",
    dark: "dark",
    system: "system",
    all: () => {
        if (Designs.__all != null) {
            console.log("all desings", Designs.__all);
            return Designs.__all;
        } else {
            let all = Object.keys(Designs);
            all.splice(all.indexOf("all"), 1);
            Designs.__all = all as Design[];
            return Designs.__all;
        }
    },
}

/**
 * Class for the colorSchemes saved to the local storage
 */
export class ColorSchemeData {
    // constructor(id: string, name: string, description: string, author: string, current: boolean, preDefined: boolean, design: Designs, colors: {[index: string]: string});

    // constructor(id?: string, name?: string, description?: string, author?: string, current?: boolean, preDefined?: boolean, design?: Designs, colors?: {[index: string]: string}) {
    constructor(other?: { [k in keyof ColorSchemeData]-?: NonNullable<ColorSchemeData[k]> }) {
        if (other) {
            this.id = other.id;
            this.name = other.name;
            this.description = other.description;
            this.author = other.author;
            this.current = other.current;
            this.preDefined = other.preDefined;
            this.design = other.design;
            this.colors = other.colors;
        }
    }

    public id?: string;
    public name?: string;
    public description?: string;
    public author?: string;
    public current?: boolean;
    public preDefined?: boolean;
    public colors?: { [index: string]: string };
    public design?: Design;
}

export type ColorSchemeTypeStrict = { [k in keyof ColorSchemeInterface]: ColorSchemeInterface[k] };
export type ColorSchemeType =
    { id: ColorSchemeInterface["id"], name: ColorSchemeInterface["name"] }
    & { [k in Exclude<keyof ColorSchemeInterface, "id" | "name">]?: ColorSchemeInterface[k] };
export type ColorSchemeDataTypeOptional = { -readonly [k in keyof ColorSchemeInterface]?: ColorSchemeInterface[k] };

export type Color = string;

export class ColorsBuilder {
    private _colors: { [k: string]: string } = {}

    public addColor(id: string, value: string) {
        this._colors[id] = value;
    }

    public addColors(colors: { [k: string]: string } | Colors) {
        for (let [k, v] of (colors instanceof Colors ? colors.entries() : Object.entries(colors))) {
            this._colors[k] = v;
        }
    }

    public build(): Colors {
        return new Colors(this._colors);
    }
}

export class Colors {
    public static readonly Builder = ColorsBuilder;

    private readonly _colors: { [k: string]: Color };
    private readonly _size: number;

    public get size(): number {
        return this._size;
    }

    constructor(colors?: Colors | { [k: string]: Color | string }) {
        if (colors === undefined) {
            this._colors = {};
            this._size = 0;
        } else if (colors instanceof Colors) {
            this._colors = {...colors._colors};
            this._size = colors.size;
        } else {
            this._colors = {...colors};
            this._size = Object.keys(this._colors).length;
        }
    }

    public withColor(colorId: string, colorValue: Color): Colors {
        return new Colors({...this, [colorId]: colorValue});
    }

    public withColors(colors?: Colors | Colors["_colors"]): Colors {
        return new Colors(colors ? {...this._colors, ...(colors instanceof Colors ? colors._colors : colors)} : this);
    }

    public get(colorId: string): Color | undefined {
        return this._colors[colorId];
    }

    public entries(): [string, Color][] {
        return Object.entries(this._colors);
    }

    public toJSON(): { [k: string]: string } {
        return this._colors;
    }

    public equals(other: Colors): boolean {
        let thisColors = Object.entries(this._colors);
        return this == other || (
            thisColors.length == Object.keys(other._colors).length &&
            thisColors.map(([k, v]) => other._colors[k] === v)
                .reduce((prev, now) => prev && now, true)
        );
    }

    public keys(): string[] {
        return Object.keys(this._colors);
    }
}

export interface ColorSchemeInterface {
    readonly id: string;
    name: string;
    description: string;
    author: string;
    readonly colors: Colors;
    design: Design;
    current: boolean;
    preDefined: boolean;
}

export class ColorSchemeFragmentBuilder {
    private _name?: string;
    private _description?: string;
    private _author?: string;
    private _design?: Design;
    public readonly colors: ColorsBuilder = new ColorsBuilder();

    constructor(colorSchemeFragment?: ColorSchemeFragmentType) {
        if (colorSchemeFragment) {
            this.update(colorSchemeFragment);
        }
    }

    public name(name?: string): this {
        this._name = name;
        return this;
    }

    public description(description?: string): this {
        this._description = description;
        return this;
    }

    public author(author?: string): this {
        this._author = author;
        return this;
    }

    public design(design?: Design): this {
        this._design = design;
        return this;
    }

    public set(key: keyof ColorSchemeFragment, value?: ColorSchemeFragment[typeof key]): this {
        if (key == "colors") {
            this.colors.addColors(value as Colors);
        } else {
            // @ts-ignore
            this[key](value);
        }
        return this;
    }

    public update(other: ColorSchemeFragmentType): this {
        this._name = other.name ?? this._name;
        this._description = other.description ?? this._description;
        this._author = other.author ?? this._author;
        this._design = other.design ?? this._design;
        if (other.colors) {
            this.colors.addColors(other.colors);
        }
        return this;
    }

    public build(): ColorSchemeFragment {
        return new ColorSchemeFragment({
            name: this._name,
            description: this._description,
            author: this._author,
            design: this._design,
            colors: this.colors.build(),
        });
    }
}

export type ColorSchemeFragmentType = { [k in Exclude<keyof ColorSchemeInterface, "id" | "preDefined" | "current">]?: ColorSchemeInterface[k] };

export class ColorSchemeFragment implements ColorSchemeFragmentType {
    public readonly name?: string;
    public readonly description?: string;
    public readonly author?: string;
    public readonly design?: Design;
    public readonly colors?: Colors;

    public static readonly Builder = ColorSchemeFragmentBuilder;

    constructor(other: ColorSchemeFragmentType);
    constructor(other: ColorSchemeFragmentType) {
        const {name, description, author, design, colors} = other;
        this.name = name;
        this.description = description;
        this.author = author;
        this.design = design;
        this.colors = new Colors(colors);
    }

    public withName(name: string): ColorSchemeFragment {
        return new ColorSchemeFragment({...this, name: name});
    }

    public withDescription(description: string): ColorSchemeFragment {
        return new ColorSchemeFragment({...this, description: description});
    }

    public withAuthor(author: string): ColorSchemeFragment {
        return new ColorSchemeFragment({...this, author: author});
    }

    public withDesign(design: Design): ColorSchemeFragment {
        return new ColorSchemeFragment({...this, design: design});
    }

    public withColors(colors: Colors): ColorSchemeFragment {
        return new ColorSchemeFragment({...this, colors: colors});
    }

    public withUpdate(other: ColorSchemeFragmentType): ColorSchemeFragment {
        return new ColorSchemeFragment({...this, ...other});
    }
}

class ColorScheme implements ColorSchemeInterface {
    public readonly id: string;
    public readonly name: string;
    public readonly description: string;
    public readonly author: string;
    public readonly design: Design;
    public readonly colors: Colors;
    public current: boolean;
    public readonly preDefined: boolean;

    private readonly _service: ColorPickerService;

    public static readonly fields: Array<keyof ColorSchemeInterface> = ["id", "name", "description", "author", "design", "colors", "preDefined", "current"];

    /**
     * DON'T USE THIS CONSTRUCTOR!!!<br>
     * USE {@link ColorPickerService.getColorScheme} or {@link ColorPickerService.newColorScheme} instead<br>
     * This will insert (random) strings if you set null for {@link name} and / or {@link id}
     * @param {{[k in keyof ColorSchemeInterface]?: ColorSchemeInterface[k]}} other
     * @param {ColorPickerService} service
     */
    // public constructor(service: ColorPickerService | ColorSchemeInterface, id?: string, name?: string, description?: string, author?: string, design?: Designs, colors: ColorMap = new Map()) {
    public constructor(other: Partial<ColorSchemeInterface>, service: ColorPickerService) {
        this.id = other.id ?? service.generateId();
        this.name = other.name ?? service.generateName();
        this.description = other.description ?? "Very interesting description";
        this.author = other.author ?? "Author unknown";
        this.design = other.design ?? Designs.system;
        // colors = other colors; if other colors are not defined, fill with default colors
        this.colors = new Colors(service.getDefault().colors.withColors(other.colors));
        this.current = other.current ?? false;
        this.preDefined = other.preDefined ?? false;

        this._service = service;

        // add default colors if colors are not provided
        // if (service) {
        //     const defaultColors = service.getDefault().colors;
        //     for (let i of service.colorTypes) {
        //         if (this.colors.get(i) == null) {
        //             this.colors.set(i, defaultColors.get(i)!);
        //         }
        //     }
        // }


        // console.assert(service != null, "service is null");
        // if (service instanceof ColorPickerService) {
        //     this.id = id != null ? id : service.generateId();
        //     this.name = name != null ? name : service.generateName();
        //     this.description = description ?? "No Description";
        //     this.author = author != null ? author : "unknown";
        //     this.design = design ?? Designs.system;
        //     this.preDefined = false;
        //     for (let key of colors.keys()) {
        //         this.colors.set(key, colors.get(key) != null ? Color.toHex(colors.get(key)!) : "inherit");
        //     }
        //     service.all.set(this.id, this);
        // } else {
        //     for (let key of Object.keys(service)) {
        //         // console.log(key);
        //         // console.log(Object.getOwnPropertyDescriptor(service, key));
        //         // Object.defineProperty(this, key, Object.getOwnPropertyDescriptor(service, key));
        //         if (key as keyof ColorSchemeInterface == "colors") {
        //             for (let [k, v] of service.colors.entries()) {
        //                 this.colors.set(k, v);
        //             }
        //         } else {
        //             this[key as Exclude<keyof ColorSchemeInterface, "colors">] = service[key as keyof ColorSchemeInterface];
        //         }
        //     }
        // }
    }

    /**
     * Used for the {@link JSON.stringify} call
     * @return {ColorSchemeData}
     */
    public toJSON(): ColorSchemeData {
        // let res = new ColorSchemeData(this.id, this.name, this.description, this.author, this.current, this.design, this.preDefined, {});
        return new ColorSchemeData({
            id: this.id,
            name: this.name,
            description: this.description,
            author: this.author,
            design: this.design,
            colors: this.colors.toJSON(),
            preDefined: this.preDefined,
            current: this.current,
        });
    }

    /**
     * Used for the {@link JSON.stringify} call<br>
     * This is the dynamic but much worse readable variant
     * @deprecated
     * @return {ColorSchemeData}
     */

    /*
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
    */

    /**
     * Convert a json object (not a json string) to an object which defines the same <b>properties</b> as {@link ColorScheme}<br>
     * Then it calls the {@link ColorScheme} constructor and returns the {@link ColorScheme} object which defines also the functions, etc.<br>
     * Since the json could be incomplete we also need {@link service}
     * @param {ColorSchemeData} jsonColorScheme
     * @param {ColorPickerService} service
     * @returns {ColorScheme}
     */
    public static fromJSON(jsonColorScheme: ColorSchemeData, service: ColorPickerService): ColorScheme {
        let {colors, ...otherFields} = jsonColorScheme;
        return new ColorScheme(
            {
                colors: new Colors(colors),
                ...otherFields,
            },
            service
        )
    }

    /*
    This is the dynamic very bad to read version of this function
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
    */

    public withName(name: string): ColorScheme {
        return new ColorScheme({...this, name: name}, this._service);
    }

    public withAuthor(author: string): ColorScheme {
        return new ColorScheme({...this, author: author}, this._service);
    }

    public withDescription(description: string): ColorScheme {
        return new ColorScheme({...this, description: description}, this._service);
    }

    public withColors(colors: Colors): ColorScheme {
        return new ColorScheme({...this, colors: colors}, this._service);
    }

    public setCurrent(current: boolean): this {
        this.current = current;
        return this;
    }

    public withDesign(design: Design): ColorScheme {
        return new ColorScheme({...this, design: design}, this._service);
    }

    public withCurrent(current: boolean): ColorScheme {
        return new ColorScheme({...this, current: current}, this._service);
    }

    public withPreDefined(preDefined: boolean): ColorScheme {
        return new ColorScheme({...this, preDefined: preDefined}, this._service);
    }

    public equals(other: ColorScheme | null | undefined): boolean {
        return other != null && (this == other || (
            this.id == other.id &&
            this.name == other.name &&
            this.description == other.description &&
            this.author == other.author &&
            this.design == other.design &&
            this.colors.equals(other.colors) &&
            this.current == other.current &&
            this.preDefined == other.preDefined
        ));
    }

    /**
     * Returns a <b>new</b> color scheme <br>
     * Object on the right hand side will override these on the left side
     * @param {ColorSchemeFragment[]} others
     * @returns {ColorScheme}
     */
    public withUpdate(...others: ColorSchemeFragmentType[]): ColorScheme {
        let other: ColorSchemeFragmentBuilder = new ColorSchemeFragment.Builder(this);
        // others.reverse(); // reverse is in-place
        // others.push(this);
        for (let i of others) {
            other.update(i)
        }
        // for (let i of others) {
        //     for (let k of ColorScheme.fields) {
        //         if (other[k] === undefined) {
        //             let v1 = i[k];
        //             if (v1 !== undefined) {
        //                 // @ts-ignore
        //                 other[k] = v1;
        //             }
        //         }
        //     }
        // }
        return new ColorScheme(other.build(), this._service);
    }
}

/**
 * This converts an object of a type (like a Map) into an object.<br>
 * This can be useful e.g. if you want to convert something to json
 * @param input
 * @return {Object}
 */
function toObject(input: Object): any {
    // assertType<[Pair<string, number>]>(input, Pair);
    if (input instanceof Map) {
        return Object.fromEntries(input);
    } else {
        return input;
    }
}

class ColorPickerService {
    // private current: string;
    // #preDefined: boolean = false;

    private readonly _all: ColorSchemeMap = new Map<string, ColorScheme>();
    private readonly _colorTypes: Array<string> = [];
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
        // console.log("inti service", this._colorTypes, default1, default1.colors, [...default1.colors.keys()]);
        let all: { [index: number]: ColorSchemeData } = JSON.parse(window.localStorage.getItem("colors") ?? "{}");
        // let all = window.localStorage.getItem("colors") != null ? JSON.parse(window.localStorage.getItem("colors")) : {};
        for (let colorJson of Object.values(all)) {
            let color = ColorScheme.fromJSON(colorJson, this);
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
        if (!colorScheme.equals(this._all.get(colorScheme.id))) {
            throw "AUAUAUAUAUUA";
        }
        //write to body
        for (let [type, color] of colorScheme.colors.entries()) {
            document.body.style.setProperty(type, color);
        }
        document.body.classList.toggle("light-design", colorScheme.design === Designs.light);
        document.body.classList.toggle("dark-design", colorScheme.design === Designs.dark);
        document.body.classList.toggle("system-design", colorScheme.design === Designs.system);

        if (!colorScheme.current) {
            this._setColorScheme(colorScheme.withCurrent(true));
        }
        for (let i of this.all.values()) {
            if (i.id !== colorScheme.id) {
                if (i.current) {
                    this._setColorScheme(i.withCurrent(false));
                }
            }
        }
        this.save();
        this.trigger("activate", colorScheme);
    }

    /**
     * Returns the instance by the id given or null if the no item with the id was found
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

    private _setColorScheme(colorScheme: ColorScheme): void {
        this._all.set(colorScheme.id, colorScheme);
    }

    /**
     * Updates the colorScheme
     * @param {ColorScheme} colorScheme
     */
    public setColorScheme(colorScheme: ColorScheme): void {
        this._all.set(colorScheme.id, colorScheme);
        this.save();
    }

    public newColorScheme(other: { [k in Exclude<keyof ColorSchemeInterface, "id">]?: ColorSchemeInterface[k] }): ColorScheme {
        let newColorScheme = new ColorScheme(other, this);
        this._all.set(newColorScheme.id, newColorScheme);
        this.save();
        this.trigger("add", newColorScheme);
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
        const cssVars = new Colors.Builder();

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
                            cssVars.addColor(rule.style.item(k), rule.style.getPropertyValue(rule.style.item(k)));
                        }
                    }
                }
            } catch (error) {
            }
        }
        const colors = cssVars.build();
        console.log("cssVars", cssVars);
        if (colors.size <= 0) {
            console.warn("No colors / coloTypes found in stylesheet, default colorscheme won't have any colors");
        }
        return colors;
    };

    /**
     * This does <b>NOT</b> save the default object!!!
     * @return {ColorPickerService}
     * @param forceReload {boolean} whether it's forced to reload the default from the css stylesheet
     */
    public getDefault(forceReload: boolean = false): ColorScheme {
        let result = this._all.get("default");
        if (forceReload || result == null) {
            let colors: Colors = this.getCSSVariables(document.styleSheets, "farben.css");
            result = new ColorScheme({
                id: "default",
                name: "Default",
                description: "Default Color Scheme",
                author: "AG-Medien",
                design: Designs.system,
                colors: new Colors(colors),
                current: false,
                preDefined: true,
            }, this);
        }
        return result;
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

    // /**
    //  * should be used when the color input onChange fires
    //  * @param colorType {string}
    //  * @param newColor {string}
    //  * @deprecated
    //  */
    // public onChange(colorType: string, newColor: string) {
    //     let colorScheme = this.getCurrent();
    //     if (colorScheme.preDefined) {
    //         colorScheme = new ColorScheme(this, undefined, undefined, undefined, undefined, undefined, this.getCurrent().colors);
    //         console.log("hmm");
    //         console.log(colorScheme);
    //     }
    //
    //     colorScheme.colors.set(colorType, newColor);
    //     this.activate(colorScheme);
    //     this.save(colorScheme);
    // }

    public get all(): ColorSchemeMap {
        return this._all;
    }

    public get allList(): ColorScheme[] {
        return [...this._all.values()];
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

    public get colorTypes(): readonly string[] {
        return this._colorTypes;
    }

    /**
     * Returns the display name of a color type
     * @param colorType {string}
     * @returns {string}
     */
    public static getDisplayColorName(colorType: string): string {
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
export {toObject};