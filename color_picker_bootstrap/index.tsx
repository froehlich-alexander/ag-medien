// <reference path="react.d.ts" />
import {
    ColorScheme,
    ColorSchemeTypeOptional,
    ColorSchemeFragment, ColorSchemeFragmentType,
    Designs,
} from "./color-base/colorpickerBackend";

import * as React from "react";
import {MouseEvent} from "react";
import {createRoot} from "react-dom/client";
import ColorPickerService from "./color-base/ColorPickerService";
import {NewColorSchemeDialog} from "./dialogs/new.js";
import {concatClass, DefaultProps} from "./utils.js";
import {ColorPickerForm} from "./forms/colorPickerForm";
import {ColorPickerMetadata} from "./forms/colorPickerMetadata";

//import bootstrap types
// declare var bootstrap: any;
// const Modal: typeof import('bootstrap').Modal = bootstrap.Modal;
// type Modal = import("bootstrap").Modal;

//import react
// declare var React: any;
// declare var ReactDOM: any;
// const Component = React.Component;
// type Component = import("react").Component;
// declare var ReactDOM: any;
// declare var React: import("react");


interface ColorSchemeDropdownMenuProps extends DefaultProps {
    // service: ColorPickerService,
    selectedColorScheme: ColorScheme,
    colorSchemes: ColorScheme[];
    onColorSchemeSelected: (cs: string) => any,
}

interface ColorSchemeDropdownMenuState {

}

class ColorSchemeDropdownMenu extends React.Component<ColorSchemeDropdownMenuProps, ColorSchemeDropdownMenuState> {
    // private colorSchemesCount = 0;
    //
    // private dropDownMenu?: HTMLUListElement;
    // private noCustomColorSchemesPlaceholder?: HTMLAnchorElement;
    //
    // declare props: PropsType<Component> & EventType<ColorSchemeDropdownMenu> & { service: ColorPickerService, colorSchemeId: string };
    // declare events: NormalEventType<Component> & {
    //     "colorSchemeSelected"?: (s: string) => any,
    // }
    // static override eventList: string[] = [
    //     "colorSchemeSelected",
    // ];
    //
    // static override defaultProps: DefaultPropsType<ColorSchemeDropdownMenu> = {}

    constructor(props: ColorSchemeDropdownMenuProps) {
        super(props);
        // props.service.on("add", this.addColorScheme.bind(this));
        // props.service.on("delete", this.removeColorScheme.bind(this));

        this.invokeNewColorScheme = this.invokeNewColorScheme.bind(this);
    }


    public render() {
        // this.colorSchemesCount = [...this.props.service.all.values()].filter(v => !v.preDefined).length;

        let customColorSchemes = this.props.colorSchemes.filter((v: ColorScheme) => !v.preDefined);
        let preDefinedColorSchemes = this.props.colorSchemes.filter((v: ColorScheme) => v.preDefined);

        return (
            <div className={concatClass("btn-group", this.props.className)}>
                <button type="button" className="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown">
                    Color Scheme
                </button>
                <ul className="dropdown-menu" id="color-schemes-dropdown-menu"
                    // onClick={this.colorSchemeSelected.bind(this)}
                    onClick={this.handleDropDownClick}>
                    <li key="open-new-cs-dialog-button">
                        <button type="button"
                                data-bs-toggle="modal"
                                data-bs-target="#new-color-scheme-dialog"
                                className="btn dropdown-item"
                                onClick={this.invokeNewColorScheme}>
                            Add
                        </button>
                    </li>
                    <li key="divider-0">
                        <hr className="dropdown-divider"/>
                    </li>
                    <li key="predefined-header"><h6 className="dropdown-header">Predefined</h6></li>
                    {preDefinedColorSchemes.map(ColorSchemeDropdownItem)}
                    {/*<li><a className="dropdown-item" href="#">Default</a></li>*/}
                    <li key="custom-header"><h6 className="dropdown-header">Custom</h6></li>
                    <li key="nothing-here-label"><a className="dropdown-item disabled" href="#"
                                                    hidden={customColorSchemes.length > 0}>
                        Nothing here yet
                    </a></li>
                    {customColorSchemes.map(ColorSchemeDropdownItem)}
                </ul>
            </div>
        );
    }

