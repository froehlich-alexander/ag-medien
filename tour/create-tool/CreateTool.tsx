import React, {useContext, useMemo, useState, createContext, useEffect, useReducer} from "react";
import {Container} from "react-bootstrap";
import {PageData} from "../js/Data";
import {ImportDialog} from "./ImportDialog";
import {MyNavBar} from "./MyNavBar";
import ListView from "./ListView";
import PageForm from "./PageForm";
import TourContext, {TourContextType} from "./TourContext";
import "./CreateTool.scss";

export default function CreateTool() {

    function pageReducer(state: PageData[], action: { type: "add" | "remove" | "update", pages: PageData[] } | { type: "reset", pages?: PageData[] }): PageData[] {
        switch (action.type) {
            case "reset":
                if (!state.length) {
                    return state;
                } else {
                    return action.pages?.slice() ?? [];
                }
            case "remove":
                const idsToRemove = action.pages.map(v => v.id);
                const res = state.filter(v => !idsToRemove.includes(v.id));
                return res.length !== state.length ? res : state;
            case "add":
            case "update": {
                if (action.pages.length == 0) {
                    return state;
                }
                const pagesToAdd = [];
                const idsToRemove: string[] = [];

                for (let i of action.pages) {
                    const old = state.find(v => v.id === i.id);
                    if (!i.equals(old)) {
                        pagesToAdd.push(i);
                        idsToRemove.push(i.id);
                    }
                }

                // if we change anything
                if (pagesToAdd.length) {
                    const res = state.filter(v => !idsToRemove.includes(v.id));
                    res.push(...pagesToAdd);
                    Promise.all(pagesToAdd.map(value => value.complete()))
                        .then(v => dispatchPages({type: "update", pages: v}));
                    return res;
                } else {
                    return state;
                }
            }
        }
    }

    const [pages, dispatchPages] = useReducer(pageReducer, [] as PageData[]);
    const [currentPage, setCurrentPage] = useState<PageData>(pages[0]);
    const [importDialogVisibility, setImportDialogVisibility] = useState(true);

    const [formHasChanged, setFormHasChanged] = useState(false);

    const context: TourContextType = useMemo(() => ({
        pages: pages,
        currentPage: currentPage,
        addPages: addPages,
        setImportDialogVisibility: setImportDialogVisibility,
        importDialogVisibility: importDialogVisibility,
    }), [pages, currentPage, importDialogVisibility]);

    function addPages(...newPages: (PageData | PageData[])[]) {
        // dispatchPages(prevState => prevState.concat(...newPages));
        // // complete pages async and add them on resolve
        // Promise.all(([] as PageData[]).concat(...newPages).map(v => v.complete()))
        //     .then(v => context.addPages(...v));
    }

    // remove duplicates
    // useEffect(() => {
    //     function removeDuplicates(pages: PageData[]) {
    //         const res = [];
    //         for (let page of pages) {
    //             let items = pages.filter(v => v.id === page.id);
    //             let i = 1;
    //             for (let j of items.reverse()) {
    //                 if (j.isComplete() || i === items.length) {
    //                     res.push(j);
    //                     break;
    //                 }
    //                 i++;
    //             }
    //         }
    //         return res;
    //     }
    //
    //     dispatchPages(removeDuplicates);
    // }, [pages]);

    return (
        <TourContext.Provider value={context}>
            <ImportDialog show={importDialogVisibility} onVisibilityChange={setImportDialogVisibility}/>
            <Container fluid className={"p-2 CreateTool"}>
                <MyNavBar/>
                <div className="row">
                    <ListView className="col-4" onSelect={setCurrentPage}/>
                    {currentPage && <PageForm hasChanged={setFormHasChanged} className="col"/>}
                </div>
            </Container>
        </TourContext.Provider>
    );
}