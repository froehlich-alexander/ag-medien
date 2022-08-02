import React, {useContext, useMemo, useState, createContext} from "react";
import {Container} from "react-bootstrap";
import {PageData} from "./Data";
import {MyNavBar} from "./MyNavBar";
import ListView from "./ListView";
import PageForm from "./PageForm";
import TourContext, {TourContextType} from "./TourContext";

export default function CreateTool() {
    // @ts-ignore
    const [pages, setPages] = useState<PageData[]>(pagesJson.map(PageData.fromJSON));
    const [currentPage, setCurrentPage] = useState<PageData>(pages[0]);

    const context: TourContextType = useMemo(() => ({
        pages: pages,
        currentPage: currentPage,
    }), [pages, currentPage]);

    return (
        <TourContext.Provider value={context}>
            <Container fluid className={"p-2"}>
                <MyNavBar/>
                <div className="row">
                    <ListView className="col-4" onSelect={setCurrentPage}/>
                    <PageForm className="col"/>
                </div>
            </Container>
        </TourContext.Provider>
    );
}