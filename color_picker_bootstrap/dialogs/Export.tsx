import React, {ChangeEvent, RefObject, useCallback, useState} from "react";
import {Button, Modal} from "react-bootstrap";
import {ColorScheme, ColorSchemeData} from "../color-base/colorpickerBackend";
import ColorSchemeDropdownMenu from "../ColorSchemeDropdownMenu";
import {Form} from "../utils/Form";
import {saveToFile} from "../utils/helperFunctions";
import {DefaultProps} from "../utils/types";

interface ExportDialogProps extends DefaultProps {
    downloadAnchor: RefObject<HTMLAnchorElement>,
    allColorSchemes: ColorScheme[],
    show: boolean,
    onVisibilityChange: (visibility: boolean) => void,
}

// the mime type which is used for exporting color schemes
type MimeTypeType = "application/json" | "application/xml";

// export default class ExportDialog extends Component<ExportDialogProps, ExportDialogState> {
//     // private modal: RefObject<HTMLDivElement> = createRef();
//
//     constructor(props: ExportDialogProps) {
//         super(props);
//         state = {
//             selectedColorSchemes: new Set(),
//             mimeType: "application/json",
//         };
//     }
export default function ExportDialog(props: ExportDialogProps) {
    const [mimeType, setMimeType] = useState<MimeTypeType>("application/json");
    const [selectedColorSchemes, setSelectedColorSchemes] = useState(new Set<string>());


    const hideDialog = useCallback(() => {
        props.onVisibilityChange(false);
    }, [props.onVisibilityChange]);

    const exportColorSchemes = useCallback(() => {
        const colorSchemesToExport = props.allColorSchemes.filter(cs => selectedColorSchemes.has(cs.id));
        const length = colorSchemesToExport.length;
        let filename: string;

        if (length === 0) {
            console.error("color scheme to export length === 0");
            return;
        } else if (length === 1) {
            filename = colorSchemesToExport[0].name + ".color-schemes";
        } else {
            filename = "collection.color-schemes";
        }

        const jsObj: ColorSchemesFile = {
            colorSchemes: colorSchemesToExport as unknown as ColorSchemeData[], // JSON.stringify() automatically calls toJSON on the ColorScheme objects
            timestamp: Date.now(),
        };
        let content: string;
        switch (mimeType) {
            case "application/json":
                content = JSON.stringify(jsObj);
                break;
            case "application/xml":
                return;
                // content = null;
        }
        saveToFile(content, filename, mimeType, props.downloadAnchor.current!);
        hideDialog();
        // Modal.getInstance(modal.current!)!.hide();
    }, [props.allColorSchemes, mimeType, hideDialog, props.downloadAnchor.current]);

    return (
        <Modal className={props.className}
               tabIndex={-1}
               show={props.show}
               onHide={hideDialog}
            // ref={modal}
               aria-label="Dialog to export color schemes"
               aria-hidden={true}
               centered
               id="export-dialog">
            {/*<div className="modal-dialog modal-dialog-centered">*/}
            {/*    <div className={"modal-content"}>*/}
            <Modal.Header closeButton={true}>
                <Modal.Title>Export Color schemes</Modal.Title>
                {/*<button type="button" className="btn-close" data-bs-dismiss="modal"*/}
                {/*        aria-label="Close"></button>*/}
            </Modal.Header>
            <Modal.Body>
                <Form action="javascript:void(0)"
                      onSubmit={exportColorSchemes}
                      id={"export-dialog-form"}
                      className="row g-4">
                    <ColorSchemeDropdownMenu
                        className="col-12"
                        colorSchemes={props.allColorSchemes}
                        multiple
                        newButton={false}
                        formText={"Select the Color Schemes to export"}
                        disablePlaceholderIfNoCustomCS={true}
                        selectedColorSchemes={selectedColorSchemes}
                        oneItemRequired={true}
                        onColorSchemeSelected={handleColorSchemeSelected}/>
                    <div className="input-group col-12">
                        <label className="input-group-text" htmlFor="mimetype-select">
                            Export as
                        </label>
                        <select name="mimetype"
                                id="mimetype-select"
                                className="form-select"
                                value={mimeType}
                                required
                                onChange={handleMimeTypeChange}>
                            <option value="application/json">JSON</option>
                            <option value="application/xml">XML</option>
                        </select>
                        <span className="form-text col-12">The filetype to export the color schemes</span>
                    </div>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary"
                    // data-bs-dismiss={"modal"}
                        onClick={hideDialog}>
                    Cancel
                </Button>
                <button type="submit"
                        form="export-dialog-form"
                        className="btn btn-primary">
                    Export
                </button>
            </Modal.Footer>
            {/*</div>*/}
            {/*</div>*/}
        </Modal>
    );

    function handleMimeTypeChange(event: ChangeEvent<HTMLSelectElement>) {
        // setState({
        //     mimeType: event.target.value as ExportDialogState["mimeType"],
        // });
        setMimeType(event.target.value as MimeTypeType);
    }

    function handleColorSchemeSelected(newSelectedColorSchemes: Set<string>) {
        // setState({
        //     newSelectedColorSchemes: newSelectedColorSchemes,
        // });
        setSelectedColorSchemes(newSelectedColorSchemes);
    }
}


export type ColorSchemesFile = {
    colorSchemes: ColorSchemeData[],
    timestamp: number,
};