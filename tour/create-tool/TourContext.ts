import {createContext} from "react";
import {FileData, PageData} from "../js/Data";

export interface TourContextType {
    pages: PageData[],
    currentPage?: PageData,
    importDialogVisibility: boolean,
    mediaDialogVisibility: boolean,

    setCurrentPage: (page: string) => void,
    addPages: (...pages: (PageData | PageData[])[]) => void,
    resetPages:(...pages: (PageData|PageData[])[])=> void;

    mediaFiles: Readonly<FileData[]>,
    addMediaFiles: (...files: (FileData | FileData[])[]) => void,
    updateMediaFiles: (...files: (FileData | FileData[])[]) => void,
    removeMediaFiles: <T extends FileData | string>(...files: (T | T[])[]) => void,
    resetMediaFiles: (...files: (FileData | FileData[])[]) => void,

    setImportDialogVisibility: (vis: boolean) => void,
    setMediaDialogVisibility: (vis: boolean) => void,
}

// @ts-ignore
const TourContext = createContext<TourContextType>({});
export default TourContext;
