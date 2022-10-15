import React, {ChangeEvent, useCallback} from "react";
import {Form, FormControl, FormSelect, FormText, InputGroup} from "react-bootstrap";
import {useTranslation} from "react-i18next";
import {ClickableData, InlineObjectData, TextFieldData} from "../../../Data";
import {AnimationType, InlineObjectPosition, InlineObjectType} from "../../../types";

export type InputElementProps<T> = {
    inlineObject: T,
    onChange: (newValue: T) => void,
}

export function Hidden({onChange, inlineObject}: InputElementProps<InlineObjectData>) {
    const {t} = useTranslation("mainPage", {keyPrefix: "pageForm.inlineObjectContainerForm.inlineObjectForm.hidden"});

    const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        onChange(inlineObject.withHidden(event.target.checked));
    }, [inlineObject, onChange]);

    return (<>
        <InputGroup>
            <InputGroup.Text as="label" htmlFor="object-hidden">{t("label")}</InputGroup.Text>
            <InputGroup.Checkbox checked={inlineObject.hidden} id="object-hidden" onChange={handleChange} />
            {/*<FormControl.Feedback type="invalid">{t("invalidFeedback")}</FormControl.Feedback>*/}
        </InputGroup>
        <FormText>{t("formText")}</FormText>
    </>);
}

export function XCoordinate({onChange, inlineObject}: InputElementProps<InlineObjectData>) {
    const {t} = useTranslation("mainPage", {keyPrefix: "pageForm.inlineObjectContainerForm.inlineObjectForm.x"});

    const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        onChange(inlineObject.withX(parseFloat(value) || 0));
    }, [inlineObject, onChange]);

    return (<>
        <InputGroup hasValidation>
            <InputGroup.Text as="label" htmlFor="object-x">{t("label")}</InputGroup.Text>
            <FormControl value={inlineObject.x} id="object-x" required type="number"
                         onChange={handleChange} min={0} max={100}
                         step={10 ** -InlineObjectData.CoordinateDigits}/>
            <FormControl.Feedback type="invalid">{t("invalidFeedback")}</FormControl.Feedback>
        </InputGroup>
        <FormText>{t("formText")}</FormText>
    </>);
}

export function YCoordinate({onChange, inlineObject}: InputElementProps<InlineObjectData>) {
    const {t} = useTranslation("mainPage", {keyPrefix: "pageForm.inlineObjectContainerForm.inlineObjectForm.y"});

    const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        onChange(inlineObject.withY(parseFloat(value) || 0));
    }, [inlineObject, onChange]);

    return (
        <InputGroup hasValidation>
            <InputGroup.Text as="label" htmlFor="object-y">{t("label")}</InputGroup.Text>
            <FormControl value={inlineObject.y} id="object-y" required type="number"
                         onChange={handleChange} min={0} max={100}
                         step={10 ** -InlineObjectData.CoordinateDigits}/>
            <FormControl.Feedback type="invalid">{t("invalidFeedback")}</FormControl.Feedback>
        </InputGroup>
    );
}

export function Type({onChange, inlineObject}: InputElementProps<InlineObjectData>) {
    const {t} = useTranslation("mainPage", {keyPrefix: "pageForm.inlineObjectContainerForm.inlineObjectForm.type"});

    const handleChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        // @ts-ignore
        onChange(new (InlineObjectData.constructorFromType(value as InlineObjectType))(inlineObject.withType(value)));
    }, [inlineObject, onChange]);

    return (
        <InputGroup>
            <InputGroup.Text as="label" htmlFor="object-type">{t("label")}</InputGroup.Text>
            <FormSelect value={inlineObject.type} id="object-type" required
                        onChange={handleChange}>
                {InlineObjectData.Types.map(name =>
                    <option key={name} value={name}>{name}</option>,
                )}
            </FormSelect>
        </InputGroup>
    );
}

export function Position({onChange, inlineObject}: InputElementProps<InlineObjectData>) {
    const {t} = useTranslation("mainPage", {keyPrefix: "pageForm.inlineObjectContainerForm.inlineObjectForm.position"});

    const handleChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        onChange(inlineObject.withPosition(value as InlineObjectPosition));
    }, [inlineObject, onChange]);

    return (<>
        <InputGroup>
            <InputGroup.Text as="label" htmlFor="object-position">{t("label")}</InputGroup.Text>
            <FormSelect value={inlineObject.position} id="object-position" required
                        onChange={handleChange}>
                {InlineObjectData.Positions.map(pos =>
                    <option key={pos} value={pos}>{pos}</option>,
                )}
            </FormSelect>
        </InputGroup>
        <FormText>{t("text", {context: inlineObject.position})}</FormText>
    </>);
}

export function AnimationTypeInput({onChange, inlineObject}: InputElementProps<InlineObjectData>) {
    const {t} = useTranslation("mainPage", {keyPrefix: "pageForm.inlineObjectContainerForm.inlineObjectForm.animationType"});
    const {t: tAnimations} = useTranslation("tourTypes", {keyPrefix: "animationTypes"});

    const handleChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        onChange(inlineObject.withAnimationType(value as AnimationType));
    }, [inlineObject, onChange]);

    return (
        <InputGroup>
            <InputGroup.Text as="label"
                             htmlFor="object-animation">{t("label")}</InputGroup.Text>
            <FormSelect value={inlineObject.animationType ?? "forward"} id="object-animation" required
                        onChange={handleChange}>
                {InlineObjectData.AnimationTypes.map(animationType =>
                    <option key={animationType} value={animationType}>{tAnimations(animationType)}</option>,
                )}
            </FormSelect>
        </InputGroup>
    );
}

export function Title({onChange, inlineObject}: InputElementProps<ClickableData | TextFieldData>) {
    const {t} = useTranslation("mainPage", {keyPrefix: "pageForm.inlineObjectContainerForm.inlineObjectForm.title"});

    // clickable + text field
    const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        onChange(inlineObject.withTitle(value));
    }, [inlineObject, onChange]);

    return (
        <InputGroup>
            <InputGroup.Text as="label" htmlFor="object-title">{t("label")}</InputGroup.Text>
            <FormControl value={inlineObject.title} id="object-title" required type="text"
                         onChange={handleChange}/>
        </InputGroup>
    );
}
