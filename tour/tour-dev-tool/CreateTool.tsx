import React, {useCallback, useEffect, useState} from "react";
import {Button, Col, Container, Spinner} from "react-bootstrap";
import {Provider as StoreProvider} from "react-redux";
import {FileData, SchulTourConfigFile} from "../Data";
import Tour from "../tour";
import {JsonSchulTourConfigFile} from "../types";
import useForms from "./custom-hooks/Forms";
import useListView from "./custom-hooks/ListView";
import useMedia from "./custom-hooks/Media";
import usePages from "./custom-hooks/Pages";
import useTemplates from "./custom-hooks/Templates";
import useTourPreview from "./custom-hooks/TourPreviewState";
import {ImportDialog} from "./ImportDialog";
import InlineObjectDialog from "./InlineObjectDialog";
import ListView from "./ListView";
import MediaDialog from "./MediaDialog";
import MediaPreview from "./MediaPreview";
import {MyNavBar} from "./MyNavBar";
import PageForm from "./PageForm";
import store from "./store";
import {
    FormContext,
    ListViewContext,
    MediaContext,
    PageContext,
    TemplateContext,
    TourPreviewContext,
} from "./TourContexts";
import TourPreview from "./TourPreview";
import UnsavedChangesAlert from "./UnsavedChangesAlert";

Tour.devTool = true;

export default function CreateTool() {
    const [fileSystem, setFileSystem] = useState<FileSystemDirectoryHandle>();
    const [configFile, setConfigFile] = useState<FileSystemFileHandle>();
    const [mediaDirectory, setMediaDirectory] = useState<FileSystemDirectoryHandle>();

    const [selectWorkingDirectoryAborted, setSelectWorkingDirectoryAborted] = useState(false);
    const [startingAllowed, setStartingAllowed] = useState(false);
    const [loadingFromFS, setLoadingFromFS] = useState(false);

    // const {dialogContext, importDialogVisibility, setImportDialogVisibility} = useDialog();
    const {mediaFiles, resetMediaFiles, mediaContext} = useMedia(mediaDirectory);
    const {
        pages, resetPages,
        setCurrentPage,
        setTourConfig,
        pageContext,
    } = usePages(mediaContext, configFile, store);
    const {templateContext} = useTemplates();
    const {formContext, setPage, setRenamePageIdUsages} = useForms(pageContext);
    const {listViewContext} = useListView(pageContext, formContext, store);
    const {tourPreviewContext} = useTourPreview(pageContext);

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
                setTourConfig(config);

                setMediaDirectory(mediaDirectory);
                setConfigFile(configFile);

                setLoadingFromFS(false);
                setStartingAllowed(true);
            })();
            setLoadingFromFS(true);
        }
    }, [fileSystem, resetMediaFiles, resetPages]);

    const selectWorkingDirectory = useCallback(() => {
        showDirectoryPicker({
            mode: "readwrite",
            id: 'tour-tour-tour-dev-tool',
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
            ?<StoreProvider store={store}>
                 <MediaContext.Provider value={mediaContext}>
                    <PageContext.Provider value={pageContext}>
                            <TemplateContext.Provider value={templateContext}>
                                <FormContext.Provider value={formContext}>
                                    <ListViewContext.Provider value={listViewContext}>
                                        <TourPreviewContext.Provider value={tourPreviewContext}>
                                            <MediaDialog/>
                                            <ImportDialog/>
                                            <MediaPreview/>
                                            <TourPreview/>
                                            <InlineObjectDialog/>
                                            <Container fluid className={"p-2 CreateTool"}>
                                                <MyNavBar className="mb-2"/>
                                                <div className="row">
                                                    <Col sm={4}>
                                                        <UnsavedChangesAlert/>
                                                        <ListView/>
                                                    </Col>
                                                    <Col>
                                                        {formContext.page && <PageForm onChange={setPage} onRenamePageIdUsagesChange={setRenamePageIdUsages}/>}
                                                    </Col>
                                                </div>
                                            </Container>
                                        </TourPreviewContext.Provider>
                                    </ListViewContext.Provider>
                                </FormContext.Provider>
                            </TemplateContext.Provider>
                    </PageContext.Provider>
                </MediaContext.Provider>
            </StoreProvider>
            : <Container className="p-5">
                <p className={selectWorkingDirectoryAborted ? 'text-danger' : 'text-info'}>
                    You need to select a project directory to get started
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
