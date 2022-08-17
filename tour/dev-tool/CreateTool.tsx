import React, {useCallback, useEffect, useState} from "react";
import {Button, Container, Spinner} from "react-bootstrap";
import {FileData, SchulTourConfigFile} from "../js/Data";
import {JsonSchulTourConfigFile} from "../js/types";
import "./CreateTool.scss";
import useDialog from "./custom-hooks/Dialog";
import useMedia from "./custom-hooks/Media";
import usePages from "./custom-hooks/Pages";
import useTemplates from "./custom-hooks/Templates";
import {ImportDialog} from "./ImportDialog";
import ListView from "./ListView";
import MediaDialog from "./MediaDialog.js";
import {MyNavBar} from "./MyNavBar";
import PageForm from "./PageForm";
import {DialogContext, MediaContext, PageContext, TemplateContext} from "./TourContexts";

export default function CreateTool() {
    const [fileSystem, setFileSystem] = useState<FileSystemDirectoryHandle>();
    const [configFile, setConfigFile] = useState<FileSystemFileHandle>();
    const [mediaDirectory, setMediaDirectory] = useState<FileSystemDirectoryHandle>();

    const [selectWorkingDirectoryAborted, setSelectWorkingDirectoryAborted] = useState(false);
    const [startingAllowed, setStartingAllowed] = useState(false);
    const [loadingFromFS, setLoadingFromFS] = useState(false);

    // const [importDialogVisibility, setImportDialogVisibility] = useState(false);
    // const [mediaDialogVisibility, setMediaDialogVisibility] = useState(true);

    const [formHasChanged, setFormHasChanged] = useState(false);

    // const [currentPage, setCurrentPage] = useState<PageData>();
    // const [pages, dispatchPages] = useReducer(pageReducer, []);
    // const [mediaFiles, dispatchMediaFiles] = useReducer(mediaFilesReducer, [] as Readonly<MediaFilesType>);
    // const [pages, {
    //     add: addPages,
    //     update: updatePages,
    //     remove: removePages,
    //     reset: resetPages,
    // }] = useDataList<PageData, string>([], (page => typeof page === "string" ? page : page.id),
    //     undefined, handlePagesAddUpdate, handlePagesAddUpdate);
    const {dialogContext, importDialogVisibility, setImportDialogVisibility} = useDialog();
    const {mediaFiles, resetMediaFiles, mediaContext} = useMedia(mediaDirectory);
    const {
        pages, resetPages,
        currentPage, setCurrentPage,
        pageContext,
    } = usePages(mediaContext, configFile);
    const {templateContext} = useTemplates();

    // const [mediaFiles, {
    //     add: addMediaFiles,
    //     remove: removeMediaFiles,
    //     reset: resetMediaFiles,
    //     update: updateMediaFiles,
    // }] = useDataList<FileData, string>([], (file => typeof file === "string" ? file : file.name),
    //     undefined, writeMediaFiles, writeMediaFiles, deleteMediaFiles);

    useEffect(() => {
        console.log('pages', pages);
    }, [pages]);
    useEffect(() => {
        console.log('media', mediaFiles);
    }, [mediaFiles]);

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
                setCurrentPage(config.pages.find(page => page.id === window.localStorage.getItem("current_page")));

                setMediaDirectory(mediaDirectory);
                setConfigFile(configFile);

                setLoadingFromFS(false);
                setStartingAllowed(true);
            })();
            setLoadingFromFS(true);
        }
    }, [fileSystem, resetMediaFiles, resetPages]);

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
            ? <MediaContext.Provider value={mediaContext}>
                <PageContext.Provider value={pageContext}>
                    <DialogContext.Provider value={dialogContext}>
                        <TemplateContext.Provider value={templateContext}>
                            <MediaDialog/>
                            <ImportDialog show={importDialogVisibility} onVisibilityChange={setImportDialogVisibility}/>
                            <Container fluid className={"p-2 CreateTool"}>
                                <MyNavBar className="mb-2"/>
                                <div className="row">
                                    <ListView className="col-4"/>
                                    {currentPage && <PageForm hasChanged={setFormHasChanged} className="col"/>}
                                </div>
                            </Container>
                        </TemplateContext.Provider>
                    </DialogContext.Provider>
                </PageContext.Provider>
            </MediaContext.Provider>
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
