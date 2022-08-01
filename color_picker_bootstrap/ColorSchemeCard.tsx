import React from "react";
import {Button, Card, CardGroup, CardImg} from "react-bootstrap";
import {ColorScheme} from "./color-base/colorpickerBackend";

interface ColorSchemeCardProps {
    colorScheme: ColorScheme,
    selectedColorScheme: ColorScheme, // we need it to disable the right buttons, change their tooltips, etc.
    onDelete: () => any,
    onActivate: () => any,
}

export default function ColorSchemeCard(
    {
        colorScheme,
        onDelete,
        onActivate,
        selectedColorScheme,
    }: ColorSchemeCardProps) {

    return (
        <Card>
            <Card.Header>
                <Card.Title>{colorScheme.name}</Card.Title>
            </Card.Header>
            <Card.Body>
                <Card.Text>By <span className="text-reset">{colorScheme.author}</span></Card.Text>
                <Card.Text>{colorScheme.description}</Card.Text>
                <Card.Img></Card.Img>
            </Card.Body>
                <Card.Footer>
                    <Button variant="success" onClick={onActivate}>Activate</Button>
                    <Button variant="danger" onClick={onDelete}>Delete</Button>
                </Card.Footer>
        </Card>
    );
};