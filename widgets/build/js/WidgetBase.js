var FontWeight;
(function (FontWeight) {
    FontWeight["normal"] = "normal";
    FontWeight["bold"] = "bold";
    FontWeight["lighter"] = "lighter";
    FontWeight["bolder"] = "bolder";
})(FontWeight || (FontWeight = {}));
var FontSize;
(function (FontSize) {
    FontSize["xxSmall"] = "xx-small";
    FontSize["xSmall"] = "x-small";
    FontSize["small"] = "small";
    FontSize["medium"] = "medium";
    FontSize["large"] = "large";
    FontSize["xLarge"] = "x-large";
    FontSize["xxLarge"] = "xx-large";
    FontSize["smaller"] = "smaller";
    FontSize["larger"] = "larger";
})(FontSize || (FontSize = {}));
var FontFamily;
(function (FontFamily) {
    FontFamily["serif"] = "serif";
    FontFamily["sansSerif"] = "sans-serif";
    FontFamily["monospace"] = "monospace";
    FontFamily["cursive"] = "cursive";
    FontFamily["fantasy"] = "fantasy";
})(FontFamily || (FontFamily = {}));
class Font {
    setSize(size) {
        this._size = size;
        return this;
    }
    setWeight(weight) {
        this._weight = weight;
        return this;
    }
    setFamily(family) {
        this._family = family;
        return this;
    }
    get size() {
        return this._size;
    }
    get weight() {
        return this._weight;
    }
    get family() {
        return this._family;
    }
}
class Color {
    constructor(rgba) {
        this.value = 0x000000FF;
        this.set(rgba);
    }
    set(rgba) {
        if (rgba == null) {
            this.value = 0;
        }
        else if (typeof rgba == "number") {
            console.log("int color");
            this.value = rgba;
        }
        else if (typeof rgba == "string") {
            rgba = rgba.replace("#", "");
            if (new RegExp("[^0-9]").test(rgba)) {
                throw TypeError("A color string value should not contain any chars different from 0-9 or '#')");
            }
            this.value = Number.parseInt(rgba, 16);
        }
        else {
            this.value = (rgba[0] << 24) | (rgba[1] << 16) | (rgba[2] << 8) | rgba[3];
        }
    }
    hexString() {
        return "#" + this.r.toString(16).padStart(2, "0") + this.g.toString(16).padStart(2, "0")
            + this.b.toString(16).padStart(2, "0") + this.a.toString(16).padStart(2, "0");
    }
    get() {
        return this.value;
    }
    get r() {
        return (this.value >> 24) & 0xFF;
    }
    set r(r) {
        this.value = (this.value & 0x00FFFFFF) | (r << 24);
    }
    get g() {
        return (this.value >> 16) & 0xFF;
    }
    set g(r) {
        this.value = (this.value & 0xFF00FFFF) | (r << 16);
    }
    get b() {
        return (this.value >> 8) & 0xFF;
    }
    set b(r) {
        this.value = (this.value & 0xFFFF00FF) | (r << 8);
    }
    get a() {
        return this.value & 0xFF;
    }
    set a(r) {
        this.value = (this.value & 0xFFFFFF00) | (r);
    }
}
class CSSColorValue {
    constructor() {
        this.color = new Color();
        this._type = "null";
    }
    get() {
        switch (this._type) {
            case "null":
                return null;
            case "color":
                return this.color.hexString();
            case "string":
                return this.colorString;
        }
    }
    set(value) {
        if (value == null) {
            this._type = "null";
        }
        else {
            try {
                this.color.set(value);
                this._type = "color";
            }
            catch (e) {
                this.colorString = value;
                this._type = "string";
            }
        }
        return this;
    }
    getColor() {
        return this._type === "color" ? this.color : null;
    }
    get type() {
        return this._type;
    }
}
export { FontWeight, FontSize, FontFamily, Font, Color, CSSColorValue };
