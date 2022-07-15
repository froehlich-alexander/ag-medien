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
    ChangeEvent, createRef, FormEvent,
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
                                onClick={this.invokeNewColorScheme}>
                            Add
                        </button>
                    </li>
                    <li key='divider-0'>
                        <hr className="dropdown-divider"/>
                    </li>
                    <li key='predefined-header'><h6 className="dropdown-header">Predefined</h6></li>
                    {preDefinedColorSchemes.map(ColorSchemeDropdownItem)}
                    {/*<li><a className="dropdown-item" href="#">Default</a></li>*/}
                    <li key='custom-header'><h6 className='dropdown-header'>Custom</h6></li>
                    <li key='nothing-here-label'><a className='dropdown-item disabled' href='#'
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
        }

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
        console.log("render actions", this.props)
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
                return colorScheme.preDefined;
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
    </nav>

interface ColorPickerProps extends DefaultProps {
    service: ColorPickerService,
}

interface ColorPickerState {
    selectedColorScheme: ColorScheme, // the color scheme which is selected by the user and on which actions like delete will apply
    activeColorScheme: ColorScheme, // the color scheme which got activated via ColorSchemeService.activate()
    newColorSchemeDialogVisibility: boolean,
    allColorSchemes: ColorScheme[];
}

class ColorPicker extends React.Component<ColorPickerProps, ColorPickerState> {
    // declare props: PropsType<Component> & { service: ColorPickerService };

    constructor(props: ColorPickerProps) {
        super(props);
        this.state = {
            selectedColorScheme: props.service.getDefault(),
            newColorSchemeDialogVisibility: false, // = dialog hidden
            allColorSchemes: this.props.service.allList,
            activeColorScheme: this.props.service.getCurrent(),
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
                    hidden={!this.state.newColorSchemeDialogVisibility}
                    onDialogVisibilityChange={(visibility) => this.setState({newColorSchemeDialogVisibility: visibility})}
                    defaultDesign={Designs.system}
                    selectedColorScheme={this.state.selectedColorScheme}
                    onNewColorScheme={this.handleNewColorScheme}/>

                <div className='row'>
                    <ColorSchemeDropdownMenu
                        selectedColorScheme={this.state.selectedColorScheme}
                        colorSchemes={this.state.allColorSchemes}
                        onColorSchemeSelected={this.handleColorSchemeSelected}
                        className='col-5'/>
                    <div className='col-2'></div>
                    <ColorSchemeActions selectedColorScheme={this.state.selectedColorScheme}
                                        onActivate={this.handleActivate}
                                        onDelete={this.handleDelete}
                                        onEdit={this.handleEdit}
                                        className='col-5'/>
                </div>
            </div>
        );
    }

    private handleColorSchemeSelected = (colorSchemeId: string) => {
        let colorScheme = this.props.service.getColorScheme(colorSchemeId);
        if (colorScheme != null && colorScheme != this.state.selectedColorScheme) {
            this.setState({
                selectedColorScheme: colorScheme,
            });
        }
    }

    private handleNewColorScheme = (colorScheme: ColorSchemeFragmentType) => {
        this.props.service.newColorScheme(colorScheme);
        this.setState({
            newColorSchemeDialogVisibility: false,
            allColorSchemes: this.props.service.allList,
        });
    }

    private handleActivate = (): void => {
        this.props.service.activate(this.state.selectedColorScheme);
        this.setState({
            activeColorScheme: this.props.service.getCurrent(),
        })
    }

    private handleDelete = (): void => {
        let newSelectedColorScheme = this.props.service.getCurrent();
        this.props.service.delete(this.state.selectedColorScheme);
        this.setState({
            selectedColorScheme: newSelectedColorScheme,
        });
    }

    private handleEdit = (): void => {
        //todo implement edit dialog
    }
}

interface NewColorSchemeDialogProps extends DefaultProps {
    onNewColorScheme: (colorScheme: ColorSchemeFragmentType) => any,
    onDialogVisibilityChange: (visibility: boolean) => any,
    hidden: boolean,
    selectedColorScheme: ColorScheme, // used to get e.g. the colors for the new colorscheme
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
    private modal;
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

        this.modal = createRef<HTMLDivElement>();

        this.handleDialogHide = this.handleDialogHide.bind(this);
        this.handleDialogShow = this.handleDialogShow.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.createNewColorScheme = this.createNewColorScheme.bind(this);
    }

    public render(): JSX.Element {
        console.log(this.constructor.name, "Designs", Object.keys(Designs), Object.entries(Designs))

        return (
            <div className={concatClass('modal fade', this.props.className)}
                 id='new-color-scheme-dialog'
                 ref={this.modal}
                 hidden={this.props.hidden}
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
                                            value={this.props.selectedColorScheme.id}
                                            disabled>
                                        <option key={this.props.selectedColorScheme.id}
                                                value={this.props.selectedColorScheme.id}>
                                            {this.props.selectedColorScheme.name}
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
                                           placeholder={this.props.selectedColorScheme.author}/>
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
                                            <option value={v} key={v}>{v}</option>
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

    public override componentDidMount(): void {
        this.modal.current!.addEventListener("hide.bs.modal", this.handleDialogHide);
        this.modal.current!.addEventListener("show.bs.modal", this.handleDialogShow);
    }

    public override componentWillUnmount(): void {
        this.modal.current!.removeEventListener("hide.bs.modal", this.handleDialogHide);
        this.modal.current!.removeEventListener("show.bs.modal", this.handleDialogShow);
    }

    private handleDialogHide() {
        this.props.onDialogVisibilityChange(false);
    }

    private handleDialogShow() {
        this.props.onDialogVisibilityChange(true);
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
            colors: this.props.selectedColorScheme.colors,
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
