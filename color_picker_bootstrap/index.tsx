// import "../../build/js/jquery.js";
import "../node_modules/jquery/dist/jquery.js";
import '../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js';
import {ColorPickerService, ColorScheme, Designs} from "./colorpickerBackend.js";
import jsx, {
    ClassComponent,
    DefaultPropsType,
    EventType,
    NormalEventType,
    PropsType,
    RemoveProperty
} from "./jsxFactory.js"

//@ts-ignore
let Modal = bootstrap.Modal;


class ColorSchemeDropdownMenu extends ClassComponent {
    private dropDownMenu?: HTMLUListElement;

    declare props: PropsType<ClassComponent> & EventType<ColorSchemeDropdownMenu> & { service: ColorPickerService, colorSchemeId: string };
    declare events: NormalEventType<ClassComponent> & { "colorSchemeSelected": (s: string) => any }// = {"colorSchemeSelected": (s: string): any => null};
    static override eventList: string[] = ["colorSchemeSelected"];
    static override defaultProps: DefaultPropsType<ColorSchemeDropdownMenu> = {}


    public render(): JSX.Element {
        this.dropDownMenu = <ul class="dropdown-menu" id="color-schemes-dropdown-menu"
                                onclick={(event: MouseEvent) => this.colorSchemeSelected((event.target as Element).getAttribute("color-scheme-id")!)}>
            <li><a class="btn dropdown-item" href="#" onclick={this.invokeNewColorScheme.bind(this)}>Add</a></li>
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
            {
                // custom color schemes
                [...this.props.service.all.values()]
                    .filter(v => !v.preDefined)
                    .map(ColorSchemeDropdownItem)}
        </ul> as HTMLUListElement;

        this.props.service.on("delete", this.removeColorScheme);
        this.props.service.on("add", this.addColorScheme);

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
        this.dropDownMenu!.append(ColorSchemeDropdownItem(colorScheme));
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
        $(this.dropDownMenu!).remove(`[color-scheme-id=${colorScheme.id}]`)
    }

    /**
     * Fired when the user selects an colorScheme element in the dropdown menu
     * @private
     */
    private colorSchemeSelected(colorSchemeId: string) {
        console.log(this.constructor.name, "colro selected", colorSchemeId)
        if (this.props.colorSchemeId == colorSchemeId) {
            return
        }
        let prev = this.props.colorSchemeId;
        this.props.colorSchemeId = colorSchemeId;
        this.props.onColorSchemeSelected(colorSchemeId);
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
        return this._render(<div class='container p-5'>
            <NavBar onClose={() => console.log("colorpicker closed")}></NavBar>
            <NewColorSchemeDialog defaultDesign={Designs.system} parentColorScheme={this.props.service.getDefault()}
                                  service={this.props.service}/>
            <div class='row'>
                <ColorSchemeDropdownMenu service={this.props.service} colorSchemeId={this.props.service.getCurrent().id}
                                         onColorSchemeSelected={(colorSchemeActions.jsObject! as ColorSchemeActions).setColorSchemeId.bind(colorSchemeActions.jsObject)}
                                         class='col-5'/>
                <div class='col-2'></div>
                {colorSchemeActions}
            </div>
        </div>);
    }

}

class NewColorSchemeDialog extends ClassComponent {
    modal?: Modal;
    inputs?: {
        name: HTMLInputElement,
        description: HTMLInputElement,
        author: HTMLInputElement,
        design: HTMLSelectElement,
    };

    declare props: PropsType<ClassComponent> & EventType<NewColorSchemeDialog> & { service: ColorPickerService, parentColorScheme: ColorScheme, defaultDesign: Designs };
    declare events: NormalEventType<ClassComponent> & { colorSchemeCreated?: (colorScheme: ColorScheme) => any };

    static override eventList = ["colorSchemeCreated"];

    public render(): JSX.Element {
        if (this.rendered) {
            this.modal!.dispose();
        }

        console.log(this.constructor.name, "Designs", Object.keys(Designs), Object.entries(Designs))

        this.inputs = {
            name: <input id="new-cs-name-input" class='form-control' type='text'
                         placeholder={this.props.parentColorScheme.name}/> as HTMLInputElement,
            description:
                <input id="new-cs-description-input" type='text' className='form-control'
                       placeholder={this.props.parentColorScheme.description}/> as HTMLInputElement,
            author:
                <input id="new-cs-author-input" type='text' class='form-control'
                       placeholder={this.props.parentColorScheme.author}/> as HTMLInputElement,
            design: <select id="new-cs-design-select" className='form-select' disabled>
                {Object.entries(Designs).map(([k, v]) =>
                    <option selected={this.props.defaultDesign == v ? true : RemoveProperty}
                            value={k}>{v}</option>)}
            </select> as HTMLSelectElement,
        }

        let htmlModal =
            <div class='modal fade' id='new-color-scheme-dialog'>
                <div class='modal-dialog modal-dialog-centered'>
                    <div class='modal-content'>
                        <div class='modal-header'>
                            <h5 class='modal-title'>New Color Scheme</h5>
                            <button class='btn-close' type='button' data-bs-dismiss='modal' aria-label='Close'></button>
                        </div>
                        <div className='modal-body'>
                            {this.inputs.name}
                            <label for='new-cs-name-input' class='form-label'>Name</label>

                            {this.inputs.description}
                            <label for='new-cs-description-input' class='form-label'>Description</label>

                            {this.inputs.author}
                            <label for='new-cs-author-input' class='form-label'>Author</label>

                            {this.inputs.design}
                            <label for='new-cs-design-select' class='form-label'>Author</label>
                        </div>
                        <div className='modal-footer'>
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" onclick={this.createNewColorScheme.bind(this)}
                                    className="btn btn-primary"
                                    data-bs-dismiss='modal'>Add
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
    }

    public setParentColorScheme(colorScheme: ColorScheme) {
        if (this.props.parentColorScheme == colorScheme) {
            return
        }
        this.props.parentColorScheme = colorScheme;
    }
}

document.body.append(<ColorPicker service={new ColorPickerService()}></ColorPicker>);
