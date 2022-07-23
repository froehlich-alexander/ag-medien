import classNames from "classnames";
import * as React from "react";
import {MouseEvent} from "react";
import {ColorScheme} from "./color-base/colorpickerBackend";
import {concatClass, DefaultProps} from "./utils";
import "./styles/ColorSchemeDropdown.scss";

interface ColorSchemeDropdownMenuProps extends DefaultProps {
    // service: ColorPickerService,
    selectedColorScheme: ColorScheme,
    colorSchemes: ColorScheme[];
    onColorSchemeSelected: (cs: string) => any,
}

interface ColorSchemeDropdownMenuState {

}

class ColorSchemeDropdownMenu extends React.Component<ColorSchemeDropdownMenuProps, ColorSchemeDropdownMenuState> {
    constructor(props: ColorSchemeDropdownMenuProps) {
        super(props);
    }


    public render() {
        let customColorSchemes = this.props.colorSchemes.filter((v: ColorScheme) => !v.preDefined);
        let preDefinedColorSchemes = this.props.colorSchemes.filter((v: ColorScheme) => v.preDefined);

        return (
            <div className={concatClass("btn-group", this.props.className)}>
                <button type="button" className="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown">
                    Color Scheme
                </button>
                <ul className="dropdown-menu" id="color-schemes-dropdown-menu"
                    onClick={this.handleDropDownClick}>
                    <li key="open-new-cs-dialog-button">
                        <button type="button"
                                data-bs-toggle="modal"
                                data-bs-target="#new-color-scheme-dialog"
                                className="btn dropdown-item">
                            Add
                        </button>
                    </li>
                    <li key="divider-0">
                        <hr className="dropdown-divider"/>
                    </li>
                    <li key="predefined-header"><h6 className="dropdown-header">Predefined</h6></li>
                    {preDefinedColorSchemes.map(cs => ColorSchemeDropdownItem(cs, this.props.selectedColorScheme.id))}
                    <li key="custom-header"><h6 className="dropdown-header">Custom</h6></li>
                    <li key="nothing-here-label"><a className="dropdown-item disabled" href="#"
                                                    hidden={customColorSchemes.length > 0}>
                        Nothing here yet
                    </a></li>
                    {customColorSchemes.map(cs => ColorSchemeDropdownItem(cs, this.props.selectedColorScheme.id))}
                </ul>
            </div>
        );
    }

    private handleDropDownClick = (e: MouseEvent<HTMLUListElement>) => {
        // our cs items must be <a> nodes;we ignore every other click on the ul buttons, etc.
        let csId = (e.target as Element).closest("a")?.getAttribute("data-color-scheme-id");
        console.log("csId", e.target, csId);
        if (csId != null) {
            this.props.onColorSchemeSelected(csId);
        }
    };
}

const ColorSchemeDropdownItem = (colorScheme: ColorScheme, activeColorSchemeId: string) =>
    (<li key={colorScheme.id}>
        <a className={classNames("dropdown-item", {"bg-secondary bg-opacity-25": activeColorSchemeId == colorScheme.id})}
           href="#"
           data-color-scheme-id={colorScheme.id}>
            <span className="ColorSchemeDropdownItemText text-truncate d-inline-block">
                {colorScheme.name}
            </span>
            {colorScheme.current &&
                <span className="badge bg-success rounded-pill ms-2 CenteredBadge">
                    active
                    <span className="visually-hidden">
                        Active Color Scheme
                    </span>
            </span>}
        </a>
    </li>);

export default ColorSchemeDropdownMenu;