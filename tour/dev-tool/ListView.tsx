import React, {ChangeEvent, useCallback, useContext, useState, MouseEvent} from "react";
import {Button, ButtonGroup, Col, Container, Form, FormControl, ListGroup, Row} from "react-bootstrap";
import {PageData} from "../js/Data";
import useSet from "./custom-hooks/SetSate";
import TourContext from "./TourContext";
import {DefaultProps, MaterialIcon} from "./utils";
import classNames from "classnames";
import bootstrap from "bootstrap";

interface ListViewProps extends DefaultProps {
}

export default function ListView(
    {
        className,
    }: ListViewProps) {
    const context = useContext(TourContext);
    const [selectedPages, {toggle, reset: resetSelectedPages}] = useSet<string>();
    console.log(selectedPages);

    const selectAll = useCallback(() => {
        resetSelectedPages(context.pages.map(value => value.id));
    }, [resetSelectedPages]);

    const unselectAll = useCallback(() => {
        resetSelectedPages([]);
    }, [resetSelectedPages]);

    const deleteAllSelected = useCallback(() => {
        context.removePages(Array.from(selectedPages));
    }, [selectedPages, context.removePages]);

    return (
        <div className={classNames("ListView", className)}>
            <Col sm={12}>
                <Container className="p-3 bg-white rounded-2 mb-2">
                    <Row>
                        <Col sm={"auto"}>
                            <ButtonGroup>
                                <Button onClick={selectAll}>Select All</Button>
                                <Button variant="secondary" onClick={unselectAll}>Unselect All</Button>
                            </ButtonGroup>
                        </Col>
                        <Col sm={"auto"}>
                                <Button variant="danger" onClick={deleteAllSelected}>Delete All Selected</Button>
                        </Col>
                    </Row>
                </Container>
            </Col>
            <ListGroup>
                <ListGroup.Item key={12} className="p-0">
                    {/* @ts-ignore */}
                    <PageItem selected={selectedPages.has("hello test")} onSelected={toggle} page={{id: 'hello test'}}/>
                </ListGroup.Item>
                {context.pages.map(v =>
                    <ListGroup.Item key={v.id} className="p-0">
                        <PageItem page={v} onSelected={toggle} selected={selectedPages.has(v.id)}/>
                    </ListGroup.Item>)}
            </ListGroup>
        </div>
    );
};

interface PageItemProps extends DefaultProps {
    page: PageData,
    selected: boolean,
    onSelected: (pageId: string, selected: boolean) => void,
}

function PageItem(
    {
        page,
        selected,
        onSelected,
    }: PageItemProps,
) {
    const context = useContext(TourContext);
    const selectedPage = context.currentPage;

    const handleClick = useCallback(() => {
        if (page.id !== selectedPage?.id) {
            context.setCurrentPage(page.id);
        }
    }, [page.id, selectedPage, context.setCurrentPage]);

    const handleDelete = useCallback((event: MouseEvent) => {
        context.removePages(page.id);
        event.stopPropagation();
    }, [page.id, context.removePages]);

    const handleCheckboxClick = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        onSelected(page.id, !selected);
        event.stopPropagation();
    }, [selected, onSelected, page.id]);

    return (
        <Container fluid
                   className={classNames("px-4  py-2 m-0 PageItem", selectedPage?.id === page.id && "bg-opacity-25 bg-primary")}
                   onClick={handleClick}>
            <Row className="d-flex align-items-center">
                <Col sm="auto">
                    <Form.Check checked={selected} onChange={handleCheckboxClick}/>
                </Col>
                <Col>
                    <b className="MainLabel">{page.id}</b>
                </Col>
                <Col sm="auto" className="d-flex">
                    <MaterialIcon icon="delete" onClick={handleDelete} color="danger"/>
                </Col>
            </Row>

        </Container>
    );
}
