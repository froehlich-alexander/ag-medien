import React, {useCallback, useContext} from "react";
import {Accordion, Button, Col, Container, Row} from "react-bootstrap";
import {useTranslation} from "react-i18next";
import {InlineObjectData} from "../Data";
import InlineObjectForm from "./InlineObjectForm";
import {TemplateContext} from "./TourContexts";
import {MaterialIcon} from "./utils";

type InlineObjectContainerFormProps = {
    inlineObjects: InlineObjectData[],
    onChange: (inlineObjects: InlineObjectData[]) => void,
}
export default function InlineObjectContainerForm({inlineObjects, onChange}: InlineObjectContainerFormProps) {
    const templateContext = useContext(TemplateContext);
    const {t} = useTranslation("mainPage", {keyPrefix: 'pageForm.inlineObjectContainerForm'});

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
            <h4>{t('title')}</h4>
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
                        <Accordion.Header>
                            <Row>
                                <Col sm={2}>{value.type}</Col>{label}
                            </Row>
                        </Accordion.Header>
                        <Accordion.Body>
                            <InlineObjectForm inlineObject={value} onChange={handleInlineObjectChange}
                                              index={index}/>
                        </Accordion.Body>
                    </Accordion.Item>;
                })}
            </Accordion>
            <Button className="d-flex align-items-center mt-2" variant="primary" onClick={handleAdd}>
                <MaterialIcon icon="add"/> {t('addButton')}
            </Button>
        </Container>
    );
};
