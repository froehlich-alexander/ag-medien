import {ColorScheme} from "./color-base/colorpickerBackend";
import {ColorSchemeFileInfo} from "./dialogs/Import";

export class ColorSchemeDuplicate extends Error {
    public readonly colorScheme: ColorSchemeFileInfo;

    constructor(cs: ColorSchemeFileInfo) {
        super();
        this.colorScheme = cs;
    }
}