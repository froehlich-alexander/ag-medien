import classNames from "classnames";
import React, {Component, MouseEventHandler, RefObject} from "react";
import {DefaultProps, Form} from "../utils";

interface ExportDialogProps extends DefaultProps {
    onExport: () => any,
    downloadAnchor: RefObject<HTMLAnchorElement>,
}

interface ExportDialogState {

}

export default class ExportDialog extends Component<ExportDialogProps, ExportDialogState> {
    public render(): React.ReactNode {
        return (
            <div className={classNames("modal fade", this.props.className)}
                 tabIndex={-1}
                 id={"export-dialog"}>
                <div className={"modal-dialog"}>
                    <div className={"modal-content"}>
                        <div className={"modal-header"}>
                            <h5 className={"modal-title"}>Export</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"
                                    aria-label="Close"></button>
                        </div>
                        <div className={"modal-body"}>
                            <Form action="javascript:void()"
                                  onSubmit={this.exportColorSchemes}>
                                <div className={"input-group"}>
                                    <label className={"input-group-text"} htmlFor={"mimetype-select"}>
                                        Export as
                                    </label>
                                    <select name={"mimetype"}
                                            id={"mimetype-select"}
                                            className={"form-select"}
                                            value={"application/json"}>
                                        <option value={"application/json"}>JSON</option>
                                        <option value={"application/xml"}>XML</option>
                                    </select>
                                    <span className={"form-text"}>The filetype to export the color schemes</span>
                                </div>
                            </Form>
                        </div>
                        <div className={"modal-footer"}>
                            <button type={"button"}
                                    className={"btn btn-secondary"}
                                    data-bs-dismiss={"modal"}>
                                Cancel
                            </button>
                            <button type={"button"}
                                    className={"btn btn-primary"}
                                    onClick={this.handleExportClick}>
                                Export
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    private handleExportClick: MouseEventHandler<HTMLButtonElement> = (event) => {

    };

    private exportColorSchemes = () => {

    };
}