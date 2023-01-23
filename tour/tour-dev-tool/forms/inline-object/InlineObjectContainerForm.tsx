import React, {useCallback, useContext} from "react";
import {Accordion, Button, Col, Container, Row} from "react-bootstrap";
import {useTranslation} from "react-i18next";
import {AbstractInlineObjectData, InlineObjectData} from "../../../Data";
import InlineObjectForm from "./InlineObjectForm";
import {PageContext, TemplateContext} from "../../TourContexts";
import {MaterialIcon} from "../../utils";

type InlineObjectContainerFormProps = {
    inlineObjects: readonly InlineObjectData[],
    onChange: (inlineObjects: InlineObjectData[]) => void,
}
export default function InlineObjectContainerForm({inlineObjects, onChange}: InlineObjectContainerFormProps) {
    const templateContext = useContext(TemplateContext);
    const {t} = useTranslation("mainPage", {keyPrefix: "pageForm.inlineObjectContainerForm"});
    const pageContext = useContext(PageContext);

    const handleInlineObjectChange = useCallback((inlineObject: AbstractInlineObjectData|InlineObjectData, index: number) => {
        const newInlineObjects = inlineObjects.slice();
        newInlineObjects[index] = inlineObject as InlineObjectData;
        onChange(newInlineObjects);
    }, [inlineObjects, onChange]);

    const handleAdd = useCallback(() => {
        onChange([...inlineObjects, templateContext.inlineObject]);
    }, [inlineObjects, onChange]);

    const handleRemove = useCallback((index: number) => {
        onChange(inlineObjects.filter((v, index) => index !== index));
    }, [onChange]);

    return (
        <Container fluid className="mt-3">
            <h4>{t("title")}</h4>
            <Accordion>
                {inlineObjects.map((value, index) => {
                    let label: string;
                    if (value.isClickable() || value.isTextField()) {
                        label = value.title ?? "";
                    } else if (value.isCustom()) {
                        label = value.htmlId;
                    } else {
                        label = "";
                    }

                    return <Accordion.Item eventKey={index.toString()} key={index}>
                        <Accordion.Header>
                           <Container fluid>
                                <Row>
                                    <Col sm={1}>{value.type}</Col>
                                    <Col sm="auto">{label}</Col>
                                </Row>
                           </Container>
                        </Accordion.Header>
                        <Accordion.Body>
                            <InlineObjectForm inlineObject={value} page={pageContext.currentPage} onChange={handleInlineObjectChange}
                                              index={index} onDelete={handleRemove}/>
                        </Accordion.Body>
                    </Accordion.Item>;
                })}
            </Accordion>
            <Button className="d-flex align-items-center mt-2" variant="primary" onClick={handleAdd}>
                <MaterialIcon icon="add"/> {t("addButton")}
            </Button>
        </Container>
    );
};
