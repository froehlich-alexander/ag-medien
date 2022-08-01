import classNames from "classnames";
import React, {ChangeEvent, useContext, useState} from "react";
import {Form, FormControl, InputGroup} from "react-bootstrap";
import {PageData, PageDataType} from "./Data";
import TourContext from "./TourContext";
import {DefaultProps} from "./utils";

interface PageFormProps extends DefaultProps {

}

export default function PageForm(
    {
        className,
    }: PageFormProps,
) {

    const context = useContext(TourContext);
    const currentPage = context.currentPage;
    const [page, setPage] = useState(currentPage);
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
        setInitialDirection(event.target.value);
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
        <div className={classNames("pt-2 pb-2", className)}>
            <form className={"gx-3"}>
                <InputGroup>
                    <InputGroup.Text as="label"
                                     htmlFor="i-id">Id</InputGroup.Text>
                    <FormControl id="i-id" value={id} onChange={handleId}/>
                </InputGroup>
                <InputGroup>
                    <InputGroup.Text as="label"
                                     htmlFor="i-initial-direction">Initial Direction</InputGroup.Text>
                    <FormControl id="i-initial-direction" value={initialDirection} onChange={handleInitialDirection}/>
                </InputGroup>
                <InputGroup>
                    <InputGroup.Text as="label"
                                     htmlFor="i-panorama">Panorama</InputGroup.Text>
                    <Form.Switch id="i-panorama" checked={isPanorama} onChange={handlePanorama}/>
                </InputGroup>

                <InputGroup>
                    <InputGroup.Text as="label"
                                     htmlFor="i-360">360 Grad</InputGroup.Text>
                    <Form.Switch id="i-360" checked={is360} onChange={handle360}/>
                </InputGroup>
            </form>
        </div>
    );
};
