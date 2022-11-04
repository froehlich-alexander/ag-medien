import React, {ChangeEvent, useCallback} from "react";
import {InlineObjectData, PageData} from "../../../../Data";
import {Accordion, Button, Col, FormControl, InputGroup, Row} from "react-bootstrap";
import {MaterialIcon} from "../../../utils";

export function useCentralPositions(page: PageData|undefined, onChange: (page: PageData) => void) {
    const handleCentralPositionsAddClick = useCallback(() => {
        onChange(page!.withCentralPositions([...page!.centralPositions, 0]));
    }, [page, onChange]);

    const handleCentralPositionChange = useCallback((event: ChangeEvent<HTMLInputElement>, index: number) => {
        let value = parseFloat(event.target.value);
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
        handleCentralPositionsAddClick,
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
        handleCentralPositionsAddClick,
        handleCentralPositionRemove,
        handleCentralPositionChange,
    } = useCentralPositions(page, onChange);

    return (<>
        <Accordion>
            <Accordion.Item eventKey={"one-item"}>
                <Accordion.Header>Central Positions</Accordion.Header>
                <Accordion.Body>
                    <Row>
                        {page.centralPositions.map((centralPosition, index) => {
                            const id = `central-position-${index}`;
                            return (<Col sm={"auto"}>
                                <InputGroup key={index}>
                                    <InputGroup.Text as={"label"} htmlFor={id}>Nr. {index + 1}</InputGroup.Text>
                                    <FormControl
                                        id={id} type={"number"} max={100} min={0}
                                        step={InlineObjectData.CentralPositionDigits}
                                        onChange={(event: ChangeEvent<HTMLInputElement>) => handleCentralPositionChange(event, index)}
                                    />
                                    <InputGroup.Text>
                                        <Button onClick={() => handleCentralPositionRemove(index)}><MaterialIcon
                                            icon="delete"/> Remove</Button>
                                    </InputGroup.Text>
                                </InputGroup>
                            </Col>);
                        })}
                        <Col sm={12}>
                            <Button variant={"success"} onClick={handleCentralPositionsAddClick}><MaterialIcon
                                icon="add"/> Add</Button>
                        </Col>
                    </Row>
                </Accordion.Body>
            </Accordion.Item>
        </Accordion>
    </>);
}

export default CentralPositions;