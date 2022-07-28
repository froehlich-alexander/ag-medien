import classNames from "classnames";
import React, {Component, MouseEventHandler} from "react";
import {DefaultProps} from "./utils";

interface NavbarActionsProps extends DefaultProps {
    onImportClick?: ()=>any,
    onExportClick?: ()=>any,
}

interface NavbarActionsState {

}

class NavbarActions extends Component<NavbarActionsProps, NavbarActionsState> {
    public render(): React.ReactNode {
        return (
            <li className="dropdown nav-item" key={"navbar-actions"}>
                <a className={classNames("dropdown-toggle nav-link", this.props.className)}
                   data-bs-toggle="dropdown"
                   href="#"
                   role="button"
                   id={"navbar-color-scheme-dropdown"}>
                    Actions
                </a>
                <ul className="dropdown-menu"
                    aria-labelledby="navbar-color-scheme-dropdown">
                    <li key={"import"}>
                        <button type={"button"}
                                className="dropdown-item"
                                // data-bs-toggle={"modal"}
                                // data-bs-target={"#color-scheme-import-dialog"}
                                onClick={this.props.onImportClick}>
                            Import Color Schemes...
                        </button>
                    </li>
                    <li key={"export"}>
                        <button type={"button"}
                                className="dropdown-item"
                                data-bs-toggle={"modal"}
                                data-bs-target={"#export-dialog"}
                                onClick={this.props.onExportClick}>
                            Export Color Schemes...
                        </button>
                    </li>
                </ul>
            </li>
        );
    }
}

export default NavbarActions;