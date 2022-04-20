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
    constructor() {
        Object.defineProperty(this, "_size", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_weight", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_family", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
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
        Object.defineProperty(this, "value", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0x000000FF
        }); //a = 255
        this.set(rgba);
    }
    static toHex(value, g, b, a) {
        var _a, _b;
        if (typeof value === "string") {
            if (value.startsWith("#")) {
                return value;
            }
            else if (value.startsWith("rgb")) {
                value = value.replaceAll(/[();\s]/g, "")
                    .replace(/rgba?/g, "");
                console.log("replaced color string", value);
                let rgba = value.split(",").map(v => Number.parseFloat(v));
                return this.toHex(rgba[0], rgba[1], rgba[2], (_a = rgba[3] * 255) !== null && _a !== void 0 ? _a : undefined);
            }
            return value;
        }
        if (g === undefined) {
            return "#" + value.toString(16);
        }
        return (_b = "#" + value.toString(16).padStart(2, "0") + g.toString(16) + b.toString(16) + (a === null || a === void 0 ? void 0 : a.toString(16))) !== null && _b !== void 0 ? _b : "";
    }
    set(rgba) {
        var _a;
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
            this.value = (rgba[0] << 24) | (rgba[1] << 16) | (rgba[2] << 8) | ((_a = rgba[3]) !== null && _a !== void 0 ? _a : 0);
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
        Object.defineProperty(this, "color", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Color()
        });
        Object.defineProperty(this, "_type", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "null"
        });
        Object.defineProperty(this, "colorString", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
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
//# sourceMappingURL=WidgetBase.js.map