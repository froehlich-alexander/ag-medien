// @flow
import {useContext} from "react";
import * as React from "react";
import {CloseButton, Container, Nav, Navbar} from "react-bootstrap";
import NavbarHeader from "react-bootstrap/lib/NavbarHeader";
import TourContext from "./TourContext";

type Props = {};

export function MyNavBar(props: Props) {
    const context = useContext(TourContext);

    return (
        <Navbar variant={"dark"} bg="dark">
            <Container fluid>
                <Navbar.Brand>
                    Schultour Developer Tool
                </Navbar.Brand>
                <Nav>
                    <ul>
                    </ul>
                </Nav>
                <CloseButton className="ms-auto" variant={"white"}/>
            </Container>
        </Navbar>
    );
}