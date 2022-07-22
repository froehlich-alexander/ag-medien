import {
    Color,
    Colors,
    ColorScheme,
    ColorSchemeFragment,
    ColorSchemeFragmentType,
    ColorSchemeInterface,
    ColorSchemeTypeOptional, ColorsType,
    Design,
} from "./colorpickerBackend";
import ColorPickerService from "./ColorPickerService";

abstract class Builder<T, TType = { [k in keyof T]: T[k] }> {
    declare public static readonly FIELDS: string[];

    public abstract build(): T;

    /**
     * Merges this with {@link other} if {@link other} !== undefined, otherwise it does nothing
     * @param other
     */
    public update(other?: TType): this {
        if (other !== undefined) {
            for (let k of (this.constructor as typeof Builder).FIELDS) {
                this.set(k as keyof TType, other[k as keyof TType]);
            }
        }
        return this;
    }

    /**
     * Set a key value pair
     * @param key
     * @param value
     */
    public set(key: keyof TType, value: TType[typeof key]): this {
        console.log("builder set", key, value);
        // @ts-ignore
        this[key](value);
        return this;
    }

    /**
     * Resets a specific field on this builder or the whole builder if no key is specified
     * @param key
     */
    public reset(key?: keyof TType): this {
        if (key !== undefined) {
            // @ts-ignore
            this["_" + key] = undefined;
        } else {
            for (let i of (this.constructor as typeof Builder).FIELDS) {
                // @ts-ignore
                this["_" + i] = undefined;
            }
        }
        return this;
    }

    public equals(other: T | this): boolean {
        if (this == other) {
            return true;
        }
        let prefix = "";
        let isBuilder = false;
        if (other instanceof Builder) {
            prefix = "_";
            isBuilder = true;
        }
        return (this.constructor as typeof Builder).FIELDS.map(v =>
            // @ts-ignore
            this["_" + v].equals?.(other[prefix + v]) ?? (this["_" + v] == other[prefix + v] || (!isBuilder && this["_" + v] === undefined)))
            .reduce((p, n) => p && n, true);
    }
}

export class ColorsBuilder extends Builder<Colors, ColorsType> {
    public static readonly FIELDS = [];

    private _colors: ColorsType = {};
    private _size: number = 0;

    constructor(other?: Colors | ColorsType) {
        super();
        this.update(other);
    }

    public color(colorId: string, value: string) {
        return this.set(colorId, value);
    }

    public set(colorId: keyof ColorsType, value: ColorsType[typeof colorId]): this {
        console.log("colors builder set called", colorId, value);
        this._colors[colorId] = value;
        if (!(colorId in this._colors)) {
            this._size++;
        }
        return this;
    }

    public update(other?: ColorsType | Colors): this {
        if (other !== undefined) {
            Object.assign(this._colors, other instanceof Colors ? other.colors : other);
            console.log("update colros builder", other, this._colors);
            this._size = Object.keys(this._colors).length;
        }
        return this;

    }

    public override reset(colorsId?: keyof ColorsType): this {
        if (colorsId !== undefined) {
            if (colorsId in this._colors) {
                this._size--;
            }
            delete this._colors[colorsId];
        } else {
            this._colors = {};
            this._size = 0;
        }
        return this;
    }

    public build(): Colors {
        let colors = new Colors(this._colors);
        console.log("build colors", this._colors, colors);
        return colors;
    }

    public equals(other: ColorsBuilder | Colors): boolean {
        if (this === other) {
            return true;
        }
        if (other instanceof ColorsBuilder) {
            // real equal
            return this._size == other._size && Object.entries(other._colors).map(([k, v]) =>
                this._colors[k] == v)
                .reduce((prev, now) => prev && now, true);
        } else {
            // all colors in this must be equal or undefined
            return other.size >= this._size && other.entries().map(([k, v]) =>
                this._colors[k] == v || this._colors[k] === undefined)
                .reduce((prev, now) => prev && now, true);
        }
    }

    public get size() {
        return this._size;
    }
}

type ColorSchemeLikeBuilderType<T extends ColorScheme | ColorSchemeFragment, T1 extends ColorSchemeFragmentType> = {
    [k in keyof ColorSchemeFragmentType]:
    (value?: ColorSchemeFragmentType[k]) => ColorSchemeLikeBuilder<T, T1>
};

