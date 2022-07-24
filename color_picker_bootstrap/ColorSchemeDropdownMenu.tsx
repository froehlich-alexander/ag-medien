import classNames from "classnames";
import * as React from "react";
import {MouseEvent} from "react";
import {ColorScheme} from "./color-base/colorpickerBackend";
import {ComponentProps, concatClass, DefaultProps} from "./utils";
import "./styles/ColorSchemeDropdown.scss";

interface ColorSchemeDropdownMenuProps extends DefaultProps {
    colorSchemes: ColorScheme[], // all color schemes
    onColorSchemeSelected: (selectedCS: Readonly<Set<string>>) => any,
    selectedColorSchemes: Set<string>, // these color scheme ids will be selected
    multiple?: boolean, // whether it is possible to select multiple color schemes
    newButton?: boolean, // whether there is a new button which opens the new dialog
    noCustomCSPlaceHolder?: boolean,
}

interface ColorSchemeDropdownMenuState {
}

class ColorSchemeDropdownMenu extends React.Component<ColorSchemeDropdownMenuProps, ColorSchemeDropdownMenuState> {
    constructor(props: ColorSchemeDropdownMenuProps) {
        super(props);
    }

    static defaultProps: ColorSchemeDropdownMenuProps = {
        newButton: true,
        multiple: false,
        noCustomCSPlaceHolder: false,
    } as ColorSchemeDropdownMenuProps;

    public render() {
        let customColorSchemes = this.props.colorSchemes.filter((v: ColorScheme) => !v.preDefined);
        let preDefinedColorSchemes = this.props.colorSchemes.filter((v: ColorScheme) => v.preDefined);

        return (
            <div className={classNames("dropdown input-group", this.props.className)}>
                <label htmlFor="color-scheme-dropdown-menu-trigger-button"
                       className={"input-group-text"}>Color Scheme{this.props.multiple && "s"}</label>
                <button id={"color-scheme-dropdown-menu-trigger-button"}
                        type="button"
                        className="btn btn-primary dropdown-toggle form-control"
                        data-bs-toggle="dropdown"
                        data-bs-auto-close={this.props.multiple ? "outside" : "true"}>
                    Color Scheme
                </button>
                <ul className="dropdown-menu" id="color-schemes-dropdown-menu"
                    onClick={this.handleDropDownClick}>
                    {this.props.newButton && <li key="open-new-cs-dialog-button">
                        <button type="button"
                                data-bs-toggle="modal"
                                data-bs-target="#new-color-scheme-dialog"
                                className="btn dropdown-item">
                            Add
                        </button>
                    </li>}
                    {this.props.newButton && <li key="divider-0">
                        <hr className="dropdown-divider"/>
                    </li>}
                    <li key="predefined-header"><h6 className="dropdown-header">Predefined</h6></li>
                    {preDefinedColorSchemes.map(cs => <ColorSchemeDropdownItem
                        colorScheme={cs}
                        selectedColorSchemes={this.props.selectedColorSchemes}
                        toggleable={this.props.multiple}/>)}

                    <li key="custom-header"><h6 className="dropdown-header"
                                                hidden={customColorSchemes.length === 0 && this.props.noCustomCSPlaceHolder}>
                        Custom
                    </h6></li>
                    <li key="nothing-here-label"><a className="dropdown-item disabled" href="#"
                                                    hidden={customColorSchemes.length > 0 || this.props.noCustomCSPlaceHolder}>
                        Nothing here yet
                    </a></li>
                    {customColorSchemes.map(cs => <ColorSchemeDropdownItem
                        colorScheme={cs}
                        selectedColorSchemes={this.props.selectedColorSchemes}
                        toggleable={this.props.multiple}/>)}
                </ul>
            </div>
        );
    }

    private handleDropDownClick = (e: MouseEvent<HTMLUListElement>) => {
        // our cs items must be <a> elements;we ignore every other click on the ul, other buttons, etc.
        let csElement = (e.target as Element).closest("a");
        if (csElement) {
            const csId = csElement.getAttribute("data-color-scheme-id");
            console.log("csId", e.target, csId);
            if (csId != null) {
                if (csElement.classList.contains("active")) {
                    if (!this.props.selectedColorSchemes.has(csId)) {
                        const newSet = new Set(this.props.selectedColorSchemes);
                        newSet.add(csId);
                        this.props.onColorSchemeSelected(newSet);
                    }
                } else {
                    if (this.props.selectedColorSchemes.has(csId)) {
                        const newSet = new Set(this.props.selectedColorSchemes);
                        newSet.delete(csId);
                        this.props.onColorSchemeSelected(newSet);
                    }
                }
            }
        }
    };
}

interface ColorSchemeDropdownItemProps {
    colorScheme: ColorScheme,
    toggleable?: boolean,
    selectedColorSchemes: Set<string>,
    selected?: boolean,
}

const ColorSchemeDropdownItem = (props: ColorSchemeDropdownItemProps) =>
    (<li key={props.colorScheme.id}>
        <a className={classNames("dropdown-item",
            (props.selected || props.selectedColorSchemes.has(props.colorScheme.id)) && "active")}
           data-color-scheme-id={props.colorScheme.id}
           href="#"
           {...(props.toggleable && {"data-bs-toggle": "button"})}>
            <span className="ColorSchemeDropdownItemText text-truncate d-inline-block">
                {props.colorScheme.name}
            </span>
            {props.colorScheme.current &&
                <span className="badge bg-success rounded-pill ms-2 CenteredBadge">
                    active
                    <span className="visually-hidden">
                        Active Color Scheme
                    </span>
            </span>}
        </a>
    </li>);

ColorSchemeDropdownItem.defaultProps = {
    selected: false,
    toggleable: false,
} as ColorSchemeDropdownItemProps;

export default ColorSchemeDropdownMenu;