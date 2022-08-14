
import classNames from "classnames";
import {useCallback, useContext} from "react";
import * as React from "react";
import {Button, CloseButton, Container, Nav, Navbar, NavbarBrand, NavItem} from "react-bootstrap";
import NavbarHeader from "react-bootstrap/lib/NavbarHeader";
import TourContext from "./TourContext";
import {DefaultProps} from "./utils";

interface Props extends DefaultProps {
}

export function MyNavBar({className}: Props) {
    const context = useContext(TourContext);

    const showImportDialog = useCallback(() => {
            context.setImportDialogVisibility(true);
        },
        [context.setImportDialogVisibility]);

    const showMediaDialog = useCallback(() => {
            context.setMediaDialogVisibility(true);
        },
        [context.setMediaDialogVisibility]);

    return (
        <Navbar variant="light" bg="light" expand="lg" className={classNames(className, 'rounded-2')}>
            <Container fluid>
                <Navbar.Brand>
                    Schultour Developer Tool
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="navbar-collapse"/>
                <Navbar.Collapse id="navbar-collapse">
                    <Nav className="me-auto">
                        <Nav.Link key="load" active={context.importDialogVisibility} onClick={showImportDialog}>
                            Load
                        </Nav.Link>
                        <Nav.Link key="download">
                            Download
                        </Nav.Link>
                        <Nav.Link key='media' active={context.mediaDialogVisibility} onClick={showMediaDialog}>
                            Media
                        </Nav.Link>
                    </Nav>
                </Navbar.Collapse>
                <CloseButton className="ms-auto"/>
            </Container>
        </Navbar>
    );
}
