import classNames from "classnames";
import React, {createRef} from "react";
import {Component} from "react";
import ColorSchemeDropdownMenu from "../ColorSchemeDropdownMenu";
import {DefaultProps, Form} from "../utils";

interface ImportDialogProps extends DefaultProps{

}

interface ImportDialogState {

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
                              id={"import-dialog-form"}
                              className="row g-4">
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
}

export default ImportDialog;