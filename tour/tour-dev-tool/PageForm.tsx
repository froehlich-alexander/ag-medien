import classNames from "classnames";
import React, {ChangeEvent, useCallback, useContext, useEffect, useMemo} from "react";
import {Button, ButtonGroup, Col, Form, FormControl, FormText, InputGroup, Row} from "react-bootstrap";
import {useTranslation} from "react-i18next";
import {InlineObjectData, MediaData, PageData} from "../Data";
import InlineObjectContainerForm from "./InlineObjectContainerForm";
import {MediaForm} from "./MediaForm";
import {FormContext, PageContext} from "./TourContexts";
import {DefaultProps} from "./utils";

interface PageFormProps extends DefaultProps {
    onChange: (page: PageData) => void,
    onRenamePageIdUsagesChange: (value: boolean)=>void,
}

export default function PageForm(
    {
        className,
        onChange,
        onRenamePageIdUsagesChange,
    }: PageFormProps,
) {

    const pageContext = useContext(PageContext);
    const formContext = useContext(FormContext);
    const {t} = useTranslation("mainPage", {keyPrefix: 'pageForm'});
    const {t: tGlob} = useTranslation("translation");

    const page = formContext.page!;

    const handleId = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        const newId = event.target.value;
        if (page.id !== newId) {
            onChange(page.withId(newId));
            // if (renamePageIdUsages) {
            //     renameAddressableId(page.id, newId, pageContext.pages);
            // }
        }
    }, [page, onChange, pageContext.pages]);

    const handleRenamePageIdUsagesChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        onRenamePageIdUsagesChange(event.target.checked);
    }, []);

    const handleInitialDirection = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        let value = parseFloat(event.target.value);
        if (Number.isNaN(value)) {
            value = 0;
        }
        onChange(page.withInitialDirection(Math.max(0, Math.min(value, 100))));
    }, [page, onChange]);

    const handle360 = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.checked;
        onChange(page.withIs360(value));
    }, [page, onChange]);

    function handlePanorama(event: ChangeEvent<HTMLInputElement>) {
        const value = event.target.checked;
        onChange(page.withIsPanorama(value));
    }

    const handleMediaChange = useCallback((media: MediaData) => {
        onChange(page.withMedia(media));
    }, [page, onChange]);

    const handleInlineObjectsChange = useCallback((inlineObjects: InlineObjectData[]) => {
        onChange(page.withInlineObjects(inlineObjects));
    }, [page, onChange]);

    const disablePanorama: boolean = useMemo(() =>
            !(page.media.allTypes().includes("img") || page.media.allTypes().includes('video')),
        [page.media]);

    useEffect(() => {
        if (disablePanorama) {
            onChange(page.withIsPanorama(false));
        }
    }, [disablePanorama, page, onChange]);

    const idPattern: string = useMemo(() => {
        // https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/pattern --- implicit surrounded by ^(?:PATTERN)$
        // must be different from other id except own id
        // only a-zA-Z0-9-_ are allowed
        // ^(?!(xxx|xx)$) return false if tested with xxx or xx , BUT it does not match anything. That's because we need the [a-z...]* at the end
        return `^${pageContext.currentPage?.id ?? ''}$|^(?!(${pageContext.pages.map(v => v.id).join('|')})$)[a-zA-Y0-9-_]*`;
    }, [pageContext.pages, pageContext.currentPage?.id]);

    return (
        <div className={classNames("pt-4 pb-4", className)}>
            <Form className={"gy-3 gx-4 row row-cols-12"} validated={true} onSubmit={formContext.save}
                  action="javascript:void(0)">
                <h3 className="mx-auto">{page.id}</h3>
                <InputGroup>
                    <InputGroup.Text as="label"
                                     htmlFor="i-id">{t('id.label')}</InputGroup.Text>
                    <Form.Control id="i-id" type="text" value={page.id} onChange={handleId} pattern={idPattern}/>
                    <InputGroup.Text>{t('id.renameUsages')}</InputGroup.Text>
                    <FormControl.Feedback type="invalid">{t('id.invalidFeedback')}</FormControl.Feedback>
                    <InputGroup.Checkbox checked={formContext.renamePageIdUsages} onChange={handleRenamePageIdUsagesChange}/>
                </InputGroup>
                <Col sm={12}>
                    <Row>
                        <Col sm="auto">
                            <InputGroup className="">
                                <InputGroup.Text as="label"
                                                 htmlFor="i-initial-direction">{t("initialDirection")}</InputGroup.Text>
                                <Form.Control id="i-initial-direction" min={0} max={100}
                                              type="number" disabled={!page.isPanorama}
                                              value={page.initialDirection} onChange={handleInitialDirection}/>
                            </InputGroup>
                        </Col>
                        <Col className="d-flex align-items-center">
                            <Form.Range id="i-initial-direction-range" min={0} max={100}
                                        className="col align-self-center" disabled={!page.isPanorama}
                                        value={page.initialDirection} onChange={handleInitialDirection}/>
                        </Col>
                    </Row>
                </Col>
                <Col sm="auto">
                    <InputGroup>
                        <InputGroup.Text as="label"
                                         htmlFor="i-panorama">{t('panorama')}</InputGroup.Text>
                        <InputGroup.Checkbox id="i-panorama" checked={page.isPanorama}
                                             onChange={handlePanorama} disabled={disablePanorama}/>
                    </InputGroup>
                </Col>

                <Col sm="auto">
                    <InputGroup>
                        <InputGroup.Text as="label"
                                         htmlFor="i-360">{t('360Deg.label')}</InputGroup.Text>
                        <InputGroup.Checkbox id="i-360" checked={page.is360} onChange={handle360}
                                             disabled={disablePanorama}/>
                    </InputGroup>
                </Col>
                <FormText hidden={!disablePanorama} className="text-info">{t('360Deg.text')}</FormText>

                <MediaForm media={page.media} onMediaChange={handleMediaChange}/>
                <InlineObjectContainerForm inlineObjects={page.inlineObjects} onChange={handleInlineObjectsChange}/>
                <Col sm={4}>
                    <ButtonGroup>
                        <Button type="submit" variant="primary">{tGlob('save')}</Button>
                        <Button variant="secondary" onClick={formContext.reset}>{tGlob('cancel')}</Button>
                    </ButtonGroup>
                </Col>
            </Form>
        </div>
    );
};
