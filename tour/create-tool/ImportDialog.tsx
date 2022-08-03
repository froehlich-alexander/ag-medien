// @flow
import {ChangeEvent, useContext, useEffect, useState} from "react";
import * as React from "react";
import {Button, FormControl, Modal, Row, Table} from "react-bootstrap";
import {PageData} from "./Data";
import TourContext from "./TourContext";

type Props = {};

export function ImportDialog(props: Props) {
    const context = useContext(TourContext);
    const [vis, setVis] = useState(false);
    const [pages, setPages] = useState<PageData[]>([]);

    function hide() {
        setVis(false);
    }

    function reset() {
        setPages([]);
    }

    // remove duplicates
    useEffect(() => {
        function removeDuplicates(pages: PageData[]) {
            const res = [];
            for (let page of pages) {
                let items = pages.filter(v => v.id === page.id);
                let i = 1;
                for (let j of items.reverse()) {
                    if (j.isComplete() || i === items.length) {
                        res.push(j);
                        break;
                    }
                    i++;
                }
            }
            return res;
        }
        setPages(removeDuplicates)

        // setPages(prevState => prevState.filter((v, i, a) => a.findIndex(v1 => v.id === v1.id) === i));
    }, [pages]);

    return (
        <Modal show={vis} onHide={hide}>
            <Modal.Header closeButton={true}>
                <Modal.Title>Import Tour Config</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Button as="label" htmlFor="json-files-i">Add</Button>
                <FormControl id="json-files-i" type={"file"} multiple hidden={true} onChange={handleChange}/>
                <Button variant={"danger"} onClick={reset}>Reset</Button>
                <Table>
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>Page Id</th>
                    </tr>
                    </thead>
                    <tbody>
                    {pages.map((v, i) => <tr>
                        <td>{i}</td>
                        <td>{v.id}</td>
                    </tr>)}
                    </tbody>
                </Table>
            </Modal.Body>
            <Modal.Footer>
                <Row className={"gx-3"}>
                    <Button variant="secondary" onClick={hide}>Close</Button>
                    <Button onClick={importPages}>Import</Button>
                </Row>
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