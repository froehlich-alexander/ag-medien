import React, { useContext } from "react";
import {Col, Container, ListGroup, Row} from "react-bootstrap";
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
        <div className={classNames("", className)}>
            <ListGroup>
                {context.pages.map(v=>
                <ListGroup.Item key={v.id}><PageItem page={v}/></ListGroup.Item>)}
            </ListGroup>
        </div>
    );
};

interface PageItemProps {
    page: Page,
}

function PageItem(
    {
        page,
    }: PageItemProps,
) {
    return (
        <Container fluid className={"pb-1 pt-1"}>
            <Row>
                <Col sm={12} className="d-flex align-items-center">
                    <h5><b>{page.id}</b></h5>
                </Col>
            </Row>

        </Container>
    );
}