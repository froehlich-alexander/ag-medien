import classNames from "classnames";
import React, {ChangeEvent, MouseEvent, useCallback, useContext} from "react";
import {Button, ButtonGroup, Col, Container, Form, ListGroup, Row} from "react-bootstrap";
import {PageData} from "../Data";
import useSet from "./custom-hooks/SetSate";
import {ListViewContext, PageContext} from "./TourContexts";
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
            <ListGroup>
                <ListGroup.Item>
                    <Row className="row-cols-auto py-2">
                        <Col>
                            <ButtonGroup>
                                <Button onClick={selectAll}>Select All</Button>
                                <Button variant="secondary" onClick={unselectAll}>Unselect All</Button>
                            </ButtonGroup>
                        </Col>
                        <Col>
                            <Button variant="danger" onClick={deleteAllSelected}>Delete All Selected</Button>
                        </Col>
                    </Row>
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
    const listViewContext = useContext(ListViewContext);

    const handleClick = useCallback(() => {
        listViewContext.requestSetCurrentPage(page.id);
    }, [page.id, listViewContext]);

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
