import React, {useCallback, useEffect, useMemo, useReducer, useState} from "react";
import {Button, Container, Spinner} from "react-bootstrap";
import {jsonRegex} from "ts-loader/dist/constants";
import {FileData, PageData, SchulTourConfigFile} from "../js/Data";
import {JsonSchulTourConfigFile} from "../js/types";
import "./CreateTool.scss";
import useDataList from "./custom-hooks/DataListReducer";
import {ImportDialog} from "./ImportDialog";
import ListView from "./ListView";
import MediaDialog from "./MediaDialog.js";
import {MyNavBar} from "./MyNavBar";
import PageForm from "./PageForm";
import TourContext, {TourContextType} from "./TourContext";

export default function CreateTool() {
    // --- reducer ---
    // const pageReducer = (state: PageData[], action: { type: "add" | "update", pages: PageData[] }
    //     | { type: "remove", pages: Array<string | PageData> }
    //     | { type: "reset", pages?: PageData[] }): PageData[] => {
    //     switch (action.type) {
    //         case "reset":
    //             setCurrentPage(undefined);
    //             if (!action.pages?.length && !state.length) {
    //                 return state;
    //             } else {
    //                 return state.concat(action.pages ?? []);
    //             }
    //         case "remove":
    //             if (!action.pages.length) {
    //                 return state;
    //             }
    //             const idsToRemove = action.pages.map(v => typeof v === "string" ? v : v.id);
    //             setCurrentPage(prevState => (prevState && !idsToRemove.includes(prevState.id)) ? prevState : undefined);
    //             return state.filter(v => !idsToRemove.includes(v.id));
    //         case "add":
    //         case "update": {
    //             if (action.pages.length === 0) {
    //                 return state;
    //             }
    //             const pagesToAdd = [];
    //             const idsToRemove: string[] = [];
    //
    //             for (let i of action.pages) {
    //                 const old = state.find(v => v.id === i.id);
    //                 if (!i.equals(old)) {
    //                     pagesToAdd.push(i);
    //                     idsToRemove.push(i.id);
    //                 }
    //             }
    //
    //             // if we change anything
    //             if (pagesToAdd.length) {
    //                 const res = state.filter(v => !idsToRemove.includes(v.id));
    //                 res.push(...pagesToAdd);
    //                 Promise.all(pagesToAdd.filter(value => !value.isComplete()).map(value => value.complete()))
    //                     .then(v => dispatchPages({type: "update", pages: v}));
    //                 return res;
    //             } else {
    //                 return state;
    //             }
    //         }
    //     }
    // };


    // type MediaFile = FileData;
    // type MediaFilesType = MediaFile[];
    //
    // const mediaFilesReducer = (state: Readonly<MediaFilesType>, action:
    //     { type: 'add' | 'update', media: MediaFile[] } |
    //     { type: 'remove', removeMedia: string[] } |
    //     { type: 'reset', newMedia?: MediaFile[] },
    // ): Readonly<MediaFilesType> => {
    //     switch (action.type) {
    //         case "reset":
    //             if (!state.length && !action.newMedia?.length) {
    //                 return state;
    //             } else {
    //                 const res = action.newMedia ?? [];
    //                 deleteMediaFiles(state.map(value => value.name).filter(value => !action.newMedia?.some(value1 => value1.name === value)));
    //                 writeMediaFiles(res);
    //                 return res;
    //             }
    //         case "remove":
    //             if (!action.removeMedia.length) {
    //                 return state;
    //             }
    //             deleteMediaFiles(action.removeMedia);
    //             return state.filter(v => !action.removeMedia.includes(v.name));
    //         // return Object.entries(state).filter(([k]) => !action.removeMedia.includes(k))
    //         //     .reduce((previousValue, [key, value]) =>
    //         //             Object.defineProperty(previousValue, key, {value: value}),
    //         //         {} as Mutable<MediaFilesType>) as MediaFilesType;
    //         case "add":
    //         case "update":
    //             if (action.media.length === 0) {
    //                 return state;
    //             }
    //             const namesToDelete: string[] = [];
    //             const filesToAdd: MediaFile[] = [];
    //
    //             for (let i of action.media) {
    //                 const old = state.find(v => v.name === i.name);
    //                 if (!i.equals(old)) {
    //                     filesToAdd.push(i);
    //                     namesToDelete.push(i.name);
    //                 }
    //             }
    //
    //             // if we change anything
    //             if (filesToAdd.length) {
    //                 const res = state.filter(v => !namesToDelete.includes(v.name));
    //                 res.push(...filesToAdd);
    //                 writeMediaFiles(filesToAdd);
    //                 // Promise.all(filesToAdd.filter(value => !value.isComplete()).map(value => value.complete()))
    //                 //     .then(v => dispatchMedia({type: "update", media: v}));
    //                 return res;
    //             } else {
    //                 return state;
    //             }
    //     }
    // };
    // --- reducer end ---
    const [fileSystem, setFileSystem] = useState<FileSystemDirectoryHandle>();
    const [configFile, setConfigFile] = useState<FileSystemFileHandle>();
    const [mediaDirectory, setMediaDirectory] = useState<FileSystemDirectoryHandle>();

    const [selectWorkingDirectoryAborted, setSelectWorkingDirectoryAborted] = useState(false);
    const [startingAllowed, setStartingAllowed] = useState(false);
    const [loadingFromFS, setLoadingFromFS] = useState(false);

    const [importDialogVisibility, setImportDialogVisibility] = useState(false);
    const [mediaDialogVisibility, setMediaDialogVisibility] = useState(true);

    const [formHasChanged, setFormHasChanged] = useState(false);

    const [currentPage, setCurrentPage] = useState<PageData>();
    // const [pages, dispatchPages] = useReducer(pageReducer, []);
    // const [mediaFiles, dispatchMediaFiles] = useReducer(mediaFilesReducer, [] as Readonly<MediaFilesType>);
    const [pages, {
        add: addPages,
        update: updatePages,
        remove: removePages,
        reset: resetPages,
    }] = useDataList<PageData, string>([], (page => typeof page === "string" ? page : page.id));

    const [mediaFiles, {
        add: addMediaFiles,
        remove: removeMediaFiles,
        reset: resetMediaFiles,
        update: updateMediaFiles,
    }] = useDataList<FileData, string>([], (file => typeof file === "string" ? file : file.name),
        undefined, writeMediaFiles, writeMediaFiles, deleteMediaFiles);

    useEffect(() => {
        console.log('pages', pages);
    }, [pages]);
    useEffect(() => {
        console.log('media', mediaFiles);
    }, [mediaFiles]);


    const setCurrentPageById = useCallback((id: string | undefined | null) => {
        setCurrentPage(pages.find(value => value.id === id));
    }, [pages]);

    const showImportDialog = useCallback(() => {
        setImportDialogVisibility(true);
    }, []);

    const showMediaDialog = useCallback(() => {
        setMediaDialogVisibility(true);
    }, []);

    const context: TourContextType = useMemo(() => ({
        pages: pages,
        currentPage: currentPage,
        mediaFiles: mediaFiles,
        importDialogVisibility: importDialogVisibility,
        mediaDialogVisibility: mediaDialogVisibility,
        setCurrentPage: setCurrentPageById,
        addPages: addPages,
        updatePages: updatePages,
        removePages: removePages,
        resetPages: resetPages,

        addMediaFiles: addMediaFiles,
        updateMediaFiles: updateMediaFiles,
        removeMediaFiles: removeMediaFiles,
        resetMediaFiles: resetMediaFiles,

        setImportDialogVisibility: setImportDialogVisibility,
        showImportDialog: showImportDialog,
        setMediaDialogVisibility: setMediaDialogVisibility,
        showMediaDialog: showMediaDialog,
    }), [pages, currentPage, mediaFiles, importDialogVisibility, mediaDialogVisibility]);

    async function writeMediaFiles(files: FileData[]) {
        console.log('write media', files, mediaDirectory);
        if (!mediaDirectory) return;

        const proms: Array<Promise<void>> = [];

        for (let file of files) {
            proms.push((async function () {
                const handle = await mediaDirectory.getFileHandle(file.name, {create: true});
                const stream = await handle.createWritable({keepExistingData: false});
                await file.file.stream().pipeTo(stream);
            })());
        }
        return Promise.all(proms);
    }

    async function deleteMediaFiles(files: FileData[]) {
        console.log('delete media', files, mediaDirectory);
        if (!mediaDirectory) return;

        const fileNames = files.map(value => value.name);
        const proms: Array<Promise<void>> = [];

        for (let fileName of fileNames) {
            proms.push((async function () {
                const handle = await mediaDirectory.getFileHandle(fileName, {create: true});
                await mediaDirectory.removeEntry(fileName);
            })());
        }
        return Promise.all(proms);
    }

    // read fs
    // read localstorage
    useEffect(() => {
        if (fileSystem != null) {
            (async function () {
                const mediaDirectory = await fileSystem.getDirectoryHandle('media', {create: true});
                const configFile = await fileSystem.getFileHandle('pages.json', {create: true});

                const medias: Array<Promise<File>> = [];
                for await (const media of mediaDirectory.values()) {
                    if (media.kind !== 'file') {
                        continue;
                    }
                    medias.push(media.getFile());
                }

                resetMediaFiles(await Promise.all(medias.map(value => value.then(FileData.fromFile))));

                const configJson = JSON.parse(await (await configFile.getFile()).text() ?? 'null') as JsonSchulTourConfigFile | null;
                let config: SchulTourConfigFile;
                if (configJson) {
                    config = SchulTourConfigFile.fromJSON(configJson);
                } else {
                    config = SchulTourConfigFile.default();
                }
                resetPages(config.pages ?? []);
                setCurrentPage(config.pages.find(page=>page.id===window.localStorage.getItem("current_page")));

                setMediaDirectory(mediaDirectory);
                setConfigFile(configFile);

                setLoadingFromFS(false);
                setStartingAllowed(true);
            })();
            setLoadingFromFS(true);
        }
    }, [fileSystem]);

    // write fs pages
    useEffect(() => {
        if (!configFile)
            return;

        setCurrentPageById(currentPage?.id);

        const config = new SchulTourConfigFile({
            pages: pages,
        });
        (async function () {
            const stream = (await configFile.createWritable());
            await stream.write(JSON.stringify(config));
            await stream.close();
        })();

    }, [pages, configFile]);

    // // write fs media
    // useEffect(() => {
    //     if (!mediaDirectory)
    //         return;
    //
    // }, [mediaFiles, mediaDirectory]);

    // write current page to local storage
    useEffect(() => {
        if (currentPage) {
            window.localStorage.setItem('current_page', currentPage.id);
        }
    }, [currentPage]);

    // // save to json
    // useEffect(() => {
    //     window.localStorage.setItem('pages', JSON.stringify(pages));
    // }, [pages]);
    // useEffect(() => {
    //     window.localStorage.setItem('medias', JSON.stringify(Object.values(mediaFiles)));
    // }, [mediaFiles]);
    // useEffect(() => {
    //     window.localStorage.setItem('currentPage', JSON.stringify(currentPage?.id ?? null));
    // }, [currentPage]);
    //
    // // from json
    // useEffect(() => {
    //     const pages = (JSON.parse(window.localStorage.getItem('pages') ?? '[]') as Array<JsonPage>).map(PageData.fromJSON);
    //     const currentPageId: string | null = JSON.parse(window.localStorage.getItem('currentPage') ?? 'null');
    //     const mediaFiles = (JSON.parse(window.localStorage.getItem('medias') ?? '[]') as Array<JsonFileData>).map(FileData.fromJSON);
    //
    //     resetMediaFiles(mediaFiles);
    //     resetPages(pages);
    //     setCurrentPage(pages.find(value => value.id === currentPageId));
    // }, []);

    const selectWorkingDirectory = useCallback(() => {
        showDirectoryPicker({
            mode: "readwrite",
            id: 'tour-tour-dev-tool',
            startIn: "documents",
        })
            .then(v => {
                setFileSystem(prevState => {
                    if (!prevState) {
                        return v;
                    }
                });
            })
            .catch((reason) => {
                setSelectWorkingDirectoryAborted(true);
                throw reason;
            });
    }, []);

    return (
        startingAllowed
            ? <TourContext.Provider value={context}>
                <MediaDialog/>
                <ImportDialog show={importDialogVisibility} onVisibilityChange={setImportDialogVisibility}/>
                <Container fluid className={"p-2 CreateTool"}>
                    <MyNavBar className="mb-2"/>
                    <div className="row">
                        <ListView className="col-4"/>
                        {currentPage && <PageForm hasChanged={setFormHasChanged} className="col"/>}
                    </div>
                </Container>
            </TourContext.Provider>
            : <Container className="p-5">
                <p className={selectWorkingDirectoryAborted ? 'text-danger' : 'text-info'}>
                    You need to select a working directory to get started
                </p>
                <p>
                    Typically this folder contains the config file (e.g. <code>pages.json</code>),
                    a sub-directory for the media (named <code>media</code>)
                    and various other files and / or folders.
                    If the config file or the media folder are absent, they will be created.
                </p>
                <p className="text-danger">
                    Please do not modify this directory via explorer while this application is running.
                    These Changes won't be recognized and could be overwritten accidentally.<br/>
                    <span className="text-info">Use the tools inside this application instead</span>
                </p>
                <Button onClick={selectWorkingDirectory}>
                    <Spinner animation="border" hidden={!loadingFromFS} className="me-2" size="sm" role="status">
                        <span className="visually-hidden">loading files...</span>
                    </Spinner>
                    Select Working Directory
                </Button>
            </Container>
    );
}
