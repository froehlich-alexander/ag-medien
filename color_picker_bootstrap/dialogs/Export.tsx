import {Modal} from "bootstrap";
import classNames from "classnames";
import React, {ChangeEventHandler, Component, createRef, MouseEventHandler, RefObject} from "react";
import {Simulate} from "react-dom/test-utils";
import {ColorScheme} from "../color-base/colorpickerBackend";
import ColorSchemeDropdownMenu from "../ColorSchemeDropdownMenu";
import {DefaultProps, Form, saveToFile} from "../utils";

interface ExportDialogProps extends DefaultProps {
    downloadAnchor: RefObject<HTMLAnchorElement>,
    allColorSchemes: ColorScheme[],
}

interface ExportDialogState {
    selectedColorSchemes: Set<string>,
    mimeType: "application/json" | "application/xml", // the mime type which is used for exporting color schemes
}


export default class ExportDialog extends Component<ExportDialogProps, ExportDialogState> {
    private modal: RefObject<HTMLDivElement> = createRef();

    constructor(props: ExportDialogProps) {
        super(props);
        this.state = {
            selectedColorSchemes: new Set(),
            mimeType: "application/json",
        };
    }

    public render(): React.ReactNode {
        return (
            <div className={classNames("modal fade", this.props.className)}
                 tabIndex={-1}
                 ref={this.modal}
                 aria-label="Dialog to export color schemes"
                 aria-hidden={true}
                 id="export-dialog">
                <div className="modal-dialog modal-dialog-centered">
                    <div className={"modal-content"}>
                        <div className={"modal-header"}>
                            <h5 className={"modal-title"}>Export Color schemes</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"
                                    aria-label="Close"></button>
                        </div>
                        <div className={"modal-body"}>
                            <Form action="javascript:void(0)"
                                  onSubmit={this.exportColorSchemes}
                                  id={"export-dialog-form"}
                                  className="row g-4">
                                <ColorSchemeDropdownMenu
                                    className="col-12"
                                    colorSchemes={this.props.allColorSchemes}
                                    multiple
                                    newButton={false}
                                    formText={"Select the Color Schemes to export"}
                                    disablePlaceholderIfNoCustomCS={true}
                                    selectedColorSchemes={this.state.selectedColorSchemes}
                                    onColorSchemeSelected={this.handleColorSchemeSelected}/>
                                <div className={"input-group col-12"}>
                                    <label className={"input-group-text"} htmlFor={"mimetype-select"}>
                                        Export as
                                    </label>
                                    <select name={"mimetype"}
                                            id={"mimetype-select"}
                                            className={"form-select"}
                                            value={this.state.mimeType}
                                            required
                                            onChange={this.handleMimeTypeChange}>
                                        <option value={"application/json"}>JSON</option>
                                        <option value={"application/xml"}>XML</option>
                                    </select>
                                    <span className={"form-text col-12"}>The filetype to export the color schemes</span>
                                </div>
                            </Form>
                        </div>
                        <div className={"modal-footer"}>
                            <button type={"button"}
                                    className={"btn btn-secondary"}
                                    data-bs-dismiss={"modal"}>
                                Cancel
                            </button>
                            <button type="submit"
                                    form="export-dialog-form"
                                    className={"btn btn-primary"}>
                                Export
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    private handleMimeTypeChange: ChangeEventHandler<HTMLSelectElement> = (event) => {
        this.setState({
            mimeType: event.target.value as ExportDialogState["mimeType"],
        });
    };

    private handleColorSchemeSelected = (selectedColorSchemes: Set<string>) => {
        this.setState({
            selectedColorSchemes: selectedColorSchemes,
        });
    };

    private exportColorSchemes = () => {
        const colorSchemesToExport = this.props.allColorSchemes.filter(cs => this.state.selectedColorSchemes.has(cs.id));
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

        const jsObj = {
            "color-schemes": colorSchemesToExport,
            timestamp: Date.now(),
        };
        let content: string;
        switch (this.state.mimeType) {
            case "application/json":
                content = JSON.stringify(jsObj);
                filename += ".json";
                break;
            case "application/xml":
                return;
                content =
                filename += ".xml";
        }
        saveToFile(content, filename, this.state.mimeType, this.props.downloadAnchor.current!);
        Modal.getInstance(this.modal.current!)!.hide();
    };
}