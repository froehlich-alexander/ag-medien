import classNames from "classnames";
import {valHooks} from "jquery";
import React, {ChangeEvent, useContext, useState} from "react";
import {Col, Form, FormControl, FormGroup, InputGroup, Row} from "react-bootstrap";
import {PageData, PageDataType} from "./Data";
import {MediaForm} from "./MediaForm";
import TourContext from "./TourContext";
import {DefaultProps} from "./utils";

interface PageFormProps extends DefaultProps {
    hasChanged: (hasChanged: boolean)=>any,
}

export default function PageForm(
    {
        className,
        hasChanged,
    }: PageFormProps,
) {

    const context = useContext(TourContext);
    const currentPage = context.currentPage;
    const [page, setPage] = useState(currentPage);

    const [mediaHasChanged, setMediaHasChanged] = useState(false);
    //todo hasChanged

    // inputs
    const [id, setId] = useState(currentPage.id);
    const [initialDirection, setInitialDirection] = useState(currentPage.initialDirection);
    const [is360, set360] = useState(currentPage.is360);
    const [isPanorama, setPanorama] = useState(currentPage.isPanorama);

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
            <form className={"gy-3 gx-4 row"}>
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
                <InputGroup className={"col-6"}>
                    <InputGroup.Text as="label"
                                     htmlFor="i-panorama">Panorama</InputGroup.Text>
                    <Form.Switch id="i-panorama" checked={isPanorama} onChange={handlePanorama}/>
                </InputGroup>

                <InputGroup className={"col-6"}>
                    <InputGroup.Text as="label"
                                     htmlFor="i-360">360 Grad</InputGroup.Text>
                    <Form.Switch id="i-360" checked={is360} onChange={handle360}/>
                </InputGroup>

                <MediaForm media={currentPage.img} onMediaChange={} hasChanged={setMediaHasChanged}/>
            </form>
        </div>
    );
};
