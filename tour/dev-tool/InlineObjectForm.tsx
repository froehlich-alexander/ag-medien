import React, {ChangeEvent, useCallback, useContext, useMemo} from "react";
import {Col, Container, FormControl, FormSelect, FormText, InputGroup, Row} from "react-bootstrap";
import {ClickableData, InlineObjectData, MediaData, TextFieldData} from "../js/Data";
import {getAddressableIds} from "../js/refactor-data";
import {AnimationType, IconType, InlineObjectPosition, InlineObjectType} from "../js/types";
import {PageContext} from "./TourContexts";

type InlineObjectFormProps = {
    inlineObject: InlineObjectData,
    onChange: (inlineObject: InlineObjectData, index: number) => void,
    index: number,
}

export default function InlineObjectForm({inlineObject, onChange: onChangeWithIndex, index}: InlineObjectFormProps) {
    const pageContext = useContext(PageContext);

    const targetIds: string[] = useMemo(() =>
            getAddressableIds(pageContext.pages),
        [pageContext.pages]);

    const onChange = useCallback((inlineObject: InlineObjectData) => {
            onChangeWithIndex(inlineObject, index);
        }
        , [onChangeWithIndex]);

    // inline object input handlers
    const handleTypeChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        // @ts-ignore
        onChange(new InlineObjectData.constructorFromType(value as InlineObjectType)(inlineObject.withType(value)));
    }, [inlineObject, onChange]);

    const handleAnimationTypeChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        onChange(inlineObject.withAnimationType(value as AnimationType));
    }, [inlineObject, onChange]);

    const handlePositionChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        onChange(inlineObject.withPosition(value as InlineObjectPosition));
    }, [inlineObject, onChange]);

    const handleXChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        onChange(inlineObject.withX(parseFloat(value) ?? 0));
    }, [inlineObject, onChange]);

    const handleYChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        onChange(inlineObject.withY(parseFloat(value) ?? 0));
    }, [inlineObject, onChange]);

    const handleGotoChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        onChange(inlineObject.withGoto(value));
    }, [inlineObject, onChange]);


    // clickable + text field
    const handleTitleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        onChange((inlineObject as ClickableData | TextFieldData).withTitle(value));
    }, [inlineObject, onChange]);

    // clickable
    const handleIconChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        onChange((inlineObject as ClickableData).withIcon(value as IconType));
    }, [inlineObject, onChange]);

    return (
        <Container>
            <Row className="gy-3 gx-3">
                <Col sm={6}>
                    <InputGroup>
                        <InputGroup.Text as="label" htmlFor="object-type">Type</InputGroup.Text>
                        <FormSelect value={inlineObject.type} id="object-type" required
                                    onChange={handleTypeChange}>
                            {InlineObjectData.Types.map(name =>
                                <option key={name} value={name}>{name}</option>,
                            )}
                        </FormSelect>
                    </InputGroup>
                </Col>

                <Col sm={6}>
                    <InputGroup>
                        <InputGroup.Text as="label" htmlFor="object-position">Position</InputGroup.Text>
                        <FormSelect value={inlineObject.position} id="object-position" required
                                    onChange={handlePositionChange}>
                            {InlineObjectData.Positions.map(pos =>
                                <option key={pos} value={pos}>{pos}</option>,
                            )}
                        </FormSelect>
                    </InputGroup>
                </Col>

                <Col sm={6}>
                    <InputGroup>
                        <InputGroup.Text as="label" htmlFor="object-x">X Coordinate</InputGroup.Text>
                        <FormControl value={inlineObject.x} id="object-x" required type="number"
                                     onChange={handleXChange} min={0} max={100} step={0.01}/>
                        <FormControl.Feedback type="invalid">Must be between 0 and 100</FormControl.Feedback>
                    </InputGroup>
                </Col>

                <Col sm={6}>
                    <InputGroup>
                        <InputGroup.Text as="label" htmlFor="object-y">Y Coordinate</InputGroup.Text>
                        <FormControl value={inlineObject.y} id="object-y" required type="number"
                                     onChange={handleYChange} min={0} max={100} step={0.1}/>
                        <FormControl.Feedback type="invalid">Must be between 0 and 100</FormControl.Feedback>
                    </InputGroup>
                </Col>
                <FormText>The coordinates are relative to the media / page</FormText>

                {inlineObject.isClickable() && <>
                    <Col sm={6}>
                        <InputGroup>
                            <InputGroup.Text as="label" htmlFor="object-title">Title</InputGroup.Text>
                            <FormControl value={inlineObject.title} id="object-title" required type="text"
                                         onChange={handleTitleChange}/>
                        </InputGroup>
                    </Col>

                    <Col sm={6}>
                        <InputGroup>
                            <InputGroup.Text as="label" htmlFor="object-icon">Icon</InputGroup.Text>
                            <FormSelect value={inlineObject.icon} id="object-icon" required
                                        onChange={handleIconChange}>
                                {ClickableData.Icons.map(icon =>
                                    <option key={icon} value={icon}>{icon}</option>,
                                )}
                            </FormSelect>
                        </InputGroup>
                    </Col>
                </>}

                <Col>
                    <InputGroup>
                        <InputGroup.Text as="label" htmlFor="object-goto">Goto / target id</InputGroup.Text>
                        <FormControl value={inlineObject.goto} placeholder="Type to search a target..." id="object-goto"
                                     type="text" pattern={'^(' + targetIds.join(")|(") + ')$'}
                                     onChange={handleGotoChange} list="object-goto-datalist"/>
                        <datalist id="object-goto-datalist">
                            {targetIds.map(id =>
                                <option key={id} value={id}>{id}</option>,
                            )}
                        </datalist>
                    </InputGroup>
                </Col>

                <Col sm={"auto"}>
                    <InputGroup>
                        <InputGroup.Text as="label" htmlFor="object-animation">Animation Type</InputGroup.Text>
                        <FormSelect value={inlineObject.animationType ?? "forward"} id="object-animation" required
                                    onChange={handleAnimationTypeChange}>
                            {InlineObjectData.AnimationTypes.map(animationType =>
                                <option key={animationType} value={animationType}>{animationType}</option>,
                            )}
                        </FormSelect>
                    </InputGroup>
                </Col>
            </Row>
        </Container>
    );
};