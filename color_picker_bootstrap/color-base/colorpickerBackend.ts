import {ColorsBuilder, ColorSchemeBuilder, ColorSchemeFragmentBuilder} from "./Builder";
import ColorPickerService from "./ColorPickerService";

export type Design = "light" | "dark" | "system";

export const Designs: { [k in Design]: k } & { all: () => Design[], __all?: Design[] } = {
    light: "light",
    dark: "dark",
    system: "system",
    all: () => {
        if (Designs.__all != null) {
            return Designs.__all;
        } else {
            let all = Object.keys(Designs);
            all.splice(all.indexOf("all"), 1);
            return (Designs.__all = all as Design[]);
        }
    },
};

/** Type for the raw color scheme data saved in the local storage */
export type ColorSchemeData = Omit<ColorSchemeInterface, "colors"> & Record<"colors", Record<string, string>>;

// export type ColorSchemeType =
//     { id: ColorSchemeInterface["id"], name: ColorSchemeInterface["name"] }
//     & { [k in Exclude<keyof ColorSchemeInterface, "id" | "name">]?: ColorSchemeInterface[k] };
export type ColorSchemeTypeOptional = { [k in keyof ColorSchemeInterface]?: ColorSchemeInterface[k] };

export type Color = string;
export type ColorsType = Record<string, Color>;

export class Colors {
    public static readonly Builder = ColorsBuilder;

    private readonly _colors: ColorsType;
    private readonly _size: number;

    constructor(colors?: Colors | ColorsType | { [k: string]: string }) {
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

    public get size(): number {
        return this._size;
    }

    public withColor(colorId: string, colorValue: Color): Colors {
        return new Colors({...this, [colorId]: colorValue});
    }

    public withColors(colors?: Colors | ColorsType): Colors {
        return new Colors(colors ? {...this._colors, ...(colors instanceof Colors ? colors._colors : colors)} : this);
    }

    public withUpdate(colors?: Parameters<Colors["withColors"]>[0]): Colors {
        return this.withColors(colors);
    }

    public get(colorId: string): Color | undefined {
        return this._colors[colorId];
    }

    public entries(): [string, Color][] {
        return Object.entries(this._colors);
    }

    public colors(): Readonly<ColorsType> {
        return this._colors;
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
    public static readonly Builder = ColorSchemeBuilder;

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
        this.colors = new Colors(other.colors?.size ?? 0 >= service.colorTypes.length ? other.colors : service.getDefault().colors.withColors(other.colors));
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
     */
    public toJSON(): ColorSchemeInterface {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            author: this.author,
            design: this.design,
            colors: this.colors,
            preDefined: this.preDefined,
            current: this.current,
        };
    }

    /**
     * Convert a json object (not a json string) to an object which defines the same <b>properties</b> as {@link ColorScheme}<br>
     * Then it calls the {@link ColorScheme} constructor and returns the {@link ColorScheme} object which defines also the functions, etc.<br>
     * Since the json could be incomplete we also need {@link service}
     * @param jsonColorScheme
     * @param service
     */
    public static fromJSON(jsonColorScheme: ColorSchemeData, service: ColorPickerService): ColorScheme {
        let {colors, ...otherFields} = jsonColorScheme;
        return new ColorScheme(
            {
                colors: new Colors(colors),
                ...otherFields,
            },
            service,
        );
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
        if (this.current == current) {
            return this;
        } else {
            return new ColorScheme({...this, current: current}, this._service);
        }
    }

    public withPreDefined(preDefined: boolean): ColorScheme {
        if (this.preDefined == preDefined) {
            return this;
        } else {
            return new ColorScheme({...this, preDefined: preDefined}, this._service);
        }
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
        let other: ColorSchemeBuilder = new ColorSchemeBuilder(this._service, this);
        // others.reverse(); // reverse is in-place
        // others.push(this);
        for (let i of others) {
            other.update(i);
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
        if (!other.equals(this)) {
            return new ColorScheme(other.build(), this._service);
        } else {
            return this;
        }
    }
}

export {ColorScheme};
