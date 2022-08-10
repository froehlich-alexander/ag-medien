import {createContext} from "react";
import {FileData, PageData} from "../js/Data";

export interface TourContextType {
    pages: PageData[],
    currentPage?: PageData,
    setCurrentPage: (page: string) => void,
    addPages: (...pages: (PageData | PageData[])[]) => void,
    mediaFiles: { readonly [k: string]: FileData },
    addMediaFiles: (...files: (FileData | FileData[])[]) => void,
    updateMediaFiles: (...files: (FileData | FileData[])[]) => void,
    removeMediaFiles: <T extends FileData | string>(...files: (T | T[])[]) => void,
    resetMediaFiles: (...files: (FileData | FileData[])[]) => void,
    setImportDialogVisibility: (vis: boolean) => void,
    importDialogVisibility: boolean,
    setMediaDialogVisibility: (vis: boolean) => void,
    mediaDialogVisibility: boolean,
}

// @ts-ignore
const TourContext = createContext<TourContextType>({});
export default TourContext;
