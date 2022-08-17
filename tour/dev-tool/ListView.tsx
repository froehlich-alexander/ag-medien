import classNames from "classnames";
import React, {ChangeEvent, MouseEvent, useCallback, useContext} from "react";
import {Button, ButtonGroup, Col, Container, Form, ListGroup, Row} from "react-bootstrap";
import {PageData} from "../js/Data";
import useSet from "./custom-hooks/SetSate";
import {PageContext} from "./TourContexts";
import {DefaultProps, MaterialIcon} from "./utils";

interface ListViewProps extends DefaultProps {
}

export default function ListView(
    {
        className,
    }: ListViewProps) {
    const pageContext = useContext(PageContext);
    const [selectedPages, {toggle, reset: resetSelectedPages}] = useSet<string>();
    // console.log(selectedPages);

    const selectAll = useCallback(() => {
        resetSelectedPages(pageContext.pages.map(value => value.id));
    }, [resetSelectedPages]);

    const unselectAll = useCallback(() => {
        resetSelectedPages([]);
    }, [resetSelectedPages]);

    const deleteAllSelected = useCallback(() => {
        pageContext.removePages(Array.from(selectedPages));
    }, [selectedPages, pageContext.removePages]);

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
                {pageContext.pages.map(v =>
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
    const pageContext = useContext(PageContext);
    const selectedPage = pageContext.currentPage;

    const handleClick = useCallback(() => {
        if (page.id !== selectedPage?.id) {
            pageContext.setCurrentPage(page.id);
        }
    }, [page.id, selectedPage, pageContext.setCurrentPage]);

    const handleDelete = useCallback((event: MouseEvent) => {
        pageContext.removePages(page.id);
        event.stopPropagation();
    }, [page.id, pageContext.removePages]);

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
