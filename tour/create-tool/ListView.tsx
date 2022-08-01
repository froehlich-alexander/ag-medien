import React, {useCallback, useContext} from "react";
import {Col, Container, ListGroup, Row} from "react-bootstrap";
import {PageData} from "./Data";
import TourContext from "./TourContext";
import {DefaultProps} from "./utils";
import classNames from "classnames";
import bootstrap from "bootstrap";

interface ListViewProps extends DefaultProps {
    onSelect: (page: PageData) => any,
}

export default function ListView(
    {
        className,
        onSelect,
    }: ListViewProps) {
    const context = useContext(TourContext);

    return (
        <div className={classNames("", className)}>
            <ListGroup>
                {context.pages.map(v =>
                    <ListGroup.Item key={v.id}><PageItem page={v} onClick={onSelect}/></ListGroup.Item>)}
            </ListGroup>
        </div>
    );
};

interface PageItemProps extends DefaultProps {
    page: PageData,
    onClick: (page: PageData) => any,
}

function PageItem(
    {
        page,
        onClick,
    }: PageItemProps,
) {
    const context = useContext(TourContext);
    const selectedPage = context.currentPage;

    const handleClick = useCallback(() => {
        if (page.id !== selectedPage.id) {
            onClick(page);
        }
    }, [page.id, selectedPage.id]);

    return (
        <Container fluid
                   className={classNames("pb-1 pt-1", selectedPage.id === page.id && "bg-opacity-25 bg-primary")}
                   onClick={handleClick}>
            <Row>
                <Col sm={12} className="d-flex align-items-center">
                    <h5><b>{page.id}</b></h5>
                </Col>
            </Row>

        </Container>
    );
}