    private handleDropDownClick = (e: MouseEvent<HTMLUListElement>) => {
        let csId = (e.target as Element).getAttribute("data-color-scheme-id");
        if (csId != null) {
            this.props.onColorSchemeSelected(csId);
        }
    };

    /**
     * Invokes a creation of a new colorScheme<br>
     * This is used as a callback function for the <add> button
     * @private
     * @deprecated
     */
    private invokeNewColorScheme(): void {
    }

    // /**
    //  * Add a <b>custom</b> color Scheme to the dropdown menu
    //  * @param {ColorScheme} colorScheme
    //  */
    // public addColorScheme(colorScheme: ColorScheme) {
    //     this.colorSchemesCount++;
    //     this.dropDownMenu!.append(ColorSchemeDropdownItem(colorScheme));
    //     this.setVisibilityOfNoCustomColorSchemesPlaceHolder();
    // }
    //
    // /**
    //  * remove a custom color Scheme from the dropdown menu
    //  * @param {ColorScheme} colorScheme
    //  */
    // public removeColorScheme(colorScheme: ColorScheme) {
    //     console.log("remove color scheme from dropdown", colorScheme)
    //     this.colorSchemesCount--;
    //     $(this.dropDownMenu!).find(`[color-scheme-id=${colorScheme.id}]`).remove();
    //     this.setVisibilityOfNoCustomColorSchemesPlaceHolder();
    // }
    //
    // /**
    //  * Fired when the user selects an colorScheme element in the dropdown menu
    //  * @private
    //  * @deprecated
    //  */
    // private colorSchemeSelected(event: MouseEvent) {
    //     let colorSchemeId = (event.target as Element).getAttribute("color-scheme-id");
    //     if (colorSchemeId == null) {
    //         // no color scheme dropDownElement has been clicked
    //         // maybe another action button like the "add" button
    //         return;
    //     }
    //     console.log(this.constructor.name, "colro selected", colorSchemeId);
    //     if (this.props.colorSchemeId == colorSchemeId) {
    //         return
    //     }
    //     let prev = this.props.colorSchemeId;
    //     this.props.colorSchemeId = colorSchemeId;
    //     this.props.onColorSchemeSelected!(colorSchemeId);
    // }
    //
    // private setVisibilityOfNoCustomColorSchemesPlaceHolder() {
    //     console.log("set vis", this.colorSchemesCount)
    //     this.noCustomColorSchemesPlaceholder!.toggleAttribute("hidden", this.colorSchemesCount > 0);
    // }
}

// function initColorSchemeDropdown() {
//     // add pre defined color schemes
//     for (let i of colorPickerService.all.values()) {
//         if (i.preDefined) {
//             colorSchemesDropDownMenu.html.append(<li><a className='dropdown-item' href='#'
//                                                         color-scheme-id={i.id}>{i.name}</a>
//             </li>);
//         }
//     }
//
//     addColorSchemesToDropdown(...colorPickerService.all.values());
// }
//
// /**
//  * Adds color schemes to the dropdown menu
//  * @param
//     {
//             ColorScheme
//         }
//     schemes must not be predefined
//  */
// function addColorSchemesToDropdown(...schemes: ColorScheme[]) {
//     if (!colorSchemesDropDownMenu.headerAdded) {
//         colorSchemesDropDownMenu.html.append(<div className='dropdown-header'>Custom</div>);
//         colorSchemesDropDownMenu.headerAdded = true;
//     }
//     for (let i of schemes) {
//         colorSchemesDropDownMenu.html.append(<li><a href='#' className='dropdown-item'
//                                                     color-scheme-id={i.id}>{i.name}</a>
//         </li>)
//     }
// }

const ColorSchemeDropdownItem = (colorScheme: { id: string, name: string, current: boolean }) =>
    (<li key={colorScheme.id}>
        <a className="dropdown-item"
           href="#"
           data-color-scheme-id={colorScheme.id}>
            {colorScheme.name}
            {colorScheme.current &&
                <span className='badge bg-success rounded-pill start-100 position-absolute'>
                    active
                    <span className='visually-hidden'>
                        Active Color Scheme
                    </span>
            </span>}
        </a>
    </li>);

