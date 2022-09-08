import {createContext} from "react";
import {FileData, InlineObjectData, PageData, SchulTourConfigFile} from "../Data";
import {UnFlatArray} from "./utils";

export interface PageContextType {
    currentPage: PageData | undefined,
    setCurrentPage: (page: string | undefined) => void,

    tourConfig: SchulTourConfigFile | undefined,
    setTourConfig: (config: SchulTourConfigFile) => void,

    pages: readonly PageData[],
    addPages: (...pages: UnFlatArray<PageData, 2, true, true>) => void,
    updatePages: (...pages: UnFlatArray<PageData, 2, true, true>) => void,
    removePages: (...pages: UnFlatArray<string | PageData, 2, true, true>) => void,
    resetPages: (...pages: UnFlatArray<PageData, 2, true, true>) => void,
    replacePages: (...pages: Readonly<Array<[string, PageData]>>) => void,
}

export interface MediaContextType {
    mediaFiles: readonly FileData[],
    addMediaFiles: (...files: UnFlatArray<FileData, 2, true, true>) => void,
    updateMediaFiles: (...files: UnFlatArray<FileData, 2, true, true>) => void,
    removeMediaFiles: (...files: UnFlatArray<string | FileData, 2, true, true>) => void,
    resetMediaFiles: (...files: UnFlatArray<FileData, 2, true, true>) => void,
    replaceMediaFiles: (...files: Readonly<Array<[string, FileData]>>) => void,
}

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

export interface TourPreviewContextType {
    pages: readonly PageData[],
    save: () => void,
    update: (page: PageData) => void,
    reset: ()=>void,
}

// export const DialogContext = createContext<DialogContextType>({} as DialogContextType);
export const MediaContext = createContext<MediaContextType>({} as MediaContextType);
export const PageContext = createContext<PageContextType>({} as PageContextType);
export const TemplateContext = createContext<TemplateContextType>({} as TemplateContextType);
export const FormContext = createContext<FormContextType>({} as FormContextType);
export const ListViewContext = createContext<ListViewContextType>({} as ListViewContextType);
export const TourPreviewContext = createContext<TourPreviewContextType>({} as TourPreviewContextType);
