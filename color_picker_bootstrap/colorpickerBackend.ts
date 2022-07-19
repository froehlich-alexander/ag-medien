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

class ColorSchemeInterface {
    public id: string;
    public name: string;
    public description: string;
    public author: string;
    public readonly colors: ColorMap = new ColorMap();
    public design: Design = Designs.system;
    public current: boolean = false;
    public preDefined: boolean = false;

    public static readonly fields: Array<keyof ColorSchemeInterface> = ["id", "name", "description", "author", "design", "colors", "preDefined", "current"];

    constructor(other: ColorSchemeType) {
        this.id = other.id;
        this.name = other.name;
        this.description = other.description ?? "Very interesting description";
        this.author = other.author ?? "Author unknown";
        this.design = other.design ?? Designs.system;
        this.current = other.current ?? false;
        this.preDefined = other.preDefined ?? false;
        if (other.colors) {
            for (let [k, v] of other.colors.entries()) {
                this.colors.set(k, v);
            }
        }
    }
}

class ColorScheme extends ColorSchemeInterface {
    declare public readonly id: string;

    // constructor(service: ColorPickerService, id?: string, name?: string, description?: string, author?: string, design?: Designs, colors?: ColorMap);
    constructor(data: ColorSchemeType);
    constructor(data: ColorSchemeDataTypeOptional, service: ColorPickerService);

    /**
     * DON'T USE THIS CONSTRUCTOR!!!<br>
     * USE {@link ColorPickerService.getColorScheme} or {@link ColorPickerService.newColorScheme} instead<br>
     * This will insert (random) strings if you set null for {@link name} and / or {@link id}
     * @param {{[k in keyof ColorSchemeInterface]?: ColorSchemeInterface[k]}} data
     * @param {ColorPickerService} service
     */
    // public constructor(service: ColorPickerService | ColorSchemeInterface, id?: string, name?: string, description?: string, author?: string, design?: Designs, colors: ColorMap = new Map()) {
    public constructor(data: ColorSchemeDataTypeOptional, service?: ColorPickerService) {
        super(service ? {
            id: data.id ?? service.generateId(),
            name: data.name ?? service.generateName(),
            description: data.description,
            author: data.author,
            design: data.design,
            colors: data.colors,
            current: data.current,
            preDefined: data.preDefined,
        } : data as ColorSchemeType);


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
        let res = new ColorSchemeData({
            id: this.id,
            name: this.name,
            description: this.description,
            author: this.author,
            design: this.design,
            colors: {},
            preDefined: this.preDefined,
            current: this.current,
        });

        // colors
        for (let [k, v] of this.colors.entries()) {
            res.colors![k] = v;
        }
        return res;
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
     * Then it calls the {@link ColorScheme} constructor and returns the {@link ColorScheme} object which defines also the functions, etc.
     * @param {Object} jsonColorScheme
     * @return {Object}
     */
    public static fromJSON(jsonColorScheme: ColorSchemeData): ColorScheme {
        return new ColorScheme(
            {
                id: jsonColorScheme.id,
                name: jsonColorScheme.name,
                description: jsonColorScheme.description,
                author: jsonColorScheme.author,
                design: jsonColorScheme.design,
                colors: new ColorMap(),
                current: jsonColorScheme.current,
                preDefined: jsonColorScheme.preDefined,
            } as ColorSchemeInterface
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

    /**
     * Copies this colorScheme into {@link colorScheme}<br>
     * Creates a new colorScheme if {@link colorScheme} is empty<br>
     * If {@link colorScheme} is present, {@link ColorScheme.id} will <b>not</b> be copied!
     * @param {ColorScheme} colorScheme
     * @returns {ColorScheme} {@link colorScheme}
     */
    public copy(colorScheme?: ColorScheme): ColorScheme {
        if (colorScheme === undefined) {
            return new ColorScheme(this);
        }
        return colorScheme
            .setName(this.name)
            .setDescription(this.description)
            .setAuthor(this.author)
            .setDesign(this.design)
            .setColors(this.colors)
            .setCurrent(this.current)
            .setPreDefined(this.preDefined);
    }

    // public get name(): string {
    //     return this._name!;
    // }

    public setName(name: string): this {
        this.name = name;
        return this;
    }

    // public get author(): string {
    //     return this._author!;
    // }

    public setAuthor(author: string): this {
        this.author = author;
        return this;
    }

    // public get description(): string {
    //     return this._description!;
    // }

    public setDescription(description: string): this {
        this.description = description;
        return this;
    }

    // public get id(): string {
    //     return this._id;
    // }
    //
    // public get colors(): ColorMap {
    //     return this._colors;
    // }

    public setColors(colors: ColorMap): this {
        for (let [k, v] of colors) {
            this.colors.set(k, v);
        }
        return this;
    }

    // public get current(): boolean {
    //     return this._current;
    // }

    public setCurrent(current: boolean): this {
        this.current = current;
        return this;
    }

    // public get preDefined(): boolean {
    //     return this._preDefined;
    // }

    public setPreDefined(preDefined: boolean): this {
        this.preDefined = preDefined;
        return this;
    }

    // public get design(): Designs {
    //     return this._design;
    // }

    public setDesign(design: Design): this {
        this.design = design;
        return this;
    }

    public setColor(colorId: string, value: string): this {
        this.colors.set(colorId, value);
        return this;
    }

    public equals(other: ColorScheme): boolean {
        return this == other || (
            this.id == other.id &&
            this.name == other.name &&
            this.description == other.description &&
            this.author == other.author &&
            this.design == other.design &&
            [...this.colors.entries()]
                .map(([k, v]) => v === other.colors.get(k))
                .reduce((b, b1) => b && b1, true) &&
            this.current == other.current &&
            this.preDefined == other.preDefined
        );
    }

    /**
     * Returns a <b>new</b> color scheme
     * @param {ColorSchemeDataTypeOptional} others
     * @returns {ColorScheme}
     */
    public withUpdate(...others: ColorSchemeDataTypeOptional[]): ColorScheme {
        let other: ColorSchemeDataTypeOptional = {};
        others.push(this);
        for (let i of others.reverse()) {
            for (let k of ColorSchemeInterface.fields) {
                if (other[k] === undefined) {
                    let v1 = i[k];
                    if (v1 !== undefined) {
                        // @ts-ignore
                        other[k] = v1;
                    }
                }
            }
        }
        return new ColorScheme(other as ColorSchemeType);
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
        document.body.classList.toggle("light-design", colorScheme.design === Designs.light);
        document.body.classList.toggle("dark-design", colorScheme.design === Designs.dark);
        document.body.classList.toggle("system-design", colorScheme.design === Designs.system);

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
        console.log("cssVars", cssVars);
        if (cssVars.size <= 0) {
            console.warn("No colors / coloTypes found in stylesheet, default colorscheme won't have any colors");
        }
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
            result = new ColorScheme({
                id: "default",
                name: "Default",
                description: "Default Color Scheme",
                author: "AG-Medien",
                design: Designs.system,
                colors: colors,
                current: false,
                preDefined: true,
            });
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