interface ColorSchemeActionProps extends DefaultProps {
    selectedColorScheme: ColorScheme, // we need it to disable the right buttons, change their tooltips, etc.

    onStateSelected?: (state: ColorSchemeActionsState["selection"]) => any,
    onDelete: () => any,
    onActivate: () => any,
    onEdit: () => any,
}

interface ColorSchemeActionsState {
    selection: typeof ColorSchemeActions.State[keyof typeof ColorSchemeActions.State],
}

class ColorSchemeActions extends React.Component<ColorSchemeActionProps, ColorSchemeActionsState> {
    // private button?: HTMLButtonElement;
    // private dropDownButton?: HTMLButtonElement;
    // private dropDownMenu?: HTMLUListElement;

    constructor(props: ColorSchemeActionProps) {
        super(props);
        this.state = {
            selection: ColorSchemeActions.State["activate"],
        };

        this.buttonShouldBeDisabled = this.buttonShouldBeDisabled.bind(this);
        this.handleStateSelect = this.handleStateSelect.bind(this);
        this.handleButtonClick = this.handleButtonClick.bind(this);
    }

    // static override readonly defaultProps: DefaultPropsType<ColorSchemeActions> = {state: "Activate"}
    // declare props: PropsType<Component> & { service: ColorPickerService, state?: string, colorSchemeId: string };

    static readonly State: { [k in ["activate", "delete", "edit"][number]]: { id: k, name: string, buttonStyle: string } } = {
        activate: {id: "activate", name: "Activate", buttonStyle: "success"},
        delete: {id: "delete", name: "Delete", buttonStyle: "danger"},
        edit: {id: "edit", name: "Edit", buttonStyle: "primary"},
    };

    public render(): JSX.Element {
        console.log("render actions", this.props);
        return (
            <div className={concatClass("btn-group", this.props.className)}>
                <button type="button"
                        disabled={this.buttonShouldBeDisabled(this.state.selection.id)}
                        className={`btn btn-${this.state.selection.buttonStyle}`}
                        onClick={this.handleButtonClick.bind(this)}>
                    {this.state.selection.name}
                </button>
                <button type="button"
                        className={`btn btn-${this.state.selection.buttonStyle} dropdown-toggle dropdown-toggle-split`}
                        data-bs-toggle="dropdown"/>

                <ul className="dropdown-menu"
                    onClick={this.handleStateSelect}>
                    {/*<li><a className="dropdown-item bg-success" href="#">Activate</a></li>*/}
                    {/*<li><a className="dropdown-item bg-danger" href="#">Delete</a></li>*/}
                    {Object.values(ColorSchemeActions.State).map(state =>
                        <li key={state.id}>
                            <button className={`dropdown-item bg-${state.buttonStyle}`}
                                    data-state-id={state.id}
                                    disabled={this.buttonShouldBeDisabled(state.id)}>
                                {state.name}
                            </button>
                        </li>)}
                </ul>
            </div>
        );
    }

    /**
     * Return whether the button of the state given should be disabled or not<br>
     * The result depends on the selected color scheme
     * @param {keyof typeof ColorSchemeActions.State} type
     * @returns {boolean}
     * @private
     */
    private buttonShouldBeDisabled(type: keyof typeof ColorSchemeActions.State): boolean {
        let colorScheme = this.props.selectedColorScheme;
        switch (type) {
            case "activate":
                return colorScheme.preDefined || colorScheme.current;
            case "delete":
                return colorScheme.preDefined || colorScheme.current;
            case "edit":
                return false;
        }
    }

    private handleStateSelect(event: MouseEvent) {
        let stateId = (event.target as Element).getAttribute("data-state-id");
        if (stateId) {
            let state = ColorSchemeActions.State[stateId as keyof typeof ColorSchemeActions.State];

            if (state != null) {
                this.setState({
                    selection: state,
                });
                this.props.onStateSelected?.(state);
            } else {
                console.warn(ColorSchemeActions.name, "state == null", state, stateId);
            }
            console.log("state changed", state);
        }
        // let prev = this.props.state!;
        // this.props.state! = state;
        // this.button?.classList.remove("btn-" + ColorSchemeActions.states[prev]);
        // this.button?.classList.add("btn-" + ColorSchemeActions.states[state])
        // this.button!.innerHTML = state
        // this.dropDownButton?.classList.remove("btn-" + ColorSchemeActions.states[prev]);
        // this.dropDownButton?.classList.add("btn-" + ColorSchemeActions.states[state])
    }

