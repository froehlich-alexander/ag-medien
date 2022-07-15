// <reference path="react.d.ts" />
import {
    ColorPickerService,
    ColorScheme,
    ColorSchemeData, ColorSchemeType,
    ColorSchemeTypeOptional,
    Designs
} from "./colorpickerBackend";

import * as bootstrap from 'bootstrap';
import * as $ from 'jquery';

import * as React from "react";
import {
    ChangeEvent, FormEvent,
    MouseEvent,
} from 'react';
import {createRoot} from "react-dom/client";

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

interface DefaultProps {
    className?: string,
}

function concatClass(...classes: (string | undefined)[]): string | undefined {
    return classes.filter(v => v != null).join(" ") ?? undefined;
}


interface ColorSchemeDropdownMenuProps extends DefaultProps {
    // service: ColorPickerService,
    activeColorScheme: ColorScheme,
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
    }


    public render() {
        // this.colorSchemesCount = [...this.props.service.all.values()].filter(v => !v.preDefined).length;

        let customColorSchemes = this.props.colorSchemes.filter((v: ColorScheme) => !v.preDefined);
        let preDefinedColorSchemes = this.props.colorSchemes.filter((v: ColorScheme) => v.preDefined);

        return (
            <div className={concatClass('btn-group', this.props.className)}>
                <button type="button" className="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown">
                    Color Scheme
                </button>
                <ul className="dropdown-menu" id="color-schemes-dropdown-menu"
                    // onClick={this.colorSchemeSelected.bind(this)}
                    onClick={this.handleDropDownClick}>
                    <li key='open-new-cs-dialog-button'>
                        <button type='button'
                                data-bs-toggle='modal'
                                data-bs-target='#new-color-scheme-dialog'
                                className="btn dropdown-item"
                                onClick={this.invokeNewColorScheme.bind(this)}>
                            Add
                        </button>
                    </li>
                    <li key='divider-0'>
                        <hr className="dropdown-divider"/>
                    </li>
                    <li key='predefined-header'><h6 className="dropdown-header">Predefined</h6></li>
                    {preDefinedColorSchemes.map(ColorSchemeDropdownItem)}
                    {/*<li><a className="dropdown-item" href="#">Default</a></li>*/}
                    <li key='custom-header'><h6 className='dropdown-header' >Custom</h6></li>
                    <li key='nothing-here-label'><a className='dropdown-item disabled'  href='#'
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
    }

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

const ColorSchemeDropdownItem = (colorScheme: { id: string, name: string }) =>
    (<li key={colorScheme.id}>
        <a className='dropdown-item'
           href='#'
           data-color-scheme-id={colorScheme.id}>
            {colorScheme.name}
        </a>
    </li>);

interface ColorSchemeActionProps extends DefaultProps {
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
        }
    }

    // static override readonly defaultProps: DefaultPropsType<ColorSchemeActions> = {state: "Activate"}
    // declare props: PropsType<Component> & { service: ColorPickerService, state?: string, colorSchemeId: string };
    static readonly State = {
        activate: {name: "Activate", buttonStyle: "success"},
        delete: {name: "Delete", buttonStyle: "danger"},
        edit: {name: "Edit", buttonStyle: "primary"},
    };

    public render(): JSX.Element {
        console.log("render actions", this.props)
        return (
            <div className={concatClass("btn-group", this.props.className)}>
                <button type="button"
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
                    {Object.entries(ColorSchemeActions.State).map(([id, {name, buttonStyle}]) =>
                        <li key={id}><a className={`dropdown-item bg-${buttonStyle}`} data-state-id={id}
                               href='#'>{name}</a>
                        </li>)}
                </ul>
            </div>
        );
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
                console.warn(ColorSchemeActions.name, "state == null", state, stateId)
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
        //switch id (= key in ColorSchemeAction.State) of this.state.selection
        switch (Object.entries(ColorSchemeActions.State).find(([k, v]) =>
            v == this.state.selection)![0] as keyof typeof ColorSchemeActions.State) {
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
    </nav>

interface ColorPickerProps extends DefaultProps {
    service: ColorPickerService,
}

interface ColorPickerState {
    activeColorScheme: ColorScheme,
}

class ColorPicker extends React.Component<ColorPickerProps, ColorPickerState> {
    // declare props: PropsType<Component> & { service: ColorPickerService };

    constructor(props: ColorPickerProps) {
        super(props);
        this.state = {
            activeColorScheme: props.service.getDefault(),
        }
    }

    public render(): JSX.Element {

        // update NewColorSchemeDialog and ColorSchemeActions when a new CS is selected
        // (colorSchemeDropdownMenu.jsObject! as ColorSchemeDropdownMenu).on("colorSchemeSelected",
        //     (newColorSchemeDialog.jsObject! as NewColorSchemeDialog).setParentColorScheme.bind(newColorSchemeDialog.jsObject!));
        // (colorSchemeDropdownMenu.jsObject! as ColorSchemeDropdownMenu).on("colorSchemeSelected",
        //     (colorSchemeActions.jsObject! as ColorSchemeActions).setColorSchemeId.bind(colorSchemeActions.jsObject!))

        return (
            <div className={concatClass('container p-5', this.props.className)}>
                <NavBar onClose={() => console.log("colorpicker closed")}></NavBar>
                <NewColorSchemeDialog
                    defaultDesign={Designs.system}
                    activeColorScheme={this.state.activeColorScheme}
                    onNewColorScheme={this.handleNewColorScheme}/>

                <div className='row'>
                    <ColorSchemeDropdownMenu
                        activeColorScheme={this.state.activeColorScheme}
                        colorSchemes={this.props.service.allList}
                        onColorSchemeSelected={this.handleColorSchemeSelected}
                        className='col-5'/>
                    <div className='col-2'></div>
                    <ColorSchemeActions onActivate={this.handleActivate}
                                        onDelete={this.handleDelete}
                                        onEdit={this.handleEdit}
                                        className='col-5'/>
                </div>
            </div>
        );
    }

    private handleColorSchemeSelected = (colorSchemeId: string) => {
        let colorScheme = this.props.service.getColorScheme(colorSchemeId);
        if (colorScheme != null && colorScheme != this.state.activeColorScheme) {
            this.setState({
                activeColorScheme: colorScheme,
            });
        }
    }

    private handleNewColorScheme = (colorScheme: ColorSchemeFragmentType) => {
        this.props.service.newColorScheme(colorScheme);
    }

    private handleActivate = (): void => {
        this.props.service.activate(this.state.activeColorScheme);
    }

    private handleDelete = (): void => {
        this.props.service.delete(this.state.activeColorScheme);
        //todo we now have an "deleted" colorscheme as state
    }

    private handleEdit = (): void => {
        //todo implement edit dialog
    }

}

interface NewColorSchemeDialogProps extends DefaultProps {
    onNewColorScheme: (colorScheme: ColorSchemeFragmentType) => any,
    activeColorScheme: ColorScheme, // used to get e.g. the colors for the new colorscheme
    defaultDesign: Designs,
}

interface NewColorSchemeDialogState {
    // workingColorScheme: ColorSchemeTypeOptional, // the attributes of the form are saved here
    name: string,
    description: string,
    author: string,
    design: Designs,
}

type ColorSchemeFragmentType = { [k in Exclude<keyof ColorSchemeType, "id" | "preDefined" | "current">]: ColorSchemeType[k] };

class NewColorSchemeDialog extends React.Component<NewColorSchemeDialogProps, NewColorSchemeDialogState> {
    // modal ?: Modal;
    //
    // declare events: NormalEventType<Component> & {
    //     colorSchemeCreated?: (colorScheme: ColorScheme) => any,
    // };
    //
    // static override eventList = [
    //     "colorSchemeCreated",
    // ];

    constructor(props: NewColorSchemeDialogProps) {
        super(props);
        this.state = {
            name: "",
            description: "",
            author: "",
            design: props.defaultDesign,
        }

        this.handleInputChange = this.handleInputChange.bind(this);
    }

    public render(): JSX.Element {
        console.log(this.constructor.name, "Designs", Object.keys(Designs), Object.entries(Designs))

        return (
            <div className={concatClass('modal fade', this.props.className)}
                 id='new-color-scheme-dialog'
                 tabIndex={-1} aria-hidden={true}
                 aria-labelledby='Dialog to create a new Color Scheme'>
                <div className='modal-dialog modal-dialog-centered'>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>New Color Scheme</h5>
                            <button className='btn-close' type='button' data-bs-dismiss='modal'
                                    aria-label='Close'></button>
                        </div>
                        <div className='modal-body'>
                            <form id='new-cs-form'
                                  action='javascript:void(0);'
                                  onSubmit={this.createNewColorScheme.bind(this)}>

                                {/*Parent Color Scheme*/}
                                <div className='mb-3'>
                                    <label htmlFor='new-cs-paren-cs-input' className='form-label'>Colors</label>
                                    <select id='new-cs-parent-cs-input'
                                            name='colorScheme'
                                            className='form-select'
                                            value={this.props.activeColorScheme.id}
                                            disabled>
                                        <option value={this.props.activeColorScheme.id}>
                                            {this.props.activeColorScheme.name}
                                        </option>
                                    </select>
                                    <div className='form-text'>You can later manually edit the colors</div>
                                </div>

                                {/*Name*/}
                                <div className='mb-3'>
                                    <label htmlFor='new-cs-name-input' className='form-label'>Name</label>
                                    <input id="new-cs-name-input"
                                           name='name'
                                           value={this.state.name}
                                           onChange={this.handleInputChange}
                                           aria-describedby='new-cs-name-invalid'
                                           className='form-control'
                                           type='text'
                                           required
                                           placeholder="Your Color Scheme's name"/>
                                    <div id='new-cs-name-invalid' className='invalid-feedback'>
                                        You must provide a name
                                    </div>
                                </div>

                                {/*Description*/}
                                <div className='mb-3'>
                                    <label htmlFor='new-cs-description-input'
                                           className='form-label'>Description</label>
                                    <textarea id="new-cs-description-input"
                                              name='description'
                                              value={this.state.description}
                                              onChange={this.handleInputChange}
                                              aria-describedby="new-cs-description-invalid"
                                              className='form-control'
                                              placeholder='A very interesting description...'/>
                                </div>

                                {/*Author*/}
                                <div className='mb-3'>
                                    <label htmlFor='new-cs-author-input' className='form-label'>Author</label>
                                    <input id="new-cs-author-input"
                                           name='author'
                                           value={this.state.author}
                                           onChange={this.handleInputChange}
                                           aria-describedby='new-cs-author-invalid'
                                           type='text'
                                           required
                                           className='form-control'
                                           placeholder={this.props.activeColorScheme.author}/>
                                    <div id='new-cs-author-invalid' className='invalid-feedback'>
                                        You must provide an author
                                    </div>
                                </div>

                                {/*Design*/}
                                <div className='mb-3'>
                                    <label htmlFor='new-cs-design-select' className='form-label'>Design</label>
                                    <select id="new-cs-design-select"
                                            name='design'
                                            value={this.state.design}
                                            onChange={this.handleInputChange}
                                            className='form-select'
                                            required>
                                        {Object.entries(Designs).map(([k, v]) =>
                                            <option value={v}>{v}</option>
                                        )}
                                    </select>
                                </div>
                            </form>
                        </div>
                        <div className='modal-footer'>
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel
                            </button>
                            <button type="submit" form='new-cs-form'
                                    className="btn btn-primary">Add
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    private handleInputChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
        const target = event.target;
        const type = target.type;
        const name: keyof NewColorSchemeDialogState = target.name as keyof NewColorSchemeDialogState;
        let value: NewColorSchemeDialogState[typeof name];
        switch (type) {
            // case "checkbox":
            //     value = (target as HTMLInputElement).checked;
            //     break;
            default:
                value = target.value;
        }
        // @ts-ignore
        this.setState({
            [name]: value,
        });
    }

    private createNewColorScheme(event: FormEvent): void {
        // let formData = new FormData(event.target as HTMLFormElement);
        // console.log(this.constructor.name, "create new color sceheme form data:", formData);
        // let colorScheme = new ColorScheme({
        //     name: (formData.get("name")!),
        //     description: formData.get("description")!,
        //     author: formData.get("author")!,
        //     design: formData.get("design")!,
        //     colors: this.props.activeColorScheme.colors,
        // });
        this.props.onNewColorScheme({
            ...this.state,
            colors: this.props.activeColorScheme.colors,
        });
        // let newColorScheme = this.props.service.newColorScheme({
        //     name: this.inputs!.name.value,
        //     description: this.inputs!.description.value,
        //     author: this.inputs!.author.value,
        //     design: Designs[this.inputs!.design.value as "dark" | "light" | "system"],
        //     colors: this.props.parentColorScheme.colors
        // });
        // this.props.onColorSchemeCreated!(newColorScheme);
        // console.log(this.constructor.name, newColorScheme);
        // this.modal!.hide();
    }

    //
    // public setParentColorScheme(colorSchemeId: string) {
    //     if (this.props.parentColorScheme.id == colorSchemeId) {
    //         return
    //     }
    //     let colorScheme = this.props.service.getColorScheme(colorSchemeId)!;
    //     this.props.parentColorScheme = colorScheme;
    //     this.inputs?.parentColorScheme!.add(<option selected
    //                                                 value={colorScheme.id}>{colorScheme.name}</option> as HTMLOptionElement);
    // }
}

const root = createRoot(
    document.getElementById("color-picker-root")!);
root.render(<ColorPicker service={new ColorPickerService()}></ColorPicker>);
