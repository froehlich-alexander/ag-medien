import {createContext} from "react";

export interface TourContextType {
    pages: Page[],
}
// @ts-ignore
const TourContext = createContext<TourContextType>({});
export default TourContext;