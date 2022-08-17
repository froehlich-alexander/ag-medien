import React, {ChangeEvent, useCallback, useContext} from 'react';
import {
    Button,
    Col,
    Container,
    FormControl,
    FormSelect,
    FormText,
    InputGroup,
    Row,
} from "react-bootstrap";
import {MediaData, SourceData} from "../js/Data";
import {MediaType} from "../js/types";
import {DialogContext, MediaContext} from "./TourContexts";

type SourceFormProps = {
    source: SourceData | undefined,
    onSourceChange: (source: SourceData | undefined) => void,
}

function SourceForm({source, onSourceChange}: SourceFormProps) {
    const mediaContext = useContext(MediaContext);
    const dialogContext = useContext(DialogContext);

    const handleNameChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
        const eventValue = event.target.value;
        if (eventValue === 'undefined') {
            onSourceChange(undefined);
            return;
        }
        const media = mediaContext.mediaFiles.find(value => value.name === eventValue)!;
        (async () => {
            onSourceChange(await SourceData.fromFileData(media));
        })();
        // onSourceChange(source!.withUpdate({
        //     name: media.name,
        //     type: media.type,
        //     width: media.intrinsicWidth,
        //     height: media.intrinsicHeight,
        // }));
    }, [source, onSourceChange, mediaContext.mediaFiles]);

    const handleTypeChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
        onSourceChange(source!.withType(event.target.value as MediaType));
    }, [source, onSourceChange]);

    const handleWidthChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        onSourceChange(source!.withUpdate({
            width: event.target.value ? parseInt(event.target.value) : undefined,
        }));
    }, [source, onSourceChange]);

    const handleHeightChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        onSourceChange(source!.withUpdate({
            height: event.target.value ? parseInt(event.target.value) : undefined,
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

    const mediaNotExistent: boolean = source != null && mediaContext.mediaFiles.find(v => v.name === source.name) === undefined;

    return (
        <Container>
            <Row className="row-cols-12 gy-2 gx-3">
                <InputGroup>
                    <InputGroup.Text as="label" htmlFor="source-name">Name</InputGroup.Text>
                    <FormSelect value={source?.name ?? 'undefined'} id="source-name" required
                                onChange={handleNameChange}>
                        <option value="undefined">--- Select a file ---</option>
                        {mediaNotExistent && <option value={source!.name} disabled>{source!.name}</option>}
                        {mediaContext.mediaFiles.map(value =>
                            <option key={value.name} value={value.name}><code>{value.name}</code></option>)}
                    </FormSelect>
                </InputGroup>
                <FormText className="text-danger" hidden={!mediaNotExistent}>
                    Could not find this media file: <code>{source?.name}</code>.
                    Please add it in the &ensp;
                    <a className="link-primary" onClick={dialogContext.showMediaDialog} href="#">Media Dialog</a>
                </FormText>

                <InputGroup>
                    <InputGroup.Text as="label" htmlFor="source-type">Type</InputGroup.Text>
                    <FormSelect value={source?.type ?? "undefined"} id="source-type" required
                                onChange={handleTypeChange}
                                disabled={!source}>
                        <option disabled value="undefined">--- Select a media type ---</option>
                        {MediaData.Types.map(name =>
                            <option key={name} value={name}>{name}</option>,
                        )}
                    </FormSelect>
                </InputGroup>

                <p className="text-info">
                    If you set the size of the media here,
                    the script will know the actual size of the media even before it's fully loaded.
                    Then the user won't see any resizing when the media is loaded.<br/>
                    The sizes you set here are intrinsic (natural) sizes and for images
                    and videos it is recommended to leave them as they are,
                    because this application automatically reads the sizes from the image- or video-file.
                    That is not possible with media objects like iframes.
                </p>

                <Col sm={6}>
                    <InputGroup>
                        <InputGroup.Text as="label" htmlFor="source-width">Width</InputGroup.Text>
                        <FormControl type="number" value={source?.width} id="source-width" placeholder="not set"
                                     onChange={handleWidthChange} disabled={!source}
                                     min={0} max={source?.file?.intrinsicWidth ?? undefined}/>
                        <Button variant="info" onClick={setOptimalWidth} disabled={!source?.file}>Optimal</Button>
                        <FormControl.Feedback type="invalid">
                            The Width cannot be higher than the intrinsic width of the media
                        </FormControl.Feedback>
                        {/*null == undefined == 0 is intended*/}
                        {source?.width != source?.file?.intrinsicWidth && <Col sm={12} className="text-warning">
                            {source?.width} != the intrinsic width <var>{source?.file?.intrinsicWidth}</var>
                        </Col>}
                    </InputGroup>
                </Col>

                <Col sm={6}>
                    <InputGroup>
                        <InputGroup.Text as="label" htmlFor="source-height">Height</InputGroup.Text>
                        <FormControl type="number" value={source?.height} id="source-height" placeholder="not set"
                                     onChange={handleHeightChange} disabled={!source}
                                     min={0} max={source?.file?.intrinsicWidth ?? undefined}/>
                        <Button variant="info" onClick={setOptimalHeight} disabled={!source?.file}>Optimal</Button>
                        {/*null == undefined == 0 is intended*/}
                        <FormControl.Feedback type="invalid">
                            The Height cannot be higher than the intrinsic height of the media
                        </FormControl.Feedback>
                        {source?.height != source?.file?.intrinsicHeight && <Col sm={12} className="text-warning">
                            {source?.height} != the intrinsic height <var>{source?.file?.intrinsicHeight}</var>
                        </Col>}
                    </InputGroup>
                </Col>
                <Col sm={"auto"}>
                    <Button variant="danger" disabled={!source} onClick={handleDelete}>Delete</Button>
                </Col>
            </Row>
        </Container>
    );
}

export default SourceForm;
