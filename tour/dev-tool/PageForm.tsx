import classNames from "classnames";
import {valHooks} from "jquery";
import React, {ChangeEvent, useContext, useEffect, useState} from "react";
import {Col, Form, FormControl, FormGroup, InputGroup, Row} from "react-bootstrap";
import {PageData, PageDataType} from "../js/Data";
import {MediaForm} from "./MediaForm";
import TourContext from "./TourContext";
import {DefaultProps} from "./utils";

interface PageFormProps extends DefaultProps {
    hasChanged: (hasChanged: boolean) => any,
}

export default function PageForm(
    {
        className,
        hasChanged,
    }: PageFormProps,
) {

    const context = useContext(TourContext);

    const currentPage = context.currentPage!;
    const [page, setPage] = useState(currentPage);

    // inputs
    const [id, setId] = useState(currentPage.id);
    const [initialDirection, setInitialDirection] = useState(currentPage.initialDirection);
    const [is360, set360] = useState(currentPage.is360);
    const [isPanorama, setPanorama] = useState(currentPage.isPanorama);
    const [media, setMedia] = useState(currentPage.media);
    const [inlineObjects, setInlineObjects] = useState(currentPage.inlineObjects);

    // reset on current page change
    useEffect(() => {
        setMedia(currentPage.media);
        setInlineObjects(currentPage.inlineObjects);
        setId(currentPage.id);
        setInitialDirection(currentPage.initialDirection);
        set360(currentPage.is360);
        setPanorama(currentPage.isPanorama);
    }, [currentPage]);

    // set has changed
    useEffect(() => {
        hasChanged(
            new PageData({
                media: media,
                inlineObjects: inlineObjects,
                id: id,
                initialDirection: initialDirection,
                is360: is360,
                isPanorama: isPanorama,
            }).equals(currentPage)
        );
    }, [currentPage, media, inlineObjects, id, initialDirection, is360, isPanorama]);

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
        const name = event.target.name as keyof PageDataType;
        const value = event.target.value as PageDataType[typeof name];
        setPage(page.withUpdate({[name]: value}));
    }

    function handleId(event: ChangeEvent<HTMLInputElement>) {
        setId(event.target.value);
    }

    function handleInitialDirection(event: ChangeEvent<HTMLInputElement>) {
        let value = parseFloat(event.target.value);
        if (Number.isNaN(value)) {
            value = 0;
        }
        setInitialDirection(Math.max(0, Math.min(value, 100)));
    }

    function handle360(event: ChangeEvent<HTMLInputElement>) {
        const value = event.target.checked;
        set360(value);
        if (value) {
            setPanorama(true);
        }
    }

    function handlePanorama(event: ChangeEvent<HTMLInputElement>) {
        const value = event.target.checked;
        setPanorama(value);
        if (!value) {
            set360(false);
        }
    }

    return (
        <div className={classNames("pt-4 pb-4", className)}>
            <Form className={"gy-3 gx-4 row"}>
                <InputGroup className={"col-12"}>
                    <InputGroup.Text as="label"
                                     htmlFor="i-id">Id</InputGroup.Text>
                    <Form.Control id="i-id" type="text" value={id} onChange={handleId}/>
                </InputGroup>
                <InputGroup className={"col-12"}>
                    <InputGroup.Text as="label" className={""}
                                     htmlFor="i-initial-direction">Initial Direction</InputGroup.Text>
                    <Col sm={2} className={"me-2"}>
                        <Form.Control id="i-initial-direction" min={0} max={100} type="number"
                                      value={initialDirection} onChange={handleInitialDirection}/>
                    </Col>
                    <Form.Range id="i-initial-direction-range" min={0} max={100}
                                className={"col align-self-center"}
                                value={initialDirection} onChange={handleInitialDirection}/>
                </InputGroup>
                <Col sm={"auto"}>
                    <InputGroup>
                        <InputGroup.Text as="label"
                                         htmlFor="i-panorama">Panorama</InputGroup.Text>
                        <InputGroup.Checkbox id="i-panorama" checked={isPanorama} onChange={handlePanorama}/>
                    </InputGroup>
                </Col>

                <Col sm={"auto"}>
                    <InputGroup>
                        <InputGroup.Text as="label"
                                         htmlFor="i-360">360 Grad</InputGroup.Text>
                        <InputGroup.Checkbox id="i-360" checked={is360} onChange={handle360}/>
                    </InputGroup>
                </Col>

                <MediaForm media={media} onMediaChange={setMedia}/>
            </Form>
        </div>
    );
};
