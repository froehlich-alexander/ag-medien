import React, {useCallback, useContext} from 'react';
import {Button, ButtonGroup, CloseButton, Form, FormControl, InputGroup, Modal, Table} from "react-bootstrap";
import TourContext from "./TourContext";
import {formatFileSize} from "./utils";

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

    return (
        <Modal show={context.mediaDialogVisibility} onHide={hide} onShow={show} size="lg">
            <Modal.Header closeButton={true}>
                <Modal.Title>Media</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <ButtonGroup>
                        <Button variant="primary" as="label" htmlFor="add-files">Add Files</Button>
                        <Button variant="danger">Delete all</Button>
                    </ButtonGroup>
                    <FormControl type="file" id="add-files" hidden={true}></FormControl>

                    <Table>
                        <thead>
                        <tr>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Size</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {context.mediaFiles.map(value => {
                            return (<tr>
                                <td><code>{value.name}</code></td>
                                <td>{value.type}</td>
                                <td>{formatFileSize(value.size, true)}</td>
                            </tr>);
                        })}
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

export default MediaDialog;
