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

    constructor() {
        super();
    }

    public render(): JSX.Element {
        this.dropDownMenu = <ul className="dropdown-menu" id="color-schemes-dropdown-menu">
            <li><a className="btn dropdown-item" href="#">Add</a></li>
            <li>
                <hr className="dropdown-divider"/>
            </li>
            <li><h6 className="dropdown-header">Predefined</h6></li>
            {   //predefined color schemes
                [...colorPickerService.all.values()]
                    .filter(v => v.preDefined)
                    .map(ColorSchemeDropdownItem)}
            {/*<li><a className="dropdown-item" href="#">Default</a></li>*/}
            <li><h6 className='dropdown-header'>Custom</h6></li>
            {
                // custom color schemes
                [...colorPickerService.all.values()]
                    .filter(v => !v.preDefined)
                    .map(ColorSchemeDropdownItem)}
        </ul> as HTMLUListElement;

        // event listener
        this.dropDownMenu.addEventListener("click", () => console.log("click up"))

        return <div>
            <button type="button" className="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown">
                Color Scheme
            </button>
            {this.dropDownMenu}
        </div>
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

    public render(): JSX.Element {
        this.button = <button type="button" class="btn btn-success">Activate</button> as HTMLButtonElement;
        this.dropDownButton = <button type="button" class="btn btn-success dropdown-toggle dropdown-toggle-split"
                                      data-bs-toggle="dropdown"></button> as HTMLButtonElement
        this.dropDownMenu = <ul className="dropdown-menu">
            <li><a class="dropdown-item bg-success" href="#">Activate</a></li>
            <li><a class="dropdown-item bg-danger" href="#">Delete</a></li>
        </ul> as HTMLUListElement
        return (<div class="btn-group">
            {this.button}
            {this.dropDownButton}
            {this.dropDownMenu}
        </div>);
    }
}


const NavBar = (props: { onClose: () => any }) =>
    <nav className="navbar navbar-expand bg-dark navbar-dark">
        <div className="container-fluid">
            <a className="navbar-brand">Color Picker</a>
            <ul className="navbar-nav">
            </ul>
            <button className="btn-close btn" type="button" onclick={props.onClose}></button>
        </div>
    </nav>


class ColorPicker extends ClassComponent {
    public render(): JSX.Element {
        return <div class='container-fluid p-5'>
            <NavBar onClose={() => console.log("colorpicker closed")}></NavBar>
            <div class='row'>
                <ColorSchemeDropdownMenu/>
                <ColorSchemeActions/>
            </div>
        </div>
    }

}

document.append(<ColorPicker a={2}>Hello</ColorPicker>);
