import {createContext} from "react";
import {FileData, PageData} from "../js/Data";
import {UnFlatArray} from "./utils";

export interface TourContextType {
    pages: PageData[],
    currentPage?: PageData,
    importDialogVisibility: boolean,
    mediaDialogVisibility: boolean,

    setCurrentPage: (page: string) => void,
    addPages: (...pages: UnFlatArray<PageData>) => void,
    updatePages: (...pages: UnFlatArray<PageData>) => void,
    removePages: (...pages: UnFlatArray<string | PageData>) => void,
    resetPages: (...pages: UnFlatArray<PageData>) => void;

    mediaFiles: Readonly<FileData[]>,
    addMediaFiles: (...files: UnFlatArray<FileData>) => void,
    updateMediaFiles: (...files: UnFlatArray<FileData>) => void,
    removeMediaFiles: (...files: UnFlatArray<string | FileData>) => void,
    resetMediaFiles: (...files: UnFlatArray<FileData>) => void,

    setImportDialogVisibility: (vis: boolean) => void,
    showImportDialog: () => void,
    setMediaDialogVisibility: (vis: boolean) => void,
    showMediaDialog: () => void,
}

// @ts-ignore
const TourContext = createContext<TourContextType>({});
export default TourContext;
