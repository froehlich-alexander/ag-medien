// @flow
import {useContext} from "react";
import * as React from "react";
import {Button, CloseButton, Container, Nav, Navbar, NavbarBrand, NavItem} from "react-bootstrap";
import NavbarHeader from "react-bootstrap/lib/NavbarHeader";
import TourContext from "./TourContext";

type Props = {};

export function MyNavBar(props: Props) {
    const context = useContext(TourContext);

    return (
        <Navbar variant="light" bg="light" expand="lg">
            <Container>
                <Navbar.Brand>
                    Schultour Developer Tool
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="navbar-collapse" />
                <Navbar.Collapse id="navbar-collapse">
                    <Nav className="me-auto">
                        <Nav.Link key="load">
                            Load
                        </Nav.Link>
                        <Nav.Link key="download">
                            Download
                        </Nav.Link>
                    </Nav>
                </Navbar.Collapse>
                <CloseButton className="ms-auto"/>
            </Container>
        </Navbar>
    );
}