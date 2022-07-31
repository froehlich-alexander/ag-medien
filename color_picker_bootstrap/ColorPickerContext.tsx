import React from "react";

const ColorPickerContext = React.createContext<ColorPickerContextType>({} as ColorPickerContextType);

export interface ColorPickerContextType {
    toggleNewDialogVisibility: (visibility: boolean) => void,
    toggleImportDialogVisibility: (visibility: boolean) => void,
    toggleExportDialogVisibility: (visibility: boolean) => void,
}

export default ColorPickerContext;