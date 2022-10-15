import React, {useCallback, useContext, useMemo} from "react";
import {Button, Col, Container, Row} from "react-bootstrap";
import {useTranslation} from "react-i18next";
import {AbstractAddressableInlineObjectData, AbstractInlineObjectData, InlineObjectData, PageData} from "../../../Data";
import {Page} from "../../../tour";
import {InlineObjectType} from "../../../types";
import {PageContext} from "../../TourContexts";
import {MaterialIcon} from "../../utils";
import {Id} from "./AddressableInlineObjectInputs";
import {Goto, Icon} from "./ClickableInputs";
import {AnimationTypeInput, Hidden, Position, Title, Type, XCoordinate, YCoordinate} from "./GeneralInlineObjectInputs";
import {Content, CSSClasses, Size} from "./TextFIeldInputs";

type InlineObjectFormProps = {
    inlineObject: InlineObjectData,
    onChange: (inlineObject: InlineObjectData, index: number) => void,
    onDelete: (index: number) => void,
    index: number,
    // the page, this inlineObject is part of
    page: PageData | undefined;
}

export default function InlineObjectForm(
    {inlineObject, onChange: onChangeWithIndex, onDelete, index, page}: InlineObjectFormProps) {
    const {t} = useTranslation("mainPage", {keyPrefix: "pageForm.inlineObjectContainerForm.inlineObjectForm"});
    const {t: tGlob} = useTranslation("translation");

    const onChange = useCallback((inlineObject: AbstractInlineObjectData | AbstractAddressableInlineObjectData | InlineObjectData) => {
        onChangeWithIndex(inlineObject as InlineObjectData, index);
    }, [onChangeWithIndex]);

    const handleDelete = useCallback(() => {
        onDelete(index);
    }, [onDelete, index]);

    const originalInlineObject: InlineObjectData | undefined = useMemo(() => {
        return page?.inlineObjects[index];
    }, [index, page]);

    return (
        <Container>
            <Row className="gy-3 gx-3">
                <Col sm={6}><Type inlineObject={inlineObject} onChange={onChange}/></Col>
                <Col sm={6}><Position inlineObject={inlineObject} onChange={onChange}/></Col>
                <Col sm={6}><XCoordinate inlineObject={inlineObject} onChange={onChange}/></Col>
                <Col sm={6}><YCoordinate inlineObject={inlineObject} onChange={onChange}/></Col>

                {inlineObject.isClickable() && <>
                    <Col sm={6}><Title inlineObject={inlineObject} onChange={onChange}/></Col>
                    <Col sm={6}><Icon inlineObject={inlineObject} onChange={onChange}/></Col>
                    <Col><Goto inlineObject={inlineObject} onChange={onChange}/></Col>
                </>}

                {inlineObject.isTextField() && <>
                    <Col sm={6}><Title inlineObject={inlineObject} onChange={onChange}/></Col>
                    <Col sm={6}><Size inlineObject={inlineObject} onChange={onChange}/></Col>
                    <Col sm={12}><Content inlineObject={inlineObject} onChange={onChange}/></Col>
                    <Col sm={6}><CSSClasses inlineObject={inlineObject} onChange={onChange}/></Col>
                </>}

                {/*<Col sm={6}>*/}
                {inlineObject.isAddressable() && <Col sm={6}><Id inlineObject={inlineObject} onChange={onChange}
                                                                 originalInlineObject={originalInlineObject as AbstractAddressableInlineObjectData}/></Col>}
                <Col sm={"auto"}><AnimationTypeInput inlineObject={inlineObject} onChange={onChange}/></Col>
                <Col sm={"auto"}><Hidden inlineObject={inlineObject} onChange={onChange}/></Col>
                {/*</Col>*/}

                <Col sm={12}>
                    <Button variant="danger" onClick={handleDelete} className={"d-flex"}>
                        <MaterialIcon icon="delete" color="light"/>
                        {tGlob("delete")}
                    </Button>
                </Col>
            </Row>
        </Container>
    );
};

