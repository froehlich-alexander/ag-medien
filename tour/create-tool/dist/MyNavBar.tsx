// @flow
import {useContext} from "react";
import * as React from "react";
import {CloseButton, Nav, Navbar} from "react-bootstrap";
import NavbarHeader from "react-bootstrap/lib/NavbarHeader";
import TourContext from "../TourContext";

type Props = {};

export function MyNavBar(props: Props) {
    const context = useContext(TourContext);

    return (
        <Navbar variant={"dark"}>
            <Nav>
                <Navbar.Brand>
                    Schultour Developer Tool
                </Navbar.Brand>
                <ul>
                </ul>
                <CloseButton className="ms-auto"/>
            </Nav>
        </Navbar>
    );
}