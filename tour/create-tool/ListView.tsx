import React, {useCallback, useContext, useState} from "react";
import {Col, Container, Form, FormControl, ListGroup, Row} from "react-bootstrap";
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
    const [selectedPages, {toggle}] = useSet<string>();
    console.log(selectedPages);

    return (
        <div className={classNames("ListView", className)}>
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
    }, [page.id, selectedPage]);

    const handleDelete = useCallback(() => {
        context.removePages(page.id);
    }, [page.id]);

    const handleCheckboxClick = useCallback(() => {
        onSelected(page.id, !selected);
    }, [selected, onSelected, page.id]);

    return (
        <Container fluid
                   className={classNames("px-4  py-2 m-0 PageItem", selectedPage?.id === page.id && "bg-opacity-25 bg-primary")}
                   onClick={handleClick}>
            <Row>
                <Col sm="auto">
                    <Form.Check checked={selected} onChange={handleCheckboxClick}/>
                </Col>
                <Col className="d-flex align-items-center">
                    <h5><b>{page.id}</b></h5>
                </Col>
                <Col sm="auto" className="d-flex align-items-center">
                    <MaterialIcon icon="delete" onClick={handleDelete} color="danger"/>
                </Col>
            </Row>

        </Container>
    );
}