    private handleButtonClick() {
        switch (this.state.selection.id) {
            case "activate":
                this.props.onActivate();
                break;
            case "delete":
                this.props.onDelete();
                break;
            case "edit":
                this.props.onEdit();
                break;
        }

        // let colorScheme = this.props.service.getColorScheme(this.props.colorSchemeId)
        // if (colorScheme == null) {
        //     console.warn("button on non existent color scheme clicked");
        //     return
        // }
        // switch (this.props.state!) {
        //     case "Activate":
        //         this.props.service.activate(colorScheme);
        //         break;
        //     case "Delete":
        //         this.props.service.delete(colorScheme);
        //         break;
        //     case "Edit":
        //         break;
        // }
    }

    // public setColorSchemeId(id: string) {
    //     console.log((this.constructor as typeof Component).name, "setCOlorSchemeID", id)
    //     this.props.colorSchemeId = id;
    // }
}

const NavBar = (props: DefaultProps & { onClose: (event: MouseEvent<HTMLButtonElement>) => any }) =>
    <nav className={concatClass("navbar navbar-expand bg-dark navbar-dark", props.className)}>
        <div className="container-fluid">
            <a className="navbar-brand">Color Picker</a>
            <ul className="navbar-nav">
            </ul>
            <button className="btn-close btn" type="button" onClick={props.onClose}></button>
        </div>
    </nav>;

interface ColorPickerProps extends DefaultProps {
}

interface ColorPickerState {
    selectedColorScheme: ColorScheme, // the color scheme which is selected by the user and on which actions like delete will apply
    activeColorScheme: ColorScheme, // the color scheme which got activated via ColorSchemeService.activate()
    newColorSchemeDialogVisibility: boolean,
    allColorSchemes: ColorScheme[];
}

class ColorPicker extends React.Component<ColorPickerProps, ColorPickerState> {
    // declare props: PropsType<Component> & { service: ColorPickerService };
    private service: ColorPickerService;

    constructor(props: ColorPickerProps) {
        super(props);
        this.service = new ColorPickerService();
        this.state = {
            selectedColorScheme: this.service.getCurrent(),
            newColorSchemeDialogVisibility: false, // = dialog hidden
            allColorSchemes: this.service.allList,
            activeColorScheme: this.service.getCurrent(),
        };
    }

