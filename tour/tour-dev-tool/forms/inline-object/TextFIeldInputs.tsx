// text field input fields
import React from "react";
import {ChangeEvent, useCallback} from "react";
import {FormControl, FormSelect, FormText, InputGroup} from "react-bootstrap";
import {Translation, useTranslation} from "react-i18next";
import {TextFieldData} from "../../../Data";
import {TextFieldSize} from "../../../types";
import {InputElementProps} from "./GeneralInlineObjectInputs";

export function CSSClasses({inlineObject, onChange}: InputElementProps<TextFieldData>) {
    const {t} = useTranslation("mainPage", {keyPrefix: "pageForm.inlineObjectContainerForm.inlineObjectForm.css-classes"});

    const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        onChange(inlineObject.withCssClasses(event.target.value.split(" ")));
    }, [onChange, inlineObject]);

    return (<>
        <InputGroup hasValidation>
            <InputGroup.Text as="label" htmlFor="object-css-classes">{t("label")}</InputGroup.Text>
            <FormControl value={inlineObject.cssClasses.join(" ")} placeholder="CSS classes to style the text"
                         id="object-css-classes" type={"text"} onChange={handleChange}
                         pattern={"([a-zA-Z0-9_-]|\\s)*"}/>
            <FormControl.Feedback type="invalid">{t("invalidFeedback")}</FormControl.Feedback>
        </InputGroup>
        <FormText>{t("formText")}</FormText>
    </>);
}

export function Size({onChange, inlineObject}: InputElementProps<TextFieldData>) {
    const {t} = useTranslation("mainPage", {keyPrefix: "pageForm.inlineObjectContainerForm.inlineObjectForm.size"});
    const {t: tSizes} = useTranslation("tourTypes", {keyPrefix: "textFieldSizes"});

    const handleChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
        onChange(inlineObject.withSize(event.target.value as TextFieldSize));
    }, [onChange, inlineObject]);

    return (
        <InputGroup hasValidation>
            <InputGroup.Text as="label"
                             htmlFor="object-size"> {t("label")}</InputGroup.Text>
            <FormSelect value={inlineObject.size} id="object-size" required onChange={handleChange}>
                {TextFieldData.Sizes.map(size => <option key={size} value={size}>{tSizes(size)}</option>)}
            </FormSelect>
            <FormControl.Feedback type="invalid">{t("invalidFeedback")}</FormControl.Feedback>
        </InputGroup>
    );
}

export function Content({onChange, inlineObject}: InputElementProps<TextFieldData>) {
    const {t} = useTranslation("mainPage", {keyPrefix: "pageForm.inlineObjectContainerForm.inlineObjectForm.content"});

    const handleChange = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
        onChange(inlineObject.withContent(event.target.value));
    }, [onChange, inlineObject]);

    return (
        <InputGroup hasValidation>
            <InputGroup.Text as="label" htmlFor="object-content"> {t("label")}
            </InputGroup.Text>
            <FormControl value={inlineObject.content} placeholder="Some Interesting Content" required
                         id="object-content" type={"textarea"} onChange={handleChange}/>
            <FormControl.Feedback type="invalid"> {t("invalidFeedback")}</FormControl.Feedback>
        </InputGroup>
    );
}
