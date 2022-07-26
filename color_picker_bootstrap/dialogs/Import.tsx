import classNames from "classnames";
import React, {ChangeEventHandler, createRef} from "react";
import {Component} from "react";
import {ColorScheme, ColorSchemeData} from "../color-base/colorpickerBackend";
import ColorPickerService from "../color-base/ColorPickerService";
import ColorSchemeDropdownMenu from "../ColorSchemeDropdownMenu";
import {DefaultProps, Form} from "../utils";
import {ColorSchemesFile} from "./Export";

interface ImportDialogProps extends DefaultProps {
    allColorSchemes: ColorScheme[],
    onColorSchemeImport: (colorSchemes: ColorScheme[]) => any,
    /** Used to create Color Schemes */
    service: ColorPickerService,
}

interface ImportDialogState {
    colorSchemesToImport: ColorScheme[],
}

class ImportDialog extends Component<ImportDialogProps, ImportDialogState> {
    modal = createRef<HTMLDivElement>();

    public render(): React.ReactNode {
        return (
            <div className={classNames("modal fade", this.props.className)}
                 tabIndex={-1}
                 ref={this.modal}
                 aria-label="Dialog to import color schemes"
                 aria-hidden={true}
                 id="color-scheme-import-dialog">
                <div className="modal-dialog modal-dialog-centered">
                    <div className={"modal-content"}>
                        <div className={"modal-header"}>
                            <h5 className={"modal-title"}>Import Color schemes</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"
                                    aria-label="Close"></button>
                        </div>
                        <div className={"modal-body"}>
                            <Form action="javascript:void(0)"
                                  onSubmit={this.importColorSchemes}
                                  id="import-dialog-form"
                                  className="row g-4">
                                <div className={"input-group"}>
                                    <input type="file"
                                           required
                                           accept={".color-scheme.json, .color-scheme.xml"}
                                           onChange={this.handleFileInputChange}
                                           multiple
                                    />
                                </div>
                                <ColorSchemeDropdownMenu
                                    className="col-12"
                                    colorSchemes={this.props.allColorSchemes}
                                    multiple
                                    newButton={false}
                                    formText={"Select the Color Schemes to export"}
                                    disablePlaceholderIfNoCustomCS={true}
                                    selectedColorSchemes={this.state.selectedColorSchemes}
                                    oneItemRequired={true}
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

    private handleFileInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
        const colorSchemes = [];
        let fileList = event.target.files!;
        for (let i = 0; i < fileList.length; i++) {
            let file = fileList.item(i)!;
            file.text()
                .then<ColorSchemesFile>(value => JSON.parse(value))
                .then(v => Promise.all(v.colorSchemes.map((v: ColorSchemeData) => new Promise(() => ColorScheme.fromJSON(v, this.props.service)))))
                .then(value =>)
                .then(value => this.setState({colorSchemesToImport: value}));
        }
    };

    private importColorSchemes = () => {
        this.props.onColorSchemeImport(this.state.colorSchemesToImport);
        const ids = this.state.colorSchemesToImport.map(v => v.id);
        this.setState(state => ({
            // remove all color schemes passed to the parent
            colorSchemesToImport: state.colorSchemesToImport.filter(v => !(v.id in ids)),
        }));
    };
}

export default ImportDialog;