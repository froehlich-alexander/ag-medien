import React, {ChangeEvent, useCallback, useContext} from 'react';
import {Button, Col, Container, FormControl, FormSelect, FormText, InputGroup, Row} from "react-bootstrap";
import {Trans, useTranslation} from "react-i18next";
import {MediaData, SourceData} from "../Data";
import {MediaType} from "../types";
import {DialogContext, MediaContext} from "./TourContexts";

type SourceFormProps = {
    source: SourceData | undefined,
    onSourceChange: (source: SourceData | undefined) => void,
    mediaNotExistent: boolean,
}

function SourceForm({source, onSourceChange, mediaNotExistent}: SourceFormProps) {
    const mediaContext = useContext(MediaContext);
    const dialogContext = useContext(DialogContext);
    const {t} = useTranslation("mainPage", {keyPrefix: 'pageForm.mediaForm.sourceForm'});

    const handleNameChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
        const eventValue = event.target.value;
        if (eventValue === 'undefined') {
            onSourceChange(undefined);
            return;
        }
        const media = mediaContext.mediaFiles.find(value => value.name === eventValue)!;
        onSourceChange(SourceData.fromFileData(media));
        // onSourceChange(source!.withUpdate({
        //     name: media.name,
        //     type: media.type,
        //     width: media.intrinsicWidth,
        //     height: media.intrinsicHeight,
        // }));
    }, [onSourceChange, mediaContext.mediaFiles]);

    const handleTypeChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
        onSourceChange(source!.withType(event.target.value as MediaType));
    }, [source, onSourceChange]);

    const handleWidthChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        onSourceChange(source!.withUpdate({
            width: parseInt(event.target.value) || undefined,
        }));
    }, [source, onSourceChange]);

    const handleHeightChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        onSourceChange(source!.withUpdate({
            height: parseInt(event.target.value) || undefined,
        }));
    }, [source, onSourceChange]);

    const handleDelete = useCallback(() => {
        onSourceChange(undefined);
    }, [onSourceChange]);

    const setOptimalWidth = useCallback(() => {
        console.log('optimal width', source!.file, source!.file?.intrinsicWidth, source!.width);
        if (source!.file?.intrinsicWidth) {
            onSourceChange(source!.withWidth(source!.file.intrinsicWidth));
        }
    }, [onSourceChange, source]);

    const setOptimalHeight = useCallback(() => {
        if (source!.file?.intrinsicHeight) {
            onSourceChange(source!.withHeight(source!.file.intrinsicHeight));
        }
    }, [onSourceChange, source]);

    return (
        <Container>
            <Row className="row-cols-12 gy-2 gx-3">
                <Col sm={12} className="row">
                    <Col>
                        <InputGroup>
                            <InputGroup.Text as="label" htmlFor="source-name">{t('name.label')}</InputGroup.Text>
                            <FormSelect value={source?.name ?? 'undefined'} id="source-name" required
                                        onChange={handleNameChange} isInvalid={mediaNotExistent}>
                                <option value="undefined">--- Select a file ---</option>
                                {mediaNotExistent && <option value={source!.name} disabled>{source!.name}</option>}
                                {mediaContext.mediaFiles.map(value =>
                                    <option key={value.name} value={value.name}>{value.name}</option>)}
                            </FormSelect>
                            <FormControl.Feedback type="invalid">{/*hidden={!mediaNotExistent}>*/}
                                <Trans ns="mainPage" i18nKey={'pageForm.mediaForm.sourceForm.name.notFound'}>
                                    Could not find this media file: <code>{{file: source?.name}}</code>.
                                    Please add it in the &ensp;
                                    <a className="link-primary" onClick={dialogContext.showMediaDialog} href="#">Media Dialog</a>
                                </Trans>
                            </FormControl.Feedback>
                        </InputGroup>
                    </Col>

                    <Col sm="auto">
                        <InputGroup>
                            <InputGroup.Text as="label" htmlFor="source-type">{t('type.label')}</InputGroup.Text>
                            <FormSelect value={source?.type ?? "undefined"} id="source-type" required
                                        onChange={handleTypeChange}
                                        disabled={!source}>
                                <option disabled value="undefined">--- {t('type.emptyOption')} ---</option>
                                {MediaData.Types.map(name =>
                                    <option key={name} value={name}>{name}</option>,
                                )}
                            </FormSelect>
                        </InputGroup>
                    </Col>
                </Col>

                <div className="text-info mt-2">
                    <Trans ns="mainPage" i18nKey={'pageForm.mediaForm.sourceForm.sizeInfo'}>
                        If you set the size of the media here,
                        the script will know the actual size of the media even before it's fully loaded.
                        Then the user won't see any resizing when the media is loaded.<br/>
                        The sizes you set here are intrinsic (natural) sizes and for images
                        and videos it is recommended to leave them as they are,
                        because this application automatically reads the sizes from the image- or video-file.
                        That is not possible with media objects like iframes.
                    </Trans>
                </div>

                <Col sm={6}>
                    <InputGroup>
                        <InputGroup.Text as="label" htmlFor="source-width">{t('width.label')}</InputGroup.Text>
                        <FormControl type="number" value={source?.width} id="source-width" placeholder="not set"
                                     onChange={handleWidthChange} disabled={!source}
                                     min={0} max={source?.file?.intrinsicWidth ?? undefined}/>
                        <Button variant="info" onClick={setOptimalWidth} disabled={!source?.file}>Optimal</Button>
                        <FormControl.Feedback type="invalid">{t('width.invalidFeedback')}</FormControl.Feedback>
                        {/*null == undefined == 0 is intended*/}
                        {source?.width != source?.file?.intrinsicWidth && <Col sm={12} className="text-warning">
                            <Trans ns="mainPage"
                                   i18nKey={"pageForm.mediaForm.sourceForm.width.notEqualsInitialWarning"}>
                                <samp>{{width: source?.width}}</samp> != the intrinsic width
                                <samp>{{intrinsicWidth: source?.file?.intrinsicWidth}}</samp>
                            </Trans>
                        </Col>}
                    </InputGroup>
                </Col>

                <Col sm={6}>
                    <InputGroup>
                        <InputGroup.Text as="label" htmlFor="source-height">{t('height.label')}</InputGroup.Text>
                        <FormControl type="number" value={source?.height} id="source-height" placeholder="not set"
                                     onChange={handleHeightChange} disabled={!source}
                                     min={0} max={source?.file?.intrinsicWidth ?? undefined}/>
                        <Button variant="info" onClick={setOptimalHeight} disabled={!source?.file}>Optimal</Button>
                        <FormControl.Feedback type="invalid">{t('height.invalidFeedback')}</FormControl.Feedback>
                        {/*null == undefined == 0 is intended*/}
                        {source?.height != source?.file?.intrinsicHeight && <Col sm={12} className="text-warning">
                            <Trans ns="mainPage"
                                   i18nKey={"pageForm.mediaForm.sourceForm.height.notEqualsInitialWarning"}>
                                <samp>{{height: source?.height}}</samp> != the intrinsic height
                                <samp>{{intrinsicHeight: source?.file?.intrinsicHeight}}</samp>
                            </Trans>
                        </Col>}
                    </InputGroup>
                </Col>
                <Col sm={"auto"}>
                    <Button variant="danger" disabled={!source} onClick={handleDelete}>{t("deleteButton")}</Button>
                </Col>
            </Row>
        </Container>
    );
}

export default SourceForm;
