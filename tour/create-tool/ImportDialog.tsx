// @flow
import {ChangeEvent, useContext, useEffect, useState} from "react";
import * as React from "react";
import {Button, FormControl, Modal, Row, Table} from "react-bootstrap";
import {PageData} from "../js/Data";
import TourContext from "./TourContext";

type Props = {
    show: boolean,
    onVisibilityChange: (visibility: boolean) => any,
};

export function ImportDialog(
    {
        show,
        onVisibilityChange,
    }: Props) {
    const context = useContext(TourContext);
    const [pages, setPages] = useState<PageData[]>([]);

    function hide() {
        onVisibilityChange(false);
    }

    function reset() {
        setPages([]);
    }

    return (
        <Modal show={show} onHide={hide}>
            <Modal.Header closeButton={true}>
                <Modal.Title>Import Tour Config</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Button as="label" className={"me-3"} htmlFor="json-files-i">Add</Button>
                <FormControl id="json-files-i" type={"file"} multiple hidden={true} onChange={handleChange}/>
                <Button variant="danger" onClick={reset}>Reset</Button>
                <Table>
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>Page Id</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {pages.map((v, i) => <tr>
                        <td>{i + 1}</td>
                        <td>{v.id}</td>
                    </tr>)}
                    </tbody>
                </Table>
            </Modal.Body>
            <Modal.Footer>
                {/*<Row className={"gx-3"}>*/}
                    <Button variant="secondary" onClick={hide}>Close</Button>
                    <Button onClick={importPages}>Import</Button>
                {/*</Row>*/}
            </Modal.Footer>
        </Modal>
    );

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
        Promise.all(Array.from(event.target.files!).map(v => v.text()
            .then(JSON.parse)
            .then(PageData.fromJSON),
        ))
            .then(value => {
                setPages(prevState => prevState.concat(value));
                Promise.all(value.map(v => v.complete()))
                    .then(v => setPages(prevState => prevState.concat(v)));
            });
    }

    function importPages() {
        //todo loading icon
        Promise.all(pages.map(v => v.complete()))
            .then(context.addPages)
            .then(hide);
    }
}