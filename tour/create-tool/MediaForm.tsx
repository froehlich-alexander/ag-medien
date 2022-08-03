// @flow
import {ChangeEvent, useReducer, useState} from "react";
import * as React from "react";
import {Button, Col, Container, Form, InputGroup, Row, Table} from "react-bootstrap";
import {DataType, MediaData, SourceData} from "./Data";
import {DefaultProps} from "./utils";
import "./CreateTool.scss";

type Props = DefaultProps & {
    media: MediaData,
    onMediaChange: (media: MediaData) => void,
};

export function MediaForm(
    {
        onMediaChange, media,
    }: Props) {
    const [files, setFiles] = useState<File[]>([]);

    function setMedia(media: DataType<MediaData>): void;
    function setMedia(key: keyof DataType<MediaData>, value: any): void;
    function setMedia(key: (keyof DataType<MediaData>) | DataType<MediaData>, value?: any): void {
        onMediaChange(media.withUpdate(
            typeof key === "object" ? key
                : {[key]: value!} as DataType<MediaData>,
        ));
    }

    console.log("srcs", media.src, media.srcMin, media.srcMax);

    async function handleFileInput(event: ChangeEvent<HTMLInputElement>) {
        const inputFiles = Array.from(event.target.files!);
        if (inputFiles.length <= 0) {
            return;
        }
        let mergedFiles = files.concat(inputFiles);
        setFiles(mergedFiles);
        const dataTransfer = new DataTransfer();
        for (let f of mergedFiles) {
            dataTransfer.items.add(f);
        }
        event.target.files = dataTransfer.files;
        if (mergedFiles.length > 1) {
            const min = mergedFiles.reduce((previousValue, currentValue) =>
                previousValue?.size < currentValue.size ? previousValue : currentValue);
            const max = mergedFiles.reduce((previousValue, currentValue) =>
                previousValue.size > currentValue.size ? previousValue : currentValue);
            setMedia("srcMin", await SourceData.fromFile(min));
            if (mergedFiles.length >= 3) {
                setMedia("srcMax", await SourceData.fromFile(max));
                // middle size file
                setMedia("src", await SourceData.fromFile(mergedFiles.filter(v => v !== min && v !== max)
                    .sort((a, b) => ((a.size > b.size) as unknown as number))
                    [(mergedFiles.length - 2) / 2]));
            } else {
                setMedia("src", await SourceData.fromFile(max));
            }
        } else {
            setMedia("src", await SourceData.fromFile(mergedFiles[0]));
        }
    }

    return (
        <Container fluid className={"MediaForm"}>
            <h4>Media</h4>
            <div className="row p-4">
                <Col sm={12} className="mb-3">
                    <Button as="label" htmlFor="i-src">Add Sources</Button>
                    <Form.Control id="i-src" type="file" multiple
                                  hidden={true}
                                  required
                                  onChange={handleFileInput}/>
                    <Col sm={12}>
                        <Form.Text>
                            You can add up to 3 different sources and they are automatically ordered
                            according to their size
                        </Form.Text>
                    </Col>
                    <Form.Control.Feedback type={"invalid"}>
                        You must select at least 1 file
                    </Form.Control.Feedback>
                </Col>
                <Col sm={12}>
                    <Table className="SrcTable">
                        <thead>
                        <tr>
                            <th>Source Type</th>
                            <th>File</th>
                            <th>Preview</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>Default Source</td>
                            <td>{media.src?.name ?? "---"}</td>
                            <td>{media.src != null ? <Button variant="info">Preview</Button> : "---"}</td>
                        </tr>
                        <tr>
                            <td>Low Resolution Source</td>
                            <td>{media.srcMin?.name ?? "---"}</td>
                            <td>{media.srcMin != null ? <Button variant="info">Preview</Button> : "---"}</td>
                        </tr>
                        <tr>
                            <td>High Resolution Source</td>
                            <td>{media.srcMax?.name ?? "---"}</td>
                            <td>{media.srcMax != null ? <Button variant="info">Preview</Button> : "---"}</td>
                        </tr>
                        </tbody>
                    </Table>
                </Col>
                {/*<InputGroup className={"col-12"}>*/}
                {/*    <InputGroup.Text as="label"*/}
                {/*                     htmlFor="i-src-min">Low Resolution Source</InputGroup.Text>*/}
                {/*    <Form.Control id="i-src-min" type="file" value={srcMin} onChange={handleSrcMin}/>*/}
                {/*</InputGroup>*/}
                {/*<InputGroup className={"col-12"}>*/}
                {/*    <InputGroup.Text as="label"*/}
                {/*                     htmlFor="i-src-max">High Resolution Source</InputGroup.Text>*/}
                {/*    <Form.Control id="i-src-max" type="file" value={srcMax} onChange={handleSrcMax}/>*/}
                {/*</InputGroup>*/}
            </div>
        </Container>
    );
};