// import "../../build/js/jquery.js";
import "../node_modules/jquery/dist/jquery.js"
import {ColorPickerService, ColorScheme} from "./colorpickerBackend.js";
import jsx, {ClassComponent} from "./jsxFactory.js"


const colorPickerService = new ColorPickerService();
const colorPicker = $("#color-picker")

// let colorSchemesDropDownMenu = {
//     headerAdded: false,
//     html: colorPicker.find("#color-schemes-dropdown-menu").eq(0)
// };


class ColorSchemeDropdownMenu extends ClassComponent {
    private dropDownMenu?: HTMLUListElement;

    public render(): JSX.Element {
        this.dropDownMenu = <ul class="dropdown-menu" id="color-schemes-dropdown-menu">
            <li><a class="btn dropdown-item" href="#">Add</a></li>
            <li>
                <hr class="dropdown-divider"/>
            </li>
            <li><h6 class="dropdown-header">Predefined</h6></li>
            {   //predefined color schemes
                [...colorPickerService.all.values()]
                    .filter(v => v.preDefined)
                    .map(ColorSchemeDropdownItem)}
            {/*<li><a class="dropdown-item" href="#">Default</a></li>*/}
            <li><h6 class='dropdown-header'>Custom</h6></li>
            {
                // custom color schemes
                [...colorPickerService.all.values()]
                    .filter(v => !v.preDefined)
                    .map(ColorSchemeDropdownItem)}
        </ul> as HTMLUListElement;

        // event listener
        this.dropDownMenu.addEventListener("click", () => console.log("click up"))

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
     * remove a custom color Scheme from the dropdown menu
     * @param {ColorScheme} colorScheme
     */
    public removeColorScheme(colorScheme: ColorScheme) {
        $(this.dropDownMenu!).remove(`color-scheme-id=${colorScheme.id}]`)
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
    private state: string = "Activate";

    static states = {
        "Activate": "success",
        "Delete": "danger"
    }

    public render(): JSX.Element {
        this.button = <button type="button" class="btn btn-success">Activate</button> as HTMLButtonElement;
        this.dropDownButton = <button type="button" class="btn btn-success dropdown-toggle dropdown-toggle-split"
                                      data-bs-toggle="dropdown"></button> as HTMLButtonElement
        this.dropDownMenu =
            <ul class="dropdown-menu" onclick={(event: MouseEvent) => this.stateChanged((event.target as Element).innerHTML)}>
                <li><a class="dropdown-item bg-success" href="#">Activate</a></li>
                <li><a class="dropdown-item bg-danger" href="#">Delete</a></li>
            </ul> as HTMLUListElement
        return this._render(<div class="btn-group">
            {this.button}
            {this.dropDownButton}
            {this.dropDownMenu}
        </div>);
    }

    private stateChanged(state: string) {
        console.log("state changed", state);
        let prev = this.state;
        this.state = state;
        this.button?.classList.remove("btn-" + ColorSchemeActions.states[prev as keyof ColorSchemeActions.states]);
        this.button?.classList.add("btn-"+ColorSchemeActions.states[state])
        this.button!.innerHTML = state
        this.dropDownButton?.classList.remove("btn-" + ColorSchemeActions.states[prev as keyof ColorSchemeActions.states]);
        this.dropDownButton?.classList.add("btn-"+ColorSchemeActions.states[state])
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
    public render(): JSX.Element {
        return this._render(<div class='container p-5'>
            <NavBar onClose={() => console.log("colorpicker closed")}></NavBar>
            <div class='row'>
                <ColorSchemeDropdownMenu class='col-5'/>
                <div class='col-2'></div>
                <ColorSchemeActions class='col-5'/>
            </div>
        </div>);
    }

}

document.body.append(<ColorPicker></ColorPicker>);
