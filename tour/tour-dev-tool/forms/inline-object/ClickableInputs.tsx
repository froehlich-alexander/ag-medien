import React, {ChangeEvent, useCallback, useContext, useMemo} from "react";
import {FormControl, FormSelect, FormText, InputGroup} from "react-bootstrap";
import {useTranslation} from "react-i18next";
import {ClickableData, InlineObjectData} from "../../../Data";
import {IconType} from "../../../types";
import {getAddressableIds} from "../../refactor-data";
import {PageContext} from "../../TourContexts";
import {InputElementProps} from "./GeneralInlineObjectInputs";

export function Goto({onChange, inlineObject}: InputElementProps<ClickableData>) {
    const {t} = useTranslation("mainPage", {keyPrefix: "pageForm.inlineObjectContainerForm.inlineObjectForm.goto"});
    const pageContext = useContext(PageContext);

    const targetIds: string[] = useMemo(() =>
            getAddressableIds(pageContext.pages),
        [pageContext.pages]);

    const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        onChange(inlineObject.withGoto(value));
    }, [inlineObject, onChange]);

    return (
        <InputGroup>
            <InputGroup.Text as="label" htmlFor="object-goto">{t("label")}</InputGroup.Text>
            <FormControl.Feedback type="invalid">{t("invalidFeedback")}</FormControl.Feedback>
            <datalist id="object-goto-datalist">
                {targetIds.map(id =>
                    <option key={id} value={id}>{id}</option>,
                )}
            </datalist>
            <FormControl value={inlineObject.goto} placeholder="Type to search a target..."
                         id="object-goto"
                         type="text" pattern={"^(" + targetIds.join(")|(") + ")$"}
                         onChange={handleChange} list="object-goto-datalist"/>
        </InputGroup>
    );
}

export function Icon({onChange, inlineObject}: InputElementProps<ClickableData>) {
    const {t} = useTranslation("mainPage", {keyPrefix: "pageForm.inlineObjectContainerForm.inlineObjectForm.icon"});
    const {t: tIconTypes} = useTranslation("tourTypes", {keyPrefix: "IconType"});

    const handleIconChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
        onChange(inlineObject.withIcon(event.target.value as IconType));
    }, [inlineObject, onChange]);

    return (
        <InputGroup>
            <InputGroup.Text as="label" htmlFor="object-icon">{t("label")}</InputGroup.Text>
            <FormSelect value={inlineObject.icon} id="object-icon" required
                        onChange={handleIconChange}>
                {ClickableData.Icons.map(icon =>
                    <option key={icon} value={icon}>{tIconTypes(icon)}</option>,
                )}
            </FormSelect>
        </InputGroup>
    );
}


export function DestinationScroll({onChange, inlineObject}: InputElementProps<ClickableData>) {
    const {t} = useTranslation("mainPage", {keyPrefix: "pageForm.inlineObjectContainerForm.inlineObjectForm.destinationScroll"});
    const pageContext = useContext(PageContext);

    const targetPageCanBePanorama = useMemo(() => {
        for (let page of pageContext.pages) {
            if (page.id === inlineObject.goto) {
                return page.isPanorama;
            }
        }
        return true;
    }, [pageContext.pages]);

    const handleDestinationScrollChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        let value: ClickableData["destinationScroll"] = parseFloat(event.target.value);
        if (Number.isNaN(value)) {
            value = "auto";
        }
        onChange(inlineObject.withDestinationScroll(value));
    }, [inlineObject, onChange]);

    return (<>
        <InputGroup>
            <InputGroup.Text as="label" htmlFor="object-destination-scroll">{t("label")}</InputGroup.Text>
            <FormControl value={inlineObject.destinationScroll ?? null} id="object-destination-scroll"
                         onChange={handleDestinationScrollChange} type={"number"}
                         min={0} max={100} step={InlineObjectData.DestinationScrollDigits} placeholder={t("automatic")}/>
        </InputGroup>
        <FormText>{t("formText")}</FormText>
        {targetPageCanBePanorama && <FormText color={"warning"}>{t("targetNotPanorama")}</FormText>}
    </>);
}

