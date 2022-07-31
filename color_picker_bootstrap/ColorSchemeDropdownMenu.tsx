import classNames from "classnames";
import * as React from "react";
import {MouseEvent, useCallback, useContext, useMemo} from "react";
import {Button} from "react-bootstrap";
import {ColorScheme} from "./color-base/colorpickerBackend";
import ColorPickerContext from "./ColorPickerContext";
import {ComponentProps, concatClass, DefaultProps} from "./utils";
import "./styles/ColorPicker.scss";

interface ColorSchemeDropdownMenuProps extends DefaultProps {
    colorSchemes: ColorScheme[], // all color schemes
    onColorSchemeSelected: (selectedCS: Readonly<Set<string>>) => any,
    selectedColorSchemes: Set<string>, // these color scheme ids will be selected
    multiple?: boolean, // whether it is possible to select multiple color schemes
    newButton?: boolean, // whether there is a new button which opens the new dialog
    disablePlaceholderIfNoCustomCS?: boolean,
    formText?: string,
    oneItemRequired?: boolean,
    // Whether "preDefined" and "custom" headers are present
    hasHeaders?: boolean,
}

// interface ColorSchemeDropdownMenuState {
// }
//
// class ColorSchemeDropdownMenu extends React.Component<ColorSchemeDropdownMenuProps, ColorSchemeDropdownMenuState> {
//     constructor(props: ColorSchemeDropdownMenuProps) {
//         super(props);
//     }

// static defaultProps: ColorSchemeDropdownMenuProps = {
//     newButton: true,
//     multiple: false,
//     disablePlaceholderIfNoCustomCS: false,
//     oneItemRequired: true,
//     hasHeaders: true,
// } as ColorSchemeDropdownMenuProps;
function ColorSchemeDropdownMenu(props: ColorSchemeDropdownMenuProps) {
    let customColorSchemes = useMemo(() => props.colorSchemes.filter((v: ColorScheme) => !v.preDefined), [props.colorSchemes]);
    let preDefinedColorSchemes = useMemo(() => props.colorSchemes.filter((v: ColorScheme) => v.preDefined), props.colorSchemes);
    console.log(props.selectedColorSchemes);
    const colorPickerContext = useContext(ColorPickerContext);

    const handleDropDownClick = useCallback((e: MouseEvent<HTMLUListElement>) => {
        // our cs items must be <a> elements;we ignore every other click on the ul, other buttons, etc.
        let csElement = (e.target as Element).closest("a");
        if (csElement) {
            const csId = csElement.getAttribute("data-color-scheme-id");
            console.log("csId", e.target, csId);
            if (csId != null) {
                if (props.multiple) {
                    if (csElement.classList.contains("active")) {
                        if (!props.selectedColorSchemes.has(csId)) {
                            const newSet = new Set(props.selectedColorSchemes);
                            newSet.add(csId);
                            props.onColorSchemeSelected(newSet);
                        }
                    } else {
                        if (props.selectedColorSchemes.has(csId)) {
                            const newSet = new Set(props.selectedColorSchemes);
                            newSet.delete(csId);
                            props.onColorSchemeSelected(newSet);
                        }
                    }
                } else {
                    const newSet = new Set<string>();
                    newSet.add(csId);
                    props.onColorSchemeSelected(newSet);
                }
            }
        }
    }, [props.multiple, props.selectedColorSchemes, props.onColorSchemeSelected]);

    return (
        <div className={classNames("dropdown input-group ColorSchemeDropdownMenu", props.className)}>

            <label htmlFor="color-scheme-dropdown-menu-trigger-button"
                   className={"input-group-text"}>Color Scheme{props.multiple && "s"}</label>
            <input type={"checkbox"}
                   checked={props.selectedColorSchemes.size > 0}
                   required={props.oneItemRequired}
                   readOnly
                   className={"d-none"}/>
            <button id={"color-scheme-dropdown-menu-trigger-button"}
                    type="button"
                    className={classNames("btn btn-primary dropdown-toggle form-control",
                        // props.oneItemRequired && (props.selectedColorSchemes.size === 0 ? "is-invalid" : "is-valid")
                    )}
                    data-bs-toggle="dropdown"
                    data-bs-auto-close={props.multiple ? "outside" : "true"}>
                {props.multiple &&
                    <span className={"badge bg-secondary me-2"}>{props.selectedColorSchemes.size}</span>}
                {props.multiple ? "Color Schemes" : props.colorSchemes.find(v => props.selectedColorSchemes.has(v.id))!.name}
            </button>
            <span className="invalid-feedback">You need to select at least 1 item</span>
            <ul className="dropdown-menu" id="color-schemes-dropdown-menu"
                onClick={handleDropDownClick}>
                {props.newButton && <li key="open-new-cs-dialog-button">
                    <Button variant="primary"
                            onClick={() => colorPickerContext.toggleNewDialogVisibility(true)}
                        // data-bs-toggle="modal"
                        // data-bs-target="#new-color-scheme-dialog"
                            className="dropdown-item">
                        Add
                    </Button>
                </li>}
                {props.newButton && <li key="divider-0">
                    <hr className="dropdown-divider"/>
                </li>}
                {props.hasHeaders &&
                    <li key="predefined-header"><h6 className="dropdown-header">Predefined</h6></li>}
                {preDefinedColorSchemes.map(cs => <ColorSchemeDropdownItem
                    colorScheme={cs}
                    selectedColorSchemes={props.selectedColorSchemes}
                    toggleable={props.multiple}/>)}

                {props.hasHeaders && <li key="custom-header"><h6 className="dropdown-header"
                                                                 hidden={customColorSchemes.length === 0 && props.disablePlaceholderIfNoCustomCS}>
                    Custom
                </h6></li>}
                <li key="nothing-here-label"><a className="dropdown-item disabled" href="#"
                                                hidden={customColorSchemes.length > 0 || props.disablePlaceholderIfNoCustomCS}>
                    Nothing here yet
                </a></li>
                {customColorSchemes.map(cs => <ColorSchemeDropdownItem
                    colorScheme={cs}
                    selectedColorSchemes={props.selectedColorSchemes}
                    toggleable={props.multiple}/>)}
            </ul>
            <span className="form-text col-12">{props.formText}</span>
        </div>
    );
}

ColorSchemeDropdownMenu.defaultProps = {
    newButton: true,
    multiple: false,
    disablePlaceholderIfNoCustomCS: false,
    oneItemRequired: true,
    hasHeaders: true,
} as ColorSchemeDropdownMenuProps;

interface ColorSchemeDropdownItemProps {
    colorScheme: ColorScheme,
    toggleable?: boolean,
    selectedColorSchemes: Set<string>,
    selected?: boolean,
}

const ColorSchemeDropdownItem = (props: ColorSchemeDropdownItemProps) => {
    const selected = props.selected || props.selectedColorSchemes.has(props.colorScheme.id);
    return (
        <li key={props.colorScheme.id}>
            <a className={classNames("dropdown-item ColorSchemeDropdownItem", selected && "active")}
               data-color-scheme-id={props.colorScheme.id}
               href="#"
               {...(props.toggleable && {"data-bs-toggle": "button"})}>
                <input className="form-check-input me-2 align-middle translate-middle-y"
                       readOnly
                       type="checkbox"
                       checked={selected}/>
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
        </li>
    );
};

ColorSchemeDropdownItem.defaultProps = {
    selected: false,
    toggleable: false,
} as ColorSchemeDropdownItemProps;

export default ColorSchemeDropdownMenu;