import {ColorPickerService, ColorScheme, Designs} from "./colorpickerBackend.js";
import jsx, {
    ClassComponent,
    DefaultPropsType,
    EventType,
    NormalEventType,
    PropsType,
    RemoveProperty
} from "./jsxFactory.js"

//import bootstrap types
declare var bootstrap: any;
const Modal: typeof import('bootstrap').Modal = bootstrap.Modal;
type Modal = import("bootstrap").Modal;

//import react
// declare var React: any;
// declare var ReactDOM: any;
// const Component: import("react").Component = React.Component;


class ColorSchemeDropdownMenu extends ClassComponent {
    private colorSchemesCount = 0;

    private dropDownMenu?: HTMLUListElement;
    private noCustomColorSchemesPlaceholder?: HTMLAnchorElement;

    declare props: PropsType<ClassComponent> & EventType<ColorSchemeDropdownMenu> & { service: ColorPickerService, colorSchemeId: string };
    declare events: NormalEventType<ClassComponent> & {
        "colorSchemeSelected"?: (s: string) => any,
    }
    static override eventList: string[] = [
        "colorSchemeSelected",
    ];

    // static override defaultProps: DefaultPropsType<ColorSchemeDropdownMenu> = {}

    constructor(props: ColorSchemeDropdownMenu["props"]) {
        super(props);
        props.service.on("add", this.addColorScheme.bind(this));
        props.service.on("delete", this.removeColorScheme.bind(this));
    }


    public render(): JSX.Element {
        this.colorSchemesCount = [...this.props.service.all.values()].filter(v => !v.preDefined).length;

        this.noCustomColorSchemesPlaceholder =
            <a class='dropdown-item disabled' href='#'>Nothing here yet</a> as HTMLAnchorElement;
        this.dropDownMenu = <ul class="dropdown-menu" id="color-schemes-dropdown-menu"
                                onclick={this.colorSchemeSelected.bind(this)}>
            <li>
                <button type='button' data-bs-toggle='modal' data-bs-target='#new-color-scheme-dialog'
                        class="btn dropdown-item" onclick={this.invokeNewColorScheme.bind(this)}>Add
                </button>
            </li>
            <li>
                <hr class="dropdown-divider"/>
            </li>
            <li><h6 class="dropdown-header">Predefined</h6></li>
            {   //predefined color schemes
                [...this.props.service.all.values()]
                    .filter(v => v.preDefined)
                    .map(ColorSchemeDropdownItem)}
            {/*<li><a class="dropdown-item" href="#">Default</a></li>*/}
            <li><h6 class='dropdown-header'>Custom</h6></li>
            <li>{this.noCustomColorSchemesPlaceholder}</li>
            {
                // custom color schemes
                [...this.props.service.all.values()]
                    .filter(v => !v.preDefined)
                    .map(ColorSchemeDropdownItem)}
        </ul> as HTMLUListElement;
        this.setVisibilityOfNoCustomColorSchemesPlaceHolder();

        return this._render(<div class='btn-group'>
            <button type="button" class="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown">
                Color Scheme
            </button>
            {this.dropDownMenu}
        </div>);

    }

    /**
     * Add a <b>custom</b> color Scheme to the dropdown menu
     * @param {ColorScheme} colorScheme
     */
    public addColorScheme(colorScheme: ColorScheme) {
        this.colorSchemesCount++;
        this.dropDownMenu!.append(ColorSchemeDropdownItem(colorScheme));
        this.setVisibilityOfNoCustomColorSchemesPlaceHolder();
    }

    /**
     * Invokes a creation of a new colorScheme<br>
     * This is used as a callback function for the <add> button
     * @private
     */
    private invokeNewColorScheme(): void {
    }

    /**
     * remove a custom color Scheme from the dropdown menu
     * @param {ColorScheme} colorScheme
     */
    public removeColorScheme(colorScheme: ColorScheme) {
        console.log("remove color scheme from dropdown", colorScheme)
        this.colorSchemesCount--;
        $(this.dropDownMenu!).find(`[color-scheme-id=${colorScheme.id}]`).remove();
        this.setVisibilityOfNoCustomColorSchemesPlaceHolder();
    }

