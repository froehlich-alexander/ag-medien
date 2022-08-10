import React, {useCallback, useContext} from 'react';
import {Button, CloseButton, Modal} from "react-bootstrap";
import TourContext from "./TourContext";

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
        <Modal show={context.mediaDialogVisibility} onHide={hide} >
            <Modal.Header closeButton={true}>
                <Modal.Title>Media</Modal.Title>
            </Modal.Header>
            <Modal.Header></Modal.Header>
            <Modal.Footer>
                <Button variant="secondary" onClick={hide}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default MediaDialog;
