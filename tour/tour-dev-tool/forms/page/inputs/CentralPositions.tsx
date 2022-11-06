import React, {ChangeEvent, useCallback} from "react";
import {InlineObjectData, PageData} from "../../../../Data";
import {Accordion, Button, Col, Container, FormControl, InputGroup, Row} from "react-bootstrap";
import {MaterialIcon} from "../../../utils";

export function useCentralPositions(page: PageData | undefined, onChange: (page: PageData) => void) {
    const handleCentralPositionsAdd = useCallback((newPosition: number = 0) => {
        onChange(page!.withCentralPositions([...page!.centralPositions, newPosition]));
    }, [page, onChange]);

    const handleCentralPositionChange = useCallback((event: ChangeEvent<HTMLInputElement> | number, index: number) => {
        let value = typeof event === "number" ? event : parseFloat(event.target.value);
        if (Number.isNaN(value)) {
            return;
        }
        const centralPositions = page!.centralPositions.slice();
        centralPositions[index] = Math.max(0, Math.min(value, 100));
        onChange(page!.withCentralPositions(centralPositions));
    }, [page, onChange]);

    const handleCentralPositionRemove = useCallback((index: number) => {
        const centralPositions = page!.centralPositions.slice();
        centralPositions.splice(index, 1);
        onChange(page!.withCentralPositions(centralPositions));
    }, [page, onChange]);

    return {
        handleCentralPositionsAdd: handleCentralPositionsAdd,
        handleCentralPositionChange,
        handleCentralPositionRemove,
    };
}

type PropType = {
    page: PageData,
    onChange: (page: PageData) => void,
}

function CentralPositions({page, onChange}: PropType) {
    const {
        handleCentralPositionsAdd,
        handleCentralPositionRemove,
        handleCentralPositionChange,
    } = useCentralPositions(page, onChange);

    return (<>
        <Accordion>
            <Accordion.Item eventKey={"one-item"}>
                <Accordion.Header>Central Positions</Accordion.Header>
                <Accordion.Body>
                    <Container>
                        <Row>
                            {page.centralPositions.map((centralPosition, index) => {
                                const id = `central-position-${index}`;
                                return (<Col sm={"auto"}>
                                    <InputGroup key={index}>
                                        <InputGroup.Text as={"label"} htmlFor={id}>Nr. {index + 1}</InputGroup.Text>
                                        <FormControl
                                            id={id} type={"number"} max={100} min={0} value={centralPosition}
                                            step={10 ** -InlineObjectData.CentralPositionDigits}
                                            onChange={(event: ChangeEvent<HTMLInputElement>) => handleCentralPositionChange(event, index)}
                                        />
                                        <Button onClick={() => handleCentralPositionRemove(index)} variant={"danger"}
                                                className={"d-flex"}>
                                            <MaterialIcon icon="delete"/>
                                            Remove
                                        </Button>
                                    </InputGroup>
                                </Col>);
                            })}
                            <Col sm={12} className={"mt-2"}>
                                <Button variant={"success"} className="d-flex"
                                        onClick={() => handleCentralPositionsAdd()}>
                                    <MaterialIcon icon="add"/>
                                    Add
                                </Button>
                            </Col>
                        </Row>
                    </Container>
                </Accordion.Body>
            </Accordion.Item>
        </Accordion>
    </>);
}

export default CentralPositions;
