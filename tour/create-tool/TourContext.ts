import {createContext} from "react";
import {PageData} from "../js/Data";

export interface TourContextType {
    pages: PageData[],
    currentPage: PageData,
    addPages: (...pages: (PageData|PageData[])[])=>any,
    setImportDialogVisibility: (vis: boolean)=>any,
    importDialogVisibility: boolean,
}
// @ts-ignore
const TourContext = createContext<TourContextType>({});
export default TourContext;