import React, {useContext, useMemo, useState, createContext} from "react";
import {Container} from "react-bootstrap";
import ListView from "./ListView";
import PageForm from "./PageForm";
import TourContext, {TourContextType} from "./TourContext";

export default function CreateTool() {
    // @ts-ignore
    const [pages, setPages] = useState(pagesJson);

    const context: TourContextType = useMemo(() => ({
        pages: pages,
    }), pages);

    return (
        <TourContext.Provider value={context}>
            <Container fluid>
                <div className="row">
                    <ListView className="col-4"/>
                    <PageForm className="col"/>
                </div>
            </Container>
        </TourContext.Provider>
    );
}