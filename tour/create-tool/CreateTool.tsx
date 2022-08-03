import React, {useContext, useMemo, useState, createContext} from "react";
import {Container} from "react-bootstrap";
import {PageData} from "./Data";
import {MyNavBar} from "./MyNavBar";
import ListView from "./ListView";
import PageForm from "./PageForm";
import TourContext, {TourContextType} from "./TourContext";
import "./CreateTool.scss";

export default function CreateTool() {
    const [pages, setPages] = useState<PageData[]>([]);
    const [currentPage, setCurrentPage] = useState<PageData>(pages[0]);

    const [formHasChanged, setFormHasChanged] = useState(false);

    const context: TourContextType = useMemo(() => ({
            pages: pages,
            currentPage: currentPage,
            addPages: (pages1) => setPages(prevState => prevState.concat(pages1)),
    }), [pages, currentPage]);

    return (
        <TourContext.Provider value={context}>
            <Container fluid className={"p-2 CreateTool"}>
                <MyNavBar/>
                <div className="row">
                    <ListView className="col-4" onSelect={setCurrentPage}/>
                    <PageForm hasChanged={setFormHasChanged} className="col"/>
                </div>
            </Container>
        </TourContext.Provider>
    );
}