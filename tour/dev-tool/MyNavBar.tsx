import classNames from "classnames";
import * as React from "react";
import {useCallback, useContext} from "react";
import {CloseButton, Container, Nav, Navbar} from "react-bootstrap";
import {DialogContext} from "./TourContexts";
import {DefaultProps} from "./utils";

interface Props extends DefaultProps {
}

export function MyNavBar({className}: Props) {
    const dialogContext = useContext(DialogContext);

    const showImportDialog = useCallback(() => {
            dialogContext.setImportDialogVisibility(true);
        },
        [dialogContext.setImportDialogVisibility]);

    const showMediaDialog = useCallback(() => {
            dialogContext.setMediaDialogVisibility(true);
        },
        [dialogContext.setMediaDialogVisibility]);

    return (
        <Navbar variant="light" bg="light" expand="lg" className={classNames(className, 'rounded-2')}>
            <Container fluid>
                <Navbar.Brand>
                    Schultour Developer Tool
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="navbar-collapse"/>
                <Navbar.Collapse id="navbar-collapse">
                    <Nav className="me-auto">
                        <Nav.Link key="load" active={dialogContext.importDialogVisibility} onClick={showImportDialog}>
                            Load
                        </Nav.Link>
                        <Nav.Link key="download">
                            Download
                        </Nav.Link>
                        <Nav.Link key='media' active={dialogContext.mediaDialogVisibility} onClick={showMediaDialog}>
                            Media
                        </Nav.Link>
                    </Nav>
                </Navbar.Collapse>
                <CloseButton className="ms-auto"/>
            </Container>
        </Navbar>
    );
}
