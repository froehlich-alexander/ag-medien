import React, {useContext, useMemo, useState, createContext, useEffect, useReducer} from "react";
import {Container} from "react-bootstrap";
import {act, Simulate} from "react-dom/test-utils";
import {a} from "../../widgets/declarations/SelectMenu.js";
import {FileData, Mutable, PageData} from "../js/Data";
import {ImportDialog} from "./ImportDialog";
import mediaDialog from "./MediaDialog.js";
import MediaDialog from "./MediaDialog.js";
import {MyNavBar} from "./MyNavBar";
import ListView from "./ListView";
import PageForm from "./PageForm";
import TourContext, {TourContextType} from "./TourContext";
import "./CreateTool.scss";
import load = Simulate.load;

export default function CreateTool() {
    function pageReducer(state: PageData[], action: { type: "add" | "remove" | "update", pages: PageData[] } | { type: "reset", pages?: PageData[] }): PageData[] {
        switch (action.type) {
            case "reset":
                if (!action.pages?.length && !state.length) {
                    return state;
                } else {
                    return state.concat(action.pages ?? []);
                }
            case "remove":
                const idsToRemove = action.pages.map(v => v.id);
                const res = state.filter(v => !idsToRemove.includes(v.id));
                return res.length !== state.length ? res : state;
            case "add":
            case "update": {
                if (action.pages.length === 0) {
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
                    Promise.all(pagesToAdd.filter(value => value.isComplete()).map(value => value.complete()))
                        .then(v => dispatchPages({type: "update", pages: v}));
                    return res;
                } else {
                    return state;
                }
            }
        }
    }

    type MediaFilesType = { readonly [k: string]: FileData }

    function mediaFilesReducer(state: Readonly<MediaFilesType>, action:
        { type: 'add' | 'update', media: FileData[] } |
        { type: 'remove', removeMedia: string[] } |
        { type: 'reset', newMedia?: FileData[] },
    ) {
        const keys = Object.keys(state);
        switch (action.type) {
            case "reset":
                if (!keys.length && !action.newMedia?.length) {
                    return state;
                } else {
                    return {...(action.newMedia ?? {})} as MediaFilesType;
                }
            case "remove":
                return Object.entries(state).filter(([k]) => !action.removeMedia.includes(k)).reduce((previousValue, [key, value]) => {
                    previousValue[key] = value;
                    return previousValue;
                }, {} as Mutable<MediaFilesType>) as MediaFilesType;
            case "add":
            case "update":
                if (action.media.length) {
                    const newState = {...state};
                    for (let i of action.media) {
                        newState[i.name] = i;
                    }
                    return newState;
                }
                return state;
        }
    }

    const [pages, dispatchPages] = useReducer(pageReducer, [] as PageData[]);
    const [mediaFiles, dispatchMediaFiles] = useReducer(mediaFilesReducer, {} as Readonly<MediaFilesType>);
    const [currentPage, setCurrentPage] = useState<PageData>();
    const [importDialogVisibility, setImportDialogVisibility] = useState(false);
    const [mediaDialogVisibility, setMediaDialogVisibility] = useState(false);

    const [formHasChanged, setFormHasChanged] = useState(false);

    useEffect(() => {
        console.log('pages', pages);
    }, [pages]);
    useEffect(() => {
        console.log('media', mediaFiles);
    }, [mediaFiles]);

    const context: TourContextType = useMemo(() => ({
        pages: pages,
        currentPage: currentPage,
        setCurrentPage: setCurrentPageById,
        addPages: addPages,
        mediaFiles: mediaFiles,
        addMediaFiles: addMediaFiles,
        updateMediaFiles: addMediaFiles,
        removeMediaFiles: removeMediaFiles,
        resetMediaFiles: resetMediaFiles,
        importDialogVisibility: importDialogVisibility,
        setImportDialogVisibility: setImportDialogVisibility,
        mediaDialogVisibility: mediaDialogVisibility,
        setMediaDialogVisibility: setMediaDialogVisibility,
    }), [pages, currentPage, mediaFiles, importDialogVisibility, mediaDialogVisibility]);

    function addPages(...newPages: (PageData | PageData[])[]) {
        dispatchPages({type: 'add', pages: ([] as PageData[]).concat(...newPages)});
        // dispatchPages(prevState => prevState.concat(...newPages));
        // // complete pages async and add them on resolve
        // Promise.all(([] as PageData[]).concat(...newPages).map(v => v.complete()))
        //     .then(v => context.addPages(...v));
    }

    function setCurrentPageById(id: string) {
        setCurrentPage(pages.find(value => value.id === id));
    }

    function addMediaFiles(...files: (FileData | FileData[])[]): void {
        dispatchMediaFiles({type: 'add', media: ([] as FileData[]).concat(...files)});
    }

    function removeMediaFiles<T extends FileData | string>(...files: (T | T[])[]): void {
        dispatchMediaFiles({
            type: 'remove',
            removeMedia: ([] as T[]).concat(...files).map(value => typeof value === "string" ? value : value.name),
        });
    }

    function resetMediaFiles(...files: (FileData | FileData[])[]): void {
        dispatchMediaFiles({type: 'reset', newMedia: ([] as FileData[]).concat(...files)});
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
            <MediaDialog/>
            <Container fluid className={"p-2 CreateTool"}>
                <MyNavBar/>
                <div className="row">
                    <ListView className="col-4"/>
                    {currentPage && <PageForm hasChanged={setFormHasChanged} className="col"/>}
                </div>
            </Container>
        </TourContext.Provider>
    );
}