    public render(): JSX.Element {

        // update NewColorSchemeDialog and ColorSchemeActions when a new CS is selected
        // (colorSchemeDropdownMenu.jsObject! as ColorSchemeDropdownMenu).on("colorSchemeSelected",
        //     (newColorSchemeDialog.jsObject! as NewColorSchemeDialog).setParentColorScheme.bind(newColorSchemeDialog.jsObject!));
        // (colorSchemeDropdownMenu.jsObject! as ColorSchemeDropdownMenu).on("colorSchemeSelected",
        //     (colorSchemeActions.jsObject! as ColorSchemeActions).setColorSchemeId.bind(colorSchemeActions.jsObject!))

        return (
            <div className={concatClass("container p-5", this.props.className)}>
                <NavBar onClose={() => console.log("colorpicker closed")}></NavBar>
                <NewColorSchemeDialog
                    allColorSchemes={this.state.allColorSchemes}
                    hidden={!this.state.newColorSchemeDialogVisibility}
                    onDialogVisibilityChange={(visibility) => this.setState({newColorSchemeDialogVisibility: visibility})}
                    defaultDesign={Designs.system}
                    selectedColorScheme={this.state.selectedColorScheme}
                    onNewColorScheme={this.handleNewColorScheme}/>

                <div className="row">
                    <ColorSchemeDropdownMenu
                        selectedColorScheme={this.state.selectedColorScheme}
                        colorSchemes={this.state.allColorSchemes}
                        onColorSchemeSelected={this.handleColorSchemeSelected}
                        className="col-5"/>
                    <div className="col-2"></div>
                    <ColorSchemeActions selectedColorScheme={this.state.selectedColorScheme}
                                        onActivate={this.handleActivate}
                                        onDelete={this.handleDelete}
                                        onEdit={this.handleEdit}
                                        className="col-5"/>
                </div>
                <div className="accordion" id="color-picker-main-accordion">
                    <div className="accordion-item">
                        {/*Color Picker*/}
                        <h2 className="accordion-header" id="color-picker-form-header">
                            <button className="accordion-button" type="button" data-bs-toggle="collapse"
                                    data-bs-target="#color-picker-form" aria-expanded="true"
                                    aria-controls="color-picker-form">
                                Colors
                            </button>
                        </h2>
                        <div id="color-picker-form" className="accordion-collapse collapse show"
                             aria-labelledby="color-picker-form-header"
                             data-bs-parent="#color-picker-main-accordion">
                            <div className="accordion-body">
                                <ColorPickerForm colorTypes={this.service.colorTypes}
                                                 selectedColorScheme={this.state.selectedColorScheme}
                                                 onColorSchemeChange={this.handleColorSchemeChange}/>
                            </div>
                        </div>

                        {/*Edit Color Scheme*/}
                        <h2 className="accordion-header" id="edit-color-scheme-metadata-header">
                            <button className="accordion-button" type="button" data-bs-toggle="collapse"
                                    data-bs-target="#edit-color-scheme-metadata" aria-expanded="true"
                                    aria-controls="edit-color-scheme-metadata">
                                Color Scheme Metadata
                            </button>
                        </h2>
                        <div id="edit-color-scheme-metadata" className="accordion-collapse collapse"
                             aria-labelledby="edit-color-scheme-metadata-header"
                             data-bs-parent="#color-picker-main-accordion">
                            <div className="accordion-body">
                                <ColorPickerMetadata selectedColorScheme={this.state.selectedColorScheme}
                                                     onUpdate={this.handleColorSchemeChange}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    private handleColorSchemeSelected = (colorSchemeId: string) => {
        let colorScheme = this.service.getColorScheme(colorSchemeId);
        if (colorScheme != null && colorScheme != this.state.selectedColorScheme) {
            this.setState({
                selectedColorScheme: colorScheme,
            });
        }
    };

    private handleNewColorScheme = (colorScheme: ColorSchemeFragmentType) => {
        this.service.newColorScheme(colorScheme);
        this.setState({
            newColorSchemeDialogVisibility: false,
            allColorSchemes: this.service.allList,
        });
    };

    private handleActivate = (): void => {
        this.service.activate(this.state.selectedColorScheme);
        this.setState({
            activeColorScheme: this.service.getCurrent(),
        });
    };

    private handleDelete = (): void => {
        let newSelectedColorScheme = this.service.getCurrent();
        this.service.delete(this.state.selectedColorScheme);
        this.setState({
            selectedColorScheme: newSelectedColorScheme,
            allColorSchemes: this.service.allList,
        });
    };

    private handleColorSchemeChange = (colorSchemeFragment: ColorSchemeFragmentType) => {
        const selected = this.state.selectedColorScheme;
        const edited = selected.withUpdate(colorSchemeFragment);
        console.log("cs change", colorSchemeFragment, selected, edited);

        if (!selected.equals(edited)) {
            console.log("cs unequal, update");
            this.service.setColorScheme(edited);
            this.setState({
                selectedColorScheme: this.service.getColorScheme(selected.id)!,
                activeColorScheme: this.service.getCurrent(),
                allColorSchemes: this.service.allList,
            });
        }

        // let serviceColorScheme = this.service.getColorScheme(colorScheme.id)!;
        // if (!colorScheme.equals(serviceColorScheme)) {
        //     colorScheme.copy(serviceColorScheme);
        //
        //     if (this.state.activeColorScheme.id == serviceColorScheme.id || this.state.selectedColorScheme.id == serviceColorScheme.id) {
        //         this.setState({
        //             activeColorScheme: this.service.getCurrent(),
        //             selectedColorScheme: this.service.getColorScheme(this.state.selectedColorScheme.id)!,
        //             allColorSchemes: this.service.allList,
        //         });
        //     }
        // }

    };

    private handleEdit = (): void => {
        //todo implement edit dialog
    };
}

const root = createRoot(
    document.getElementById("color-picker-root")!);
root.render(<ColorPicker/>);
