import {
    Colors,
    ColorScheme,
    ColorSchemeData,
    ColorSchemeFragment, ColorSchemeFragmentType,
    ColorSchemeInterface,
    Designs,
} from "./colorpickerBackend";

type ColorSchemeMap = Map<string, ColorScheme>;

/**
 * This converts an object of a type (like a {@link Map}) into an object.<br>
 * This can be useful e.g. if you want to convert something to json
 * @param input
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

    private _setColorScheme(colorScheme: ColorScheme): ColorScheme {
        this._all.set(colorScheme.id, colorScheme);
        return colorScheme;
    }

    /**
     * Updates the colorScheme, but <b>does not</b> update these fields: {@link ColorScheme.current} and {@link ColorScheme.preDefined} <br>
     * This method is <b>not</b> intended to be used from inside {@link ColorPickerService}.<br>
     * It should only be used from outside
     * @param {ColorScheme} colorScheme
     */
    public setColorScheme(colorScheme: ColorScheme): ColorScheme {
        const prev = this._all.get(colorScheme.id);
        let res;
        if (prev) {
            res = this._setColorScheme(prev.withUpdate(new ColorSchemeFragment(colorScheme)));
        } else {
            res = this._setColorScheme(colorScheme
                .withPreDefined(false)
                .withCurrent(false));
            this.trigger("add", res);
        }
        this.save();
        return res;
    }

    public newColorScheme(other: ColorSchemeFragmentType): ColorScheme {
        return this.setColorScheme(new ColorScheme(other, this));
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
                            cssVars.color(rule.style.item(k), rule.style.getPropertyValue(rule.style.item(k)));
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
                    this.trigger("delete", deletingColorScheme);
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

export default ColorPickerService;
export {toObject};