    /**
     * Fired when the user selects an colorScheme element in the dropdown menu
     * @private
     */
    private colorSchemeSelected(event: MouseEvent) {
        let colorSchemeId = (event.target as Element).getAttribute("color-scheme-id");
        if (colorSchemeId == null) {
            // no color scheme dropDownElement has been clicked
            // maybe another action button like the "add" button
            return;
        }
        console.log(this.constructor.name, "colro selected", colorSchemeId);
        if (this.props.colorSchemeId == colorSchemeId) {
            return
        }
        let prev = this.props.colorSchemeId;
        this.props.colorSchemeId = colorSchemeId;
        this.props.onColorSchemeSelected!(colorSchemeId);
    }

    private setVisibilityOfNoCustomColorSchemesPlaceHolder() {
        console.log("set vis", this.colorSchemesCount)
        this.noCustomColorSchemesPlaceholder!.toggleAttribute("hidden", this.colorSchemesCount > 0);
    }
}

// function initColorSchemeDropdown() {
//     // add pre defined color schemes
//     for (let i of colorPickerService.all.values()) {
//         if (i.preDefined) {
//             colorSchemesDropDownMenu.html.append(<li><a class='dropdown-item' href='#'
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
//         colorSchemesDropDownMenu.html.append(<div class='dropdown-header'>Custom</div>);
//         colorSchemesDropDownMenu.headerAdded = true;
//     }
//     for (let i of schemes) {
//         colorSchemesDropDownMenu.html.append(<li><a href='#' class='dropdown-item'
//                                                     color-scheme-id={i.id}>{i.name}</a>
//         </li>)
//     }
// }

const ColorSchemeDropdownItem = (colorScheme: { id: string, name: string }) =>
    <li><a class='dropdown-item' href='#' color-scheme-id={colorScheme.id}>{colorScheme.name}</a></li>

class ColorSchemeActions extends ClassComponent {
    private button?: HTMLButtonElement;
    private dropDownButton?: HTMLButtonElement;
    private dropDownMenu?: HTMLUListElement;

    static override readonly defaultProps: DefaultPropsType<ColorSchemeActions> = {state: "Activate"}
    declare props: PropsType<ClassComponent> & { service: ColorPickerService, state?: string, colorSchemeId: string };

    static states: { [k: string]: string } = {
        "Activate": "success",
        "Delete": "danger",
        "Edit": "primary",
    }

    public render(): JSX.Element {
        console.log("render actions", this.props)
        this.button = <button type="button" class={`btn btn-${ColorSchemeActions.states[this.props.state!]}`}
                              onclick={this.buttonClicked.bind(this)}>{this.props.state!}</button> as HTMLButtonElement;
        this.dropDownButton = <button type="button"
                                      class={`btn btn-${ColorSchemeActions.states[this.props.state!]} dropdown-toggle dropdown-toggle-split`}
                                      data-bs-toggle="dropdown"></button> as HTMLButtonElement
        this.dropDownMenu =
            <ul class="dropdown-menu"
                onclick={(event: MouseEvent) => this.stateChanged((event.target as Element).innerHTML)}>
                {/*<li><a class="dropdown-item bg-success" href="#">Activate</a></li>*/}
                {/*<li><a class="dropdown-item bg-danger" href="#">Delete</a></li>*/}
                {Object.entries(ColorSchemeActions.states).map(([k, v]) =>
                    <li><a class={`dropdown-item bg-${v}`} href='#'>{k}</a></li>)}
            </ul> as HTMLUListElement
        return this._render(<div class="btn-group">
            {this.button}
            {this.dropDownButton}
            {this.dropDownMenu}
        </div>);
    }

    private stateChanged(state: string) {
        console.log("state changed", state);
        let prev = this.props.state!;
        this.props.state! = state;
        this.button?.classList.remove("btn-" + ColorSchemeActions.states[prev]);
        this.button?.classList.add("btn-" + ColorSchemeActions.states[state])
        this.button!.innerHTML = state
        this.dropDownButton?.classList.remove("btn-" + ColorSchemeActions.states[prev]);
        this.dropDownButton?.classList.add("btn-" + ColorSchemeActions.states[state])
    }

