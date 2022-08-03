import {createContext} from "react";
import {PageData} from "./Data";

export interface TourContextType {
    pages: PageData[],
    currentPage: PageData,
    addPages: (...pages: (PageData|PageData[])[])=>any,
}
// @ts-ignore
const TourContext = createContext<TourContextType>({});
export default TourContext;