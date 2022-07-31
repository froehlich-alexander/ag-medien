import classNames from "classnames";
import React, {useCallback, useContext} from "react";
import {Dropdown} from "react-bootstrap";
import ColorPickerContext from "./ColorPickerContext";
import {DefaultProps} from "./utils";

interface NavbarActionsProps extends DefaultProps {
}

function NavbarActions(props: NavbarActionsProps) {
    const colorPickerContext = useContext(ColorPickerContext);

    const showNewDialog = useCallback(() => colorPickerContext.toggleNewDialogVisibility(true), [colorPickerContext.toggleNewDialogVisibility]);
    const showImportDialog = useCallback(() => colorPickerContext.toggleImportDialogVisibility(true), [colorPickerContext.toggleImportDialogVisibility]);
    const showExportDialog = useCallback(() => colorPickerContext.toggleExportDialogVisibility(true), [colorPickerContext.toggleExportDialogVisibility]);

    return (
        <li className="dropdown nav-item" key="navbar-actions">
            <a className={classNames("dropdown-toggle nav-link", props.className)}
               data-bs-toggle="dropdown"
               href="#"
               role="button"
               id="navbar-color-scheme-dropdown">
                Actions
            </a>
            <ul className="dropdown-menu"
                aria-labelledby="navbar-color-scheme-dropdown">
                <li key="new">
                    <Dropdown.Item onClick={showNewDialog}>
                        New Color Scheme
                    </Dropdown.Item>
                </li>
                <li key="import">
                    <Dropdown.Item
                        // data-bs-toggle={"modal"}
                        // data-bs-target={"#color-scheme-import-dialog"}
                        onClick={showImportDialog}>
                        Import Color Schemes...
                    </Dropdown.Item>
                </li>
                <li key="export">
                    <Dropdown.Item
                        // data-bs-toggle={"modal"}
                        // data-bs-target={"#export-dialog"}
                        onClick={showExportDialog}>
                        Export Color Schemes...
                    </Dropdown.Item>
                </li>
            </ul>
        </li>
    );
}

export default NavbarActions;