    private buttonClicked() {
        let colorScheme = this.props.service.getColorScheme(this.props.colorSchemeId)
        if (colorScheme == null) {
            console.warn("button on non existent color scheme clicked");
            return
        }
        switch (this.props.state!) {
            case "Activate":
                this.props.service.activate(colorScheme);
                break;
            case "Delete":
                this.props.service.delete(colorScheme);
                break;
            case "Edit":
                break;
        }
    }

    public setColorSchemeId(id: string) {
        console.log((this.constructor as typeof ClassComponent).name, "setCOlorSchemeID", id)
        this.props.colorSchemeId = id;
    }
}

const NavBar = (props: { onClose: () => any }) =>
    <nav class="navbar navbar-expand bg-dark navbar-dark">
        <div class="container-fluid">
            <a class="navbar-brand">Color Picker</a>
            <ul class="navbar-nav">
            </ul>
            <button class="btn-close btn" type="button" onclick={props.onClose}></button>
        </div>
    </nav>


class ColorPicker extends ClassComponent {
    declare props: PropsType<ClassComponent> & { service: ColorPickerService };

    public render(): JSX.Element {
        let colorSchemeActions = <ColorSchemeActions service={this.props.service}
                                                     colorSchemeId={this.props.service.getCurrent().id}
                                                     class='col-5'/>
        let newColorSchemeDialog = <NewColorSchemeDialog defaultDesign={Designs.system}
                                                         parentColorScheme={this.props.service.getDefault()}
                                                         service={this.props.service}/>;
        let colorSchemeDropdownMenu = <ColorSchemeDropdownMenu service={this.props.service}
                                                               colorSchemeId={this.props.service.getCurrent().id}
                                                               class='col-5'/>;

        // update NewColorSchemeDialog and ColorSchemeActions when a new CS is selected
        (colorSchemeDropdownMenu.jsObject! as ColorSchemeDropdownMenu).on("colorSchemeSelected",
            (newColorSchemeDialog.jsObject! as NewColorSchemeDialog).setParentColorScheme.bind(newColorSchemeDialog.jsObject!));
        (colorSchemeDropdownMenu.jsObject! as ColorSchemeDropdownMenu).on("colorSchemeSelected",
            (colorSchemeActions.jsObject! as ColorSchemeActions).setColorSchemeId.bind(colorSchemeActions.jsObject!))


        return this._render(<div class='container p-5'>
            <NavBar onClose={() => console.log("colorpicker closed")}></NavBar>
            {newColorSchemeDialog}

            <div class='row'>
                {colorSchemeDropdownMenu}
                <div class='col-2'></div>
                {colorSchemeActions}
            </div>
        </div>);
    }

}

class NewColorSchemeDialog extends ClassComponent {
    modal?: Modal;
    inputs?: {
        parentColorScheme: HTMLSelectElement,
        name: HTMLInputElement,
        description: HTMLInputElement,
        author: HTMLInputElement,
        design: HTMLSelectElement,
    };

    declare props: PropsType<ClassComponent> & EventType<NewColorSchemeDialog> & {
        service: ColorPickerService,
        parentColorScheme: ColorScheme,
        defaultDesign: Designs,
    };

    declare events: NormalEventType<ClassComponent> & {
        colorSchemeCreated?: (colorScheme: ColorScheme) => any,
    };

    static override eventList = [
        "colorSchemeCreated",
    ];

