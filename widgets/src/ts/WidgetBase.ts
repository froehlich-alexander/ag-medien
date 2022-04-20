enum FontWeight {
    normal = "normal",
    bold = "bold",
    lighter = "lighter",
    bolder = "bolder"
}

enum FontSize {
    xxSmall = "xx-small",
    xSmall = "x-small",
    small = "small",
    medium = "medium",
    large = "large",
    xLarge = "x-large",
    xxLarge = "xx-large",

    smaller = "smaller",
    larger = "larger",
}

enum FontFamily {
    serif = "serif",
    sansSerif = "sans-serif",
    monospace = "monospace",
    cursive = "cursive",
    fantasy = "fantasy"
}

class Font {
    private _size?: string;
    private _weight?: string;
    private _family?: string;

    public setSize(size: string): this {
        this._size = size;
        return this;
    }

    public setWeight(weight: string): this {
        this._weight = weight;
        return this;
    }

    public setFamily(family: string): this {
        this._family = family;
        return this;
    }


    public get size(): string | undefined {
        return this._size;
    }

    public get weight(): string | undefined {
        return this._weight;
    }

    public get family(): string | undefined {
        return this._family;
    }
}

class Color {
    private value: number = 0x000000FF; //a = 255

    constructor(rgba?: number | [number, number, number, number?] | string) {
        this.set(rgba);
    }

    public static toHex(r: number, g: number, b: number, a?: number): string;
    public static toHex(rgba: number | string): string;
    public static toHex(value: number | string, g?: number, b?: number, a?: number): string {
        if (typeof value === "string") {
            if (value.startsWith("#")) {
                return value;
            } else if (value.startsWith("rgb")) {
                value = value.replaceAll(/[();\s]/g, "")
                    .replace(/rgba?/g, "");
                console.log("replaced color string", value);
                let rgba = value.split(",").map(v => Number.parseFloat(v) / (v.endsWith("%") ? 100 : 1));
                return this.toHex(rgba[0], rgba[1], rgba[2], Math.floor(rgba[3] * 255));
            }
            return value;
        }
        if (g === undefined) {
            return "#" + value.toString(16);
        }
        console.log("a", a);
        let s = "#" + value.toString(16).padStart(2, "0") + g.toString(16).padStart(2, "0") + b!.toString(16).padStart(2, "0") + ((Number.isNaN(a) ? undefined : a)?.toString(16).padStart(2, "0") ?? "");
        console.debug(s);
        return s;
    }

    public set(rgba?: number | [number, number, number, number?] | string) {
        if (rgba == null) {
            this.value = 0;
        } else if (typeof rgba == "number") {
            console.log("int color");
            this.value = rgba;
        } else if (typeof rgba == "string") {
            rgba = rgba.replace("#", "");
            if (new RegExp("[^0-9]").test(rgba)) {
                throw TypeError("A color string value should not contain any chars different from 0-9 or '#')");
            }
            this.value = Number.parseInt(rgba, 16);
        } else {
            this.value = (rgba[0] << 24) | (rgba[1] << 16) | (rgba[2] << 8) | (rgba[3] ?? 0);
        }
    }

    public hexString(includeA: boolean = true): string {
        return "#" + this.r.toString(16).padStart(2, "0") + this.g.toString(16).padStart(2, "0")
        + this.b.toString(16).padStart(2, "0") + includeA ? this.a.toString(16).padStart(2, "0") : "";
    }

    public get(): number {
        return this.value;
    }

    get r() {
        return (this.value >> 24) & 0xFF;
    }

    set r(r: number) {
        this.value = (this.value & 0x00FFFFFF) | (r << 24);
    }

    get g() {
        return (this.value >> 16) & 0xFF;
    }

    set g(r: number) {
        this.value = (this.value & 0xFF00FFFF) | (r << 16);
    }

    get b() {
        return (this.value >> 8) & 0xFF;
    }

    set b(r: number) {
        this.value = (this.value & 0xFFFF00FF) | (r << 8);
    }

    get a() {
        return this.value & 0xFF;
    }

    set a(r: number) {
        this.value = (this.value & 0xFFFFFF00) | (r);
    }
}

class CSSColorValue {
    private readonly color: Color = new Color();
    private _type: "color" | "string" | "null" = "null";
    private colorString?: string;

    public get(): string | null {
        switch (this._type) {
            case "null":
                return null;
            case "color":
                return this.color.hexString();
            case "string":
                return this.colorString!;
        }
    }

    public set(value: string) {
        if (value == null) {
            this._type = "null";
        } else {
            try {
                this.color.set(value);
                this._type = "color";
            } catch (e) {
                this.colorString = value;
                this._type = "string";
            }
        }
        return this;
    }

    public getColor(): Color | null {
        return this._type === "color" ? this.color : null;
    }

    public get type(): "color" | "string" | "null" {
        return this._type;
    }
}

export {FontWeight, FontSize, FontFamily, Font, Color, CSSColorValue};