abstract class ColorSchemeLikeBuilder<T extends ColorSchemeFragment | ColorScheme, TType extends ColorSchemeFragmentType = ColorSchemeFragmentType>
    extends Builder<T, TType> implements ColorSchemeLikeBuilderType<T, TType> {

    protected _name?: string;
    protected _description?: string;
    protected _author?: string;
    protected _design?: Design;
    protected readonly _colors: ColorsBuilder = new ColorsBuilder();

    public static readonly FIELDS: (keyof ColorSchemeFragmentType)[] = [
        "name",
        "description",
        "author",
        "design",
        "colors",
    ];

    public color(colorId: string, value: Color): this {
        this._colors.color(colorId, value);
        return this;
    }

    public resetColor(colorId: string): this {
        this._colors.reset(colorId);
        return this;
    }

    public reset(key?: keyof TType): this {
        if (key === undefined) {
            this._colors.reset();
            for (let i of (this.constructor as typeof ColorSchemeLikeBuilder).FIELDS) {
                if (i == "colors") {
                    continue;
                }
                // @ts-ignore
                this["_" + i] = undefined;
            }
        } else if (key == "colors") {
            this._colors.reset();
        } else {
            super.reset(key);
        }
        return this;
    }

    public name(name?: string): this {
        if (name !== undefined) {
            this._name = name;
        }
        return this;
    }

    public description(description?: string): this {
        if (description !== undefined) {
            this._description = description;
        }
        return this;
    }

    public author(author?: string): this {
        if (author !== undefined) {
            this._author = author;
        }
        return this;
    }

    public design(design?: Design): this {
        if (design !== undefined) {
            this._design = design;
        }
        return this;
    }

    public colors(colors?: Colors): this {
        this._colors.update(colors);
        return this;
    }
}

export class ColorSchemeFragmentBuilder extends ColorSchemeLikeBuilder<ColorSchemeFragment> {
    public static readonly FIELDS: (keyof ColorSchemeFragmentType)[] = [
        ...ColorSchemeLikeBuilder.FIELDS,
    ];

    constructor(colorSchemeFragment?: ColorSchemeFragmentType) {
        super();
        if (colorSchemeFragment) {
            this.update(colorSchemeFragment);
        }
    }

    public build(): ColorSchemeFragment {
        return new ColorSchemeFragment({
            name: this._name,
            description: this._description,
            author: this._author,
            design: this._design,
            colors: this._colors.build(),
        });
    }
}

type ColorSchemeBuilderType = { -readonly [k in keyof ColorSchemeInterface]: (value?: ColorSchemeInterface[k]) => ColorSchemeBuilder };

// @ts-ignore
export class ColorSchemeBuilder extends ColorSchemeLikeBuilder<ColorScheme, ColorSchemeTypeOptional> implements ColorSchemeBuilderType {
    public static readonly FIELDS: (keyof ColorSchemeInterface)[] = [
        ...ColorSchemeLikeBuilder.FIELDS,
        "id",
        "current",
        "preDefined",
    ];

    protected _id?: string;
    protected _preDefined?: boolean;
    protected _current?: boolean;
    private readonly _service: ColorPickerService;

    constructor(service: ColorPickerService, other?: ColorSchemeTypeOptional) {
        super();
        this._service = service;
        if (other) {
            this.update(other);
        }
    }

    public build(): ColorScheme {
        return new ColorScheme({
            id: this._id,
            name: this._name,
            description: this._description,
            author: this._author,
            design: this._design,
            colors: this._colors.build(),
            current: this._current,
            preDefined: this._preDefined,
        }, this._service);
    }

    public id(id?: string): this {
        if (id !== undefined) {
            this._id = id;
        }
        return this;
    }

    public current(current?: boolean): this {
        if (current !== undefined) {
            this._current = current;
        }
        return this;
    }

    public preDefined(preDefined?: boolean): this {
        if (preDefined !== undefined) {
            this._preDefined = preDefined;
        }
        return this;
    }

    // public equals(other: ColorSchemeBuilder | ColorScheme): boolean {
    //     if (other == this) {
    //         return true;
    //     }
    //     if (other instanceof ColorSchemeBuilder) {
    //         return this._id == other._id &&
    //             this._name == other._name &&
    //             this._description == other._description &&
    //             this._author == other._author &&
    //             this._design == other._design &&
    //             this._colors.equals(other._colors) &&
    //             this._preDefined == other._preDefined &&
    //             this._current == other._current;
    //     } else {
    //         return (this._id === undefined || other.id) &&
    //             (this._description === undefined || other.description) &&
    //             (this._author === undefined || other.author) &&
    //             (this._description === undefined || other.design) &&
    //             (this._colors.equals(other.colors)) &&
    //             (this._preDefined === undefined || other.preDefined) &&
    //             (this._current === undefined || other.current);
    //     }
    // }
}