    public render(): JSX.Element {
        if (this.rendered) {
            this.modal!.dispose();
        }

        console.log(this.constructor.name, "Designs", Object.keys(Designs), Object.entries(Designs))

        this.inputs = {
            parentColorScheme: <select id='new-cs-parent-cs-input' class='form-select' disabled>
                <option selected value={this.props.parentColorScheme.id}>{this.props.parentColorScheme.name}</option>
            </select> as HTMLSelectElement,

            name: <input id="new-cs-name-input" aria-describedby='new-cs-name-invalid' class='form-control'
                         type='text' required placeholder="Your Color Scheme's name"/> as HTMLInputElement,
            description:
                <textarea id="new-cs-description-input" aria-describedby="new-cs-description-invalid"
                          class='form-control'
                          placeholder='A very interesting description...'/> as HTMLInputElement,
            author:
                <input id="new-cs-author-input" aria-describedby='new-cs-author-invalid' type='text'
                       class='form-control'
                       placeholder={this.props.parentColorScheme.author}/> as HTMLInputElement,
            design: <select id="new-cs-design-select" class='form-select'>
                {Object.entries(Designs).map(([k, v]) =>
                    <option selected={this.props.defaultDesign == v ? true : RemoveProperty}
                            value={k}>{v}</option>)}
            </select> as HTMLSelectElement,
        }

        let htmlModal =
            <div class='modal fade' id='new-color-scheme-dialog' tabindex={-1} aria-hidden={true}
                 aria-labelledby='Dialog to create a new Color Scheme'>
                <div class='modal-dialog modal-dialog-centered'>
                    <div class='modal-content'>
                        <div class='modal-header'>
                            <h5 class='modal-title'>New Color Scheme</h5>
                            <button class='btn-close' type='button' data-bs-dismiss='modal' aria-label='Close'></button>
                        </div>
                        <div class='modal-body'>
                            <form id='new-cs-form' action='javascript:void(0);' onsubmit={this.createNewColorScheme.bind(this)}>
                                <div class='mb-3'>
                                    <label for='new-cs-paren-cs-input' class='form-label'>Colors</label>
                                    {this.inputs.parentColorScheme}
                                    <div class='form-text'>You can later manually edit the colors</div>
                                </div>
                                <div class='mb-3'>
                                    <label for='new-cs-name-input' class='form-label'>Name</label>
                                    {this.inputs.name}
                                    <div id='new-cs-name-invalid' class='invalid-feedback'>You must provide a name</div>
                                </div>

                                <div class='mb-3'>
                                    <label for='new-cs-description-input' class='form-label'>Description</label>
                                    {this.inputs.description}
                                </div>

                                <div class='mb-3'>
                                    <label for='new-cs-author-input' class='form-label'>Author</label>
                                    {this.inputs.author}
                                    <div id='new-cs-author-invalid' class='invalid-feedback'>You must provide an
                                        author
                                    </div>
                                </div>

                                <div class='mb-3'>
                                    <label for='new-cs-design-select' class='form-label'>Design</label>
                                    {this.inputs.design}
                                </div>
                            </form>
                        </div>
                        <div class='modal-footer'>
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="submit" form='new-cs-form'
                                    class="btn btn-primary">Add
                            </button>
                        </div>
                    </div>
                </div>
            </div>;
        this.modal = Modal.getInstance(htmlModal)!;
        return this._render(htmlModal);
    }

    private createNewColorScheme(): void {
        console.log(this.constructor.name, "create new color sceheme ");
        let newColorScheme = this.props.service.newColorScheme({
            name: this.inputs!.name.value,
            description: this.inputs!.description.value,
            author: this.inputs!.author.value,
            design: Designs[this.inputs!.design.value as "dark" | "light" | "system"],
            colors: this.props.parentColorScheme.colors
        });
        this.props.onColorSchemeCreated!(newColorScheme);
        console.log(this.constructor.name, newColorScheme);
        this.modal!.hide();
    }

    public setParentColorScheme(colorSchemeId: string) {
        if (this.props.parentColorScheme.id == colorSchemeId) {
            return
        }
        let colorScheme = this.props.service.getColorScheme(colorSchemeId)!;
        this.props.parentColorScheme = colorScheme;
        this.inputs?.parentColorScheme!.add(<option selected
                                                    value={colorScheme.id}>{colorScheme.name}</option> as HTMLOptionElement);
    }
}

document.body.append(<ColorPicker service={new ColorPickerService()}></ColorPicker>);
