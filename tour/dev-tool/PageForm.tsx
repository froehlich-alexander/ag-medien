import classNames from "classnames";
import React, {ChangeEvent, useCallback, useContext, useEffect, useMemo, useState} from "react";
import {Col, Form, FormText, InputGroup, Row} from "react-bootstrap";
import {MediaData, PageData, PageDataType} from "../js/Data";
import {renameAddressableId} from "../js/refactor-data";
import InlineObjectContainerForm from "./InlineObjectContainerForm";
import InlineObjectForm from "./InlineObjectForm";
import {MediaForm} from "./MediaForm";
import {PageContext} from "./TourContexts";
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

    const pageContext = useContext(PageContext);

    const currentPage = pageContext.currentPage!;
    const [page, setPage] = useState(currentPage);
    const [renamePageIdUsages, setRenamePageIdUsages] = useState(true);

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
            }).equals(currentPage),
        );
    }, [currentPage, media, inlineObjects, id, initialDirection, is360, isPanorama]);

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
        const name = event.target.name as keyof PageDataType;
        const value = event.target.value as PageDataType[typeof name];
        setPage(page.withUpdate({[name]: value}));
    }

    const handleId = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        const newId = event.target.value;
        if (id !== newId) {
            setId(newId);
            if (renamePageIdUsages) {
                renameAddressableId(id, newId, pageContext.pages);
            }
        }
    }, [setId, id]);

    const handleRenamePageIdUsagesChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setRenamePageIdUsages(event.target.checked);
    }, []);

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

    const handleMediaChange = useCallback((media: MediaData) => {
        setMedia(media);
    }, []);

    const disablePanorama: boolean = useMemo(() =>
            !(media.allTypes().includes("img") || media.allTypes().includes('video')),
        [media]);

    useEffect(() => {
        if (disablePanorama) {
            setPanorama(false);
            set360(false);
        }
    }, [disablePanorama]);

    return (
        <div className={classNames("pt-4 pb-4", className)}>
            <Form className={"gy-3 gx-4 row row-cols-12"}>
                <h3 className="mx-auto">{id}</h3>
                <InputGroup>
                    <InputGroup.Text as="label"
                                     htmlFor="i-id">Id</InputGroup.Text>
                    <Form.Control id="i-id" type="text" value={id} onChange={handleId}/>
                    <InputGroup.Text>Rename usages</InputGroup.Text>
                    <InputGroup.Checkbox checked={renamePageIdUsages} onChange={handleRenamePageIdUsagesChange}/>
                </InputGroup>
                <Col sm={12}>
                    <Row>
                        <Col sm={"auto"}>
                            <InputGroup className="">
                                <InputGroup.Text as="label"
                                                 htmlFor="i-initial-direction">Initial Direction</InputGroup.Text>
                                <Form.Control id="i-initial-direction" min={0} max={100}
                                              type="number" disabled={!isPanorama}
                                              value={initialDirection} onChange={handleInitialDirection}/>
                            </InputGroup>
                        </Col>
                        <Col className="d-flex align-items-center">
                            <Form.Range id="i-initial-direction-range" min={0} max={100}
                                        className={"col align-self-center"} disabled={!isPanorama}
                                        value={initialDirection} onChange={handleInitialDirection}/>
                        </Col>
                    </Row>
                </Col>
                <Col sm="auto">
                    <InputGroup>
                        <InputGroup.Text as="label"
                                         htmlFor="i-panorama">Panorama</InputGroup.Text>
                        <InputGroup.Checkbox id="i-panorama" checked={isPanorama}
                                             onChange={handlePanorama} disabled={disablePanorama}/>
                    </InputGroup>
                </Col>

                <Col sm="auto">
                    <InputGroup>
                        <InputGroup.Text as="label"
                                         htmlFor="i-360">360 Grad</InputGroup.Text>
                        <InputGroup.Checkbox id="i-360" checked={is360} onChange={handle360}
                                             disabled={disablePanorama}/>
                    </InputGroup>
                </Col>
                <FormText hidden={!disablePanorama} className="text-info">
                    Only Pages displaying an Image or a Video can be in panorama or 360 modus.
                </FormText>

                <MediaForm media={media} onMediaChange={handleMediaChange}/>
                <InlineObjectContainerForm inlineObjects={inlineObjects} onChange={setInlineObjects}/>
            </Form>
        </div>
    );
};
