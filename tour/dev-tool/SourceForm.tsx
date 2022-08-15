import React, {ChangeEvent, useCallback, useContext} from 'react';
import {Button, ButtonGroup, Col, Container, FormControl, FormSelect, InputGroup, Row} from "react-bootstrap";
import {MediaData, SourceData} from "../js/Data";
import {MediaType} from "../js/types";
import TourContext from "./TourContext";

type SourceFormProps = {
    source: SourceData | undefined,
    onSourceChange: (source: SourceData | undefined) => void,
}

function SourceForm({source, onSourceChange}: SourceFormProps) {
    const tourContext = useContext(TourContext);

    const handleNameChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
        const media = tourContext.mediaFiles.find(value => value.name === event.target.value)!;
        onSourceChange(source!.withUpdate({
            name: media.name,
            type: media.type,
            width: media.intrinsicWidth,
            height: media.intrinsicHeight,
        }));
    }, [source, onSourceChange]);

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

    return (
        <Container>
            <Row className="row-cols-12 gy-3">
                <InputGroup>
                    <InputGroup.Text as="label" htmlFor="source-name">Name</InputGroup.Text>
                    <FormSelect value={source?.name} id="source-name" required onChange={handleNameChange}>
                        {tourContext.mediaFiles.map(value =>
                            <option value={value.name}><code>{value.name}</code></option>)}
                    </FormSelect>
                </InputGroup>

                <InputGroup>
                    <InputGroup.Text as="label" htmlFor="source-type">Type</InputGroup.Text>
                    <FormSelect value={source?.type} id="source-type" required onChange={handleTypeChange}
                                disabled={!source}>
                        {MediaData.Types.map(name =>
                            <option value={name}>{name}</option>,
                        )}
                    </FormSelect>
                </InputGroup>

                <InputGroup>
                    <InputGroup.Text as="label" htmlFor="source-width">Width</InputGroup.Text>
                    <FormControl type="text" value={source?.width} id="source-width" placeholder="not set"
                                 pattern="^[0-9]*$" onChange={handleWidthChange} disabled={!source}/>
                    <InputGroup.Text><Button variant="info">Optimal</Button></InputGroup.Text>
                </InputGroup>

                <InputGroup>
                    <InputGroup.Text as="label" htmlFor="source-height">Height</InputGroup.Text>
                    <FormControl type="text" value={source?.height} id="source-height" placeholder="not set"
                                 pattern="^[0-9]*$" onChange={handleHeightChange} disabled={!source}/>
                </InputGroup>
                <Col sm={"auto"}>
                    <Button variant="danger" disabled={!source} onClick={handleDelete}>Delete</Button>
                </Col>
            </Row>
        </Container>
    );
}

export default SourceForm;
