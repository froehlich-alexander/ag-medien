import React, {useCallback, useContext} from "react";
import {Col, Container, ListGroup, Row} from "react-bootstrap";
import {PageData} from "../js/Data";
import TourContext from "./TourContext";
import {DefaultProps} from "./utils";
import classNames from "classnames";
import bootstrap from "bootstrap";

interface ListViewProps extends DefaultProps {
}

export default function ListView(
    {
        className,
    }: ListViewProps) {
    const context = useContext(TourContext);

    return (
        <div className={classNames("ListView", className)}>
            <ListGroup>
                {context.pages.map(v =>
                    <ListGroup.Item key={v.id} className="p-0"><PageItem page={v}/></ListGroup.Item>)}
            </ListGroup>
        </div>
    );
};

interface PageItemProps extends DefaultProps {
    page: PageData,
}

function PageItem(
    {
        page,
    }: PageItemProps,
) {
    const context = useContext(TourContext);
    const selectedPage = context.currentPage;

    const handleClick = useCallback(() => {
        if (page.id !== selectedPage?.id) {
            context.setCurrentPage(page.id);
        }
    }, [page.id, selectedPage]);

    return (
        <Container fluid
                   className={classNames("py-4 m-0 PageItem", selectedPage?.id === page.id && "bg-opacity-25 bg-primary")}
                   onClick={handleClick}>
            <Row>
                <Col sm={12} className="d-flex align-items-center">
                    <h5><b>{page.id}</b></h5>
                </Col>
            </Row>

        </Container>
    );
}
