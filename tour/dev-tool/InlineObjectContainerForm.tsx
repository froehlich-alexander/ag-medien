import React, {useCallback, useContext} from "react";
import {Accordion, Button, Col, Container, Row} from "react-bootstrap";
import {InlineObjectData} from "../js/Data";
import InlineObjectForm from "./InlineObjectForm";
import {TemplateContext} from "./TourContexts";
import {MaterialIcon} from "./utils";

type InlineObjectContainerFormProps = {
    inlineObjects: InlineObjectData[],
    onChange: (inlineObjects: InlineObjectData[]) => void,
}
export default function InlineObjectContainerForm({inlineObjects, onChange}: InlineObjectContainerFormProps) {
    const templateContext = useContext(TemplateContext);

    const handleInlineObjectChange = useCallback((inlineObject: InlineObjectData, index: number) => {
        const newInlineObjects = inlineObjects.slice();
        newInlineObjects[index] = inlineObject;
        onChange(newInlineObjects);
    }, [inlineObjects, onChange]);

    const handleAdd = useCallback(() => {
        onChange([...inlineObjects, templateContext.inlineObject]);
    }, [inlineObjects, onChange]);

    return (
        <Container fluid className="mt-3">
            <h4>Inline Objects</h4>
            <Accordion>
                {inlineObjects.map((value, index) => {
                    let label: string;
                    if (value.isClickable() || value.isTextField()) {
                        label = value.title ?? '';
                    } else if (value.isCustom()) {
                        label = value.htmlId;
                    } else {
                        label = '';
                    }

                    return <Accordion.Item eventKey={index.toString()} key={index}>
                        <Accordion.Header>{value.type + " - " + label}</Accordion.Header>
                        <Accordion.Body>
                            <InlineObjectForm inlineObject={value} onChange={handleInlineObjectChange}
                                              index={index}/>
                        </Accordion.Body>
                    </Accordion.Item>;
                })}
            </Accordion>
            <Button className="d-flex align-items-center mt-3" variant="primary" onClick={handleAdd}>
                <MaterialIcon icon="add"/>
                Add
            </Button>
        </Container>
    );
};
