import React, { useContext } from "react";
import {Col, Container, Row } from "react-bootstrap";
import TourContext from "./TourContext";
import {DefaultProps} from "./utils";
import classNames from "classnames";

interface ListViewProps extends DefaultProps {

}

export default function ListView(
    {
        className,
    }: ListViewProps) {
    const context = useContext(TourContext);

    return (
        <div className={classNames("border", className)}>
            <ul className={""}>
                {context.pages.map(v=>
                <li key={v.id}><PageItem page={v}/></li>)}
            </ul>
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
        <Container fluid>
            <Row>
                <Col sm={12} className="d-flex align-items-center">
                    <h5><b>{page.id}</b></h5>
                </Col>
            </Row>

        </Container>
    );
}