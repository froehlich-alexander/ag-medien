// @flow
import {ChangeEvent, useReducer, useState} from "react";
import * as React from "react";
import {Form, InputGroup} from "react-bootstrap";
import {MediaData, SourceData} from "./Data";
import {DefaultProps} from "./utils";

type Props = DefaultProps & {
    media: MediaData,
    onMediaChange: (media: MediaData) => void,
    hasChanged: (hasChanged: boolean) => any,
};

export function MediaForm(
    {
        onMediaChange, media, hasChanged,
    }: Props) {
    const [files, setFiles] = useState<File[]>([]);

    //input fields
    const [src, setSrc] = useState(media.src);
    const [srcMin, setSrcMin] = useState(media.srcMin);
    const [srcMax, setSrcMax] = useState(media.srcMax);

    console.log("srcs", src, srcMin, srcMax);

    async function handleFileInput(event: ChangeEvent<HTMLInputElement>) {
        const inputFiles = Array.from(event.target.files!);
        if (inputFiles.length <= 0) {
            return;
        }
        let mergedFiles = files.concat(inputFiles);
        setFiles(mergedFiles);
        const dataTransfer = new DataTransfer();
        for (let f of mergedFiles){
            dataTransfer.items.add(f);
        }
        event.target.files = dataTransfer.files;
        if (mergedFiles.length > 1) {
            const min = mergedFiles.reduce((previousValue, currentValue) =>
                previousValue?.size < currentValue.size ? previousValue : currentValue);
            const max = mergedFiles.reduce((previousValue, currentValue) =>
                previousValue.size > currentValue.size ? previousValue : currentValue);
            setSrcMin(await SourceData.fromFile(min));
            if (mergedFiles.length >= 3) {
                setSrcMax(await SourceData.fromFile(max));
                // middle size file
                setSrc(await SourceData.fromFile(mergedFiles.filter(v => v !== min && v !== max)
                    .sort((a, b) => ((a.size > b.size) as unknown as number))
                    [(mergedFiles.length - 2) / 2]));
            } else {
                setSrc(await SourceData.fromFile(max));
            }
        } else {
            setSrc(await SourceData.fromFile(mergedFiles[0]));
        }
    }

    return (
        <div>
            <Form className="row">
                <InputGroup className={"col-12"}>
                    <InputGroup.Text as="label"
                                     htmlFor="i-src">Sources</InputGroup.Text>
                    <Form.Control id="i-src" type="file" multiple
                                  onChange={handleFileInput}/>
                </InputGroup>
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
            </Form>
        </div>
    );
};