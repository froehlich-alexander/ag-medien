import React, {ChangeEvent, useCallback, useContext, useState} from 'react';
import {
    Button,
    ButtonGroup,
    CloseButton,
    Col,
    Container,
    Form,
    FormControl,
    InputGroup,
    Modal, Row, Spinner,
    Table,
} from "react-bootstrap";
import {FileData} from "../js/Data";
import useSet from "./custom-hooks/SetSate";
import TourContext from "./TourContext";
import {formatFileSize, MaterialIcon} from "./utils";

interface PropsType {
}

function MediaDialog(
    {}: PropsType) {

    const context = useContext(TourContext);

    const hide = useCallback(() => {
        context.setMediaDialogVisibility(false);
    }, [context.setMediaDialogVisibility]);

    const show = useCallback(() => {
        context.setMediaDialogVisibility(true);
    }, [context.setMediaDialogVisibility]);

    const [selectedMedia, {toggle: toggleSelection, reset: resetSelection}] = useSet<string>();

    const selectAll = useCallback(() => {
        resetSelection(context.mediaFiles.map(value => value.name));
    }, [resetSelection]);

    const unselectAll = useCallback(() => {
        resetSelection([]);
    }, [resetSelection]);

    const deleteSelected = useCallback(() => {
        context.removeMediaFiles(Array.from(selectedMedia));
    }, [selectedMedia, context.removeMediaFiles]);

    const deleteAll = useCallback(() => {
        context.resetMediaFiles();
    }, [context.resetMediaFiles]);

    const [mediaInputLoading, setMediaInputLoading] = useState(false);

    const handleMediaAdded = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setMediaInputLoading(true);
        Promise.all(Array.from(event.target.files!).map(FileData.fromFile))
            .then(context.addMediaFiles)
            .then(()=>setMediaInputLoading(false));
    }, [context.addMediaFiles]);

    return (
        <Modal show={context.mediaDialogVisibility} className="MediaDialog" onHide={hide} onShow={show} size="lg">
            <Modal.Header closeButton={true}>
                <Modal.Title>Media</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Col sm={12}>
                        <Container className="p-1 mb-2">
                            <Row className="row-cols-auto">
                                <ButtonGroup className="me-3">
                                    <Button variant="primary" as="label" htmlFor="add-files" disabled={mediaInputLoading}>
                                        <Spinner animation="border" className="me-2" hidden={!mediaInputLoading}
                                                 size="sm" role="status">
                                            <span className="visually-hidden">Preparing the media files...</span>
                                        </Spinner>
                                        Add Files
                                    </Button>
                                    <Button variant="danger" onClick={deleteAll}>Delete all</Button>
                                </ButtonGroup>
                                <FormControl type="file" id="add-files" onChange={handleMediaAdded} hidden={true}/>
                                <ButtonGroup>
                                    <Button onClick={selectAll}>Select All</Button>
                                    <Button variant="secondary" onClick={unselectAll}>Unselect All</Button>
                                </ButtonGroup>

                                <ButtonGroup>
                                    <Button variant="danger" onClick={deleteSelected}>Delete Selected</Button>
                                </ButtonGroup>
                            </Row>
                        </Container>
                    </Col>

                    <Table className="MediaTable">
                        <caption>Media Table</caption>
                        <thead>
                        <tr>
                            <th className=""><MaterialIcon icon="check_box" className="align-bottom" color="primary"/>
                            </th>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Size</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {context.mediaFiles.map(value =>
                            <MediaItem file={value} onSelected={toggleSelection} key={value.name}
                                       selected={selectedMedia.has(value.name)}/>,
                        )}
                        </tbody>
                    </Table>

                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={hide}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
}

type MediaItemProps = {
    file: FileData,
    selected: boolean,
    onSelected: (fileName: string) => void,
}

function MediaItem({file, selected, onSelected}: MediaItemProps) {

    const context = useContext(TourContext);

    const handleDelete = useCallback(() => {
        context.removeMediaFiles(file.name);
    }, [file.name, context.removeMediaFiles]);

    const handleCheckboxClick = useCallback(() => {
        onSelected(file.name);
    }, [selected, onSelected, file.name]);

    return (
        <tr>
            <td><Form.Check checked={selected} onChange={handleCheckboxClick}/></td>
            <td><code>{file.name}</code></td>
            <td>{file.type}</td>
            <td>{formatFileSize(file.size, false)}</td>
            <td><MaterialIcon icon="delete" color="danger" onClick={handleDelete}/></td>
        </tr>
    );
}

export default MediaDialog;
