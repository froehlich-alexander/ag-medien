import React, {useContext, useMemo, useState, createContext, useEffect, useReducer, useCallback} from "react";
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
    // --- reducer ---
    const pageReducer = (state: PageData[], action: { type: "add" | "remove" | "update", pages: PageData[] } | { type: "reset", pages?: PageData[] }): PageData[] => {
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
    };


    type MediaFilesType = { readonly [k: string]: FileData };

    const mediaFilesReducer = (state: Readonly<MediaFilesType>, action:
        { type: 'add' | 'update', media: FileData[] } |
        { type: 'remove', removeMedia: string[] } |
        { type: 'reset', newMedia?: FileData[] },
    ) => {
        const keys = Object.keys(state);
        switch (action.type) {
            case "reset":
                if (!keys.length && !action.newMedia?.length) {
                    return state;
                } else {
                    return {...(action.newMedia ?? {})} as MediaFilesType;
                }
            case "remove":
                return Object.entries(state).filter(([k]) => !action.removeMedia.includes(k))
                    .reduce((previousValue, [key, value]) =>
                        Object.defineProperty(previousValue, key, {value: value}),
                        {} as Mutable<MediaFilesType>) as MediaFilesType;
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
    };
    // --- reducer end ---

    const [pages, dispatchPages] = useReducer(pageReducer, [] as PageData[]);
    const [mediaFiles, dispatchMediaFiles] = useReducer(mediaFilesReducer, {} as Readonly<MediaFilesType>);
    const [currentPage, setCurrentPage] = useState<PageData>();
    const [importDialogVisibility, setImportDialogVisibility] = useState(false);
    const [mediaDialogVisibility, setMediaDialogVisibility] = useState(true);

    const [formHasChanged, setFormHasChanged] = useState(false);

    useEffect(() => {
        console.log('pages', pages);
    }, [pages]);
    useEffect(() => {
        console.log('media', mediaFiles);
    }, [mediaFiles]);

    // --- context methods ---
    const setCurrentPageById = useCallback((id: string) => {
        setCurrentPage(pages.find(value => value.id === id));
    }, []);

    const addPages = useCallback((...newPages: (PageData | PageData[])[]) => {
        dispatchPages({type: 'add', pages: newPages.flat()});
    }, []);

    const resetPages = useCallback((...pages: (PageData | PageData[])[]) => {
        dispatchPages({type: 'reset', pages: pages.flat(1)});
    }, []);

    const addMediaFiles = useCallback((...files: (FileData | FileData[])[]) => {
        dispatchMediaFiles({type: 'add', media: files.flat()});
    }, []);

    const removeMediaFiles = useCallback(<T extends FileData | string>(...files: (T | T[])[]) => {
        dispatchMediaFiles({
            type: 'remove',
            removeMedia: files.flat().map(value => typeof value === "string" ? value : value.name),
        });
    }, []);

    const resetMediaFiles = useCallback((...files: (FileData | FileData[])[]) => {
        dispatchMediaFiles({type: 'reset', newMedia: files.flat()});
    }, []);
    // --- context methods end ---

    const context: TourContextType = useMemo(() => ({
        pages: pages,
        currentPage: currentPage,
        mediaFiles: mediaFiles,
        importDialogVisibility: importDialogVisibility,
        mediaDialogVisibility: mediaDialogVisibility,
        setCurrentPage: setCurrentPageById,
        addPages: addPages,
        resetPages: resetPages,

        addMediaFiles: addMediaFiles,
        updateMediaFiles: addMediaFiles,
        removeMediaFiles: removeMediaFiles,
        resetMediaFiles: resetMediaFiles,

        setImportDialogVisibility: setImportDialogVisibility,
        setMediaDialogVisibility: setMediaDialogVisibility,
    }), [pages, currentPage, mediaFiles, importDialogVisibility, mediaDialogVisibility]);

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
