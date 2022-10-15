import React, {ChangeEvent, useCallback, useContext} from "react";
import {Form, FormControl, FormText, InputGroup} from "react-bootstrap";
import {useTranslation} from "react-i18next";
import {AbstractAddressableInlineObjectData, InlineObjectData} from "../../../Data";
import {FormContext} from "../../TourContexts";
import {InputElementProps} from "./GeneralInlineObjectInputs";


export function Id(
    {onChange, inlineObject, originalInlineObject}:
        InputElementProps<AbstractAddressableInlineObjectData>
        & { originalInlineObject: AbstractAddressableInlineObjectData | undefined },
) {
    const {t} = useTranslation("mainPage", {keyPrefix: "pageForm.inlineObjectContainerForm.inlineObjectForm.id"});
    const formContext = useContext(FormContext);

    const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        onChange(inlineObject.withId(event.target.value));
    }, [inlineObject, onChange]);

    return (<>
        <InputGroup hasValidation>
            <InputGroup.Text as="label" htmlFor="object-id">{t("label")}</InputGroup.Text>
            <Form.Control id="i-id" type="text" value={inlineObject.id} onChange={handleChange}
                          pattern={formContext.idPattern(originalInlineObject?.id)}/>
            <FormControl.Feedback type="invalid">{t("invalidFeedback")}</FormControl.Feedback>
        </InputGroup>
    </>);
}
