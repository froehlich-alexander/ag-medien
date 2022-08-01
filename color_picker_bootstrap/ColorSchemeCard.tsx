import {right} from "@popperjs/core";
import React from "react";
import {Button, Card, Col, Container, Tooltip} from "react-bootstrap";
import {ColorScheme} from "./color-base/colorpickerBackend";
import "./styles/ColorPicker.scss"

interface ColorSchemeCardProps {
    // the selected color scheme
    colorScheme: ColorScheme,
    onDelete: () => any,
    onActivate: () => any,
}

export default function ColorSchemeCard(
    {
        colorScheme,
        onDelete,
        onActivate,
    }: ColorSchemeCardProps) {

    return (
        <Card className="ColorSchemeCard">
            <Card.Header>
                <Card.Title>{colorScheme.name}</Card.Title>
            </Card.Header>
            <Card.Body>
                <Card.Subtitle className="Author mb-2">
                    <span className="Label">By</span>
                    <span className="Value">{colorScheme.author}</span>
                </Card.Subtitle>
                <Card.Text className={"Description"}>{colorScheme.description}</Card.Text>
                <Card.Img></Card.Img>
            </Card.Body>
            <Card.Footer>
                <Container>
                    <div className="gx-5 row">
                        <Col sm="auto">
                            <Button variant="success"
                                    key="activate"
                                    disabled={colorScheme.current}
                                    onClick={onActivate}>
                                Activate
                            </Button>
                        </Col>
                        <Col sm="auto">
                            <Button variant="danger"
                                    key="delete"
                                    disabled={colorScheme.current || colorScheme.preDefined}
                                    onClick={onDelete}>
                                Delete
                                <Tooltip placement="right" show={colorScheme.current}>
                                    You cannot delete an activated Color Scheme, select and activate another Color Scheme to proceed
                                </Tooltip>
                                <Tooltip show={colorScheme.preDefined} placement="right">
                                    You can only delete custom Color Schemes, not pre-defined.
                                </Tooltip>
                            </Button>
                        </Col>
                    </div>
                </Container>
            </Card.Footer>
        </Card>
    );
};