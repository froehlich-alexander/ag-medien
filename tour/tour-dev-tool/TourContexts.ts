import {createContext} from "react";
import {FileData, InlineObjectData, PageData} from "../Data";
import {UnFlatArray} from "./utils";

export interface PageContextType {
    pages: PageData[],
    currentPage: PageData | undefined,

    setCurrentPage: (page: string | undefined) => void,
    addPages: (...pages: UnFlatArray<PageData>) => void,
    updatePages: (...pages: UnFlatArray<PageData>) => void,
    removePages: (...pages: UnFlatArray<string | PageData>) => void,
    resetPages: (...pages: UnFlatArray<PageData>) => void;
    replacePages: (...pages: Array<[string, PageData]>) => void,
}

export interface MediaContextType {
    mediaFiles: Readonly<FileData[]>,
    addMediaFiles: (...files: UnFlatArray<FileData>) => void,
    updateMediaFiles: (...files: UnFlatArray<FileData>) => void,
    removeMediaFiles: (...files: UnFlatArray<string | FileData>) => void,
    resetMediaFiles: (...files: UnFlatArray<FileData>) => void,
    replaceMediaFiles: (...files: Array<[string, FileData]>) => void,
}

// export interface DialogContextType {
//     mediaDialogVisibility: boolean,
//     setMediaDialogVisibility: (vis: boolean) => void,
//     showMediaDialog: () => void,
//
//     unsavedChangesAlertVisibility: boolean,
//     setUnsavedChangesAlertVisibility: (vis: boolean) => void,
//     showUnsavedChangesAlert: () => void;
//
//     mediaPreviewDialogVisibility: boolean,
//     setMediaPreviewDialogVisibility: (vis: boolean) => void,
//     showMediaPreviewDialog: () => void,
//
//     tourPagePreviewDialogVisibility: boolean,
//     setTourPagePreviewDialogVisibility: (vis: boolean) => void,
//     showTourPagePreviewDialog: () => void,
// }

export interface TemplateContextType {
    inlineObject: InlineObjectData,
    setInlineObject: (inlineObject: InlineObjectData) => void,
}

export interface FormContextType {
    page: PageData | undefined,
    save: () => void,
    reset: () => void,
    isModified: boolean,
    renamePageIdUsages: boolean,
}

export interface ListViewContextType {
    requestSetCurrentPage: (id: string | undefined) => void,
    schedulesCurrentPage: string | undefined | null,
}

// export const DialogContext = createContext<DialogContextType>({} as DialogContextType);
export const MediaContext = createContext<MediaContextType>({} as MediaContextType);
export const PageContext = createContext<PageContextType>({} as PageContextType);
export const TemplateContext = createContext<TemplateContextType>({} as TemplateContextType);
export const FormContext = createContext<FormContextType>({} as FormContextType);
export const ListViewContext = createContext<ListViewContextType>({} as ListViewContextType);
