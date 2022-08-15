import {ChangeEvent, useContext, useEffect, useState} from "react";
import * as React from "react";
import {Button, Col, Form, FormControl, FormText, InputGroup, Modal, Row, Spinner, Table} from "react-bootstrap";
import {FileData, PageData, SchulTourConfigFile, SourceData} from "../js/Data";
import {JsonSchulTourConfigFile} from "../js/types.js";
import TourContext from "./TourContext";

type Props = {
    show: boolean,
    onVisibilityChange: (visibility: boolean) => any,
};

export function ImportDialog(
    {
        show,
        onVisibilityChange,
    }: Props) {
    const context = useContext(TourContext);

    const [pageConfigs, setPageConfigs] = useState<PageData[]>([]);
    const [configInputLoading, setConfigInputLoading] = useState(false);
    const [pageConfigPromise, setPageConfigPromise] = useState<Promise<void>>(Promise.resolve());

    const [mediaFiles, setMediaFiles] = useState<Array<FileData>>([]);
    const [mediaInputLoading, setMediaInputLoading] = useState(false);
    const [mediaPromise, setMediaPromise] = useState<Promise<void>>(Promise.resolve());
    // whether we're currently resetting media and some promises can cancel because of that
    const [resettingMedia, setResettingMedia] = useState(false);

    // whether we want to reset everything else and create a clean new project based on ths input of this dialog or not
    const [newImport, setNewImport] = useState(false);

    function hide() {
        onVisibilityChange(false);
    }

    return (
        <Modal show={show} onHide={hide}>
            <Modal.Header closeButton={true}>
                <Modal.Title>Import Tour Configuration</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form className="row gy-3">
                    {/*<p className="me-3">Import A Tour Config </p>*/}
                    <div className="text-info">All Changes will take effect after pressing
                        the <code>Import</code> button
                    </div>
                    <InputGroup>
                        <InputGroup.Text as="label" htmlFor="config-file">
                            <Spinner animation="border" className="me-2" variant="primary" hidden={!configInputLoading}
                                     size="sm" role="status">
                                <span className="visually-hidden">Preparing config files...</span>
                            </Spinner>
                            Tour Config
                        </InputGroup.Text>
                        <FormControl type="file" id="config-file" accept={'pages.json,application/json'}
                                     onChange={handleConfigChange} disabled={configInputLoading}/>
                        <Col sm={12}>
                            <FormText>The Tour Config File should be named <code>pages.json</code></FormText>
                        </Col>
                    </InputGroup>

                    <InputGroup>
                        <InputGroup.Text as="label" htmlFor="media-files">
                            <Spinner animation="border" className="me-2" hidden={!mediaInputLoading} size="sm"
                                     variant="primary" role="status">
                                <span className="visually-hidden">Preparing the media files...</span>
                            </Spinner>
                            Media
                        </InputGroup.Text>
                        <FormControl id="media-files" type={'file'} accept={'image/*,video/*, text/html'} multiple
                                     onChange={handleMediaChange} disabled={mediaInputLoading || resettingMedia}/>
                        <Button className="input-group-text" as="button" onClick={resetMedia} variant="danger">
                            <Spinner animation="border" as="span" hidden={!resettingMedia}
                                     role="status" size="sm" className="me-2">
                                <span className="visually-hidden">Resetting media input...</span>
                            </Spinner>
                            Reset
                        </Button>
                        <Col sm={12}>
                            <FormText>
                                The Images, Videos, etc. which are used in the tour.
                                You can configure the media more precise in the <a onClick={context.showMediaDialog} href="#">Media Dialog</a>
                            </FormText>
                        </Col>
                    </InputGroup>

                    <InputGroup>
                        <InputGroup.Text as="label" htmlFor="import-new">Remove old</InputGroup.Text>
                        <InputGroup.Checkbox id="import-new" selected={newImport} onChange={handleNewImportChange}/>
                        <Col sm={12}>
                            <FormText>Whether you want to remove the old page, media, etc. or keep them</FormText>
                        </Col>
                    </InputGroup>
                </Form>
                {/*<Button as="label" className={"me-3"} htmlFor="json-files-i">Add</Button>*/}
                {/*<FormControl id="json-files-i" type={"file"} multiple hidden={true} onChange={handleChange}/>*/}
                {/*<Button variant="danger" onClick={reset}>Reset</Button>*/}
                {/*<Table>*/}
                {/*    <thead>*/}
                {/*    <tr>*/}
                {/*        <th>#</th>*/}
                {/*        <th>Page Id</th>*/}
                {/*        <th>Actions</th>*/}
                {/*    </tr>*/}
                {/*    </thead>*/}
                {/*    <tbody>*/}
                {/*    {pages.map((v, i) => <tr>*/}
                {/*        <td>{i + 1}</td>*/}
                {/*        <td>{v.id}</td>*/}
                {/*    </tr>)}*/}
                {/*    </tbody>*/}
                {/*</Table>*/}
            </Modal.Body>
            <Modal.Footer>
                {/*<Row className={"gx-3"}>*/}
                <Button variant="secondary" onClick={hide}>Close</Button>
                <Button onClick={importPages}>Import</Button>
                {/*</Row>*/}
            </Modal.Footer>
        </Modal>
    );

    function handleNewImportChange(event: ChangeEvent<HTMLInputElement>) {
        setNewImport(event.target.checked);
    }

    function handleConfigChange(event: ChangeEvent<HTMLInputElement>) {
        // clear
        setPageConfigs([]);
        // disable until promise resolved
        setConfigInputLoading(true);
        setPageConfigPromise(
            Promise.all(Array.from(event.target.files!).map(v => v.text()
                .then(JSON.parse)
                .then(SchulTourConfigFile.fromJSON)
                .then(value => {
                    setPageConfigs(prevState => prevState.concat(value.pages));
                    // non blocking
                    // value.complete()
                    //     .then(v => {
                    //         setPageConfigs(prevState => prevState.concat(v));
                    //     });
                }),
            ))
                // enable because we've finished
                .then(() => setConfigInputLoading(false)),
        );
    }

    function handleMediaChange(event: ChangeEvent<HTMLInputElement>) {
        setMediaInputLoading(true);
        setMediaPromise(Promise.all(Array.from(event.target.files!)
            .map(value => FileData.fromFile(value).then(value1 => {
                setMediaFiles(prevState => prevState.concat(value1));
            })))
            .then(() => setMediaInputLoading(false)));
    }

    function resetMedia() {
        if (resettingMedia) {
            return
        }
        setResettingMedia(true);
        mediaPromise.then(() => {
            setMediaFiles([]);
            setResettingMedia(false);
        });
    }

    function importPages() {
        //todo loading icon
        Promise.all([pageConfigPromise, mediaPromise])
            .then(() => {
                if (!newImport) {
                    context.addMediaFiles(mediaFiles);
                    context.addPages(pageConfigs);
                } else {
                    context.resetMediaFiles(mediaFiles);
                    context.resetPages(pageConfigs);
                }
            })
            .then(() => {
                hide();
                // reset everything
                setMediaFiles([]);
                setPageConfigs([]);
            });
    }
}
