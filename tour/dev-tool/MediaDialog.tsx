import React, {ChangeEvent, useCallback, useContext, useState} from 'react';
import {Button, ButtonGroup, Col, Container, Form, FormControl, Modal, Row, Spinner, Table} from "react-bootstrap";
import {useTranslation} from "react-i18next";
import {FileData} from "../js/Data";
import useSet from "./custom-hooks/SetSate";
import {DialogContext, MediaContext} from "./TourContexts";
import {formatFileSize, MaterialIcon} from "./utils";

interface PropsType {
}

function MediaDialog({}: PropsType) {
    const dialogContext = useContext(DialogContext);
    const mediaContext = useContext(MediaContext);

    const hide = useCallback(() => {
        dialogContext.setMediaDialogVisibility(false);
    }, [dialogContext.setMediaDialogVisibility]);

    const show = useCallback(() => {
        dialogContext.setMediaDialogVisibility(true);
    }, [dialogContext.setMediaDialogVisibility]);

    const [selectedMedia, {toggle: toggleSelection, reset: resetSelection}] = useSet<string>();

    const selectAll = useCallback(() => {
        resetSelection(mediaContext.mediaFiles.map(value => value.name));
    }, [resetSelection]);

    const unselectAll = useCallback(() => {
        resetSelection([]);
    }, [resetSelection]);

    const deleteSelected = useCallback(() => {
        mediaContext.removeMediaFiles(Array.from(selectedMedia));
    }, [selectedMedia, mediaContext.removeMediaFiles]);

    const deleteAll = useCallback(() => {
        mediaContext.resetMediaFiles();
    }, [mediaContext.resetMediaFiles]);

    const {t} = useTranslation("dialog", {keyPrefix: 'media'});

    const [mediaInputLoading, setMediaInputLoading] = useState(false);

    const handleMediaAdded = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setMediaInputLoading(true);
        Promise.all(Array.from(event.target.files!).map(FileData.fromFile))
            .then(mediaContext.addMediaFiles)
            .then(() => setMediaInputLoading(false));
    }, [mediaContext.addMediaFiles]);

    return (
        <Modal show={dialogContext.mediaDialogVisibility} className="MediaDialog" onHide={hide} onShow={show} size="lg">
            <Modal.Header closeButton={true}>
                <Modal.Title>Media</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Col sm={12}>
                        <Container className="p-1 mb-2">
                            <Row className="row-cols-auto gy-3">
                                <ButtonGroup className="me-3">
                                    <Button variant="primary" as="label" htmlFor="add-files"
                                            disabled={mediaInputLoading}>
                                        <Spinner animation="border" className="me-2" hidden={!mediaInputLoading}
                                                 size="sm" role="status">
                                            <span className="visually-hidden">{t("buttons.addAll.spinner")}</span>
                                        </Spinner>
                                        {t("buttons.addAll.label")}
                                    </Button>
                                    <Button variant="danger" onClick={deleteAll}>{t("buttons.deleteAll.label")}</Button>
                                </ButtonGroup>
                                <FormControl type="file" id="add-files" onChange={handleMediaAdded} hidden={true}/>
                                <ButtonGroup>
                                    <Button onClick={selectAll}>{t("buttons.selectAll")}</Button>
                                    <Button variant="secondary"
                                            onClick={unselectAll}>{t('buttons.unselectAll')}</Button>
                                </ButtonGroup>

                                <ButtonGroup>
                                    <Button variant="danger"
                                            onClick={deleteSelected}>{t('buttons.deleteSelected')}</Button>
                                </ButtonGroup>
                            </Row>
                        </Container>
                    </Col>

                    <Table className="MediaTable">
                        <caption>{t("table.caption")}</caption>
                        <thead>
                        <tr>
                            <th className=""><MaterialIcon icon="check_box" className="align-bottom" color="primary"/>
                            </th>
                            <th>{t('table.name')}</th>
                            <th>{t("table.type")}</th>
                            <th>{t('table.size')}</th>
                            <th>{t('table.actions')}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {mediaContext.mediaFiles.map(value =>
                            <MediaItem file={value} onSelected={toggleSelection} key={value.name}
                                       selected={selectedMedia.has(value.name)}/>,
                        )}
                        </tbody>
                    </Table>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={hide}>{t('closeButton')}</Button>
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

    const mediaContext = useContext(MediaContext);

    const handleDelete = useCallback(() => {
        mediaContext.removeMediaFiles(file.name);
    }, [file.name, mediaContext.removeMediaFiles]);

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
