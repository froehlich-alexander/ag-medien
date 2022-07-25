import * as React from "react";
import {MouseEvent} from "react";
import NavbarActions from "./NavbarActions";
import {concatClass, DefaultProps, FunctionComponent} from "./utils";

interface NavBarProps extends DefaultProps {
    onClose: (event: MouseEvent<HTMLButtonElement>) => any,
    onImportClick?: ()=>any,
    onExportClick?: ()=>any,
}

const NavBar: FunctionComponent<NavBarProps> = (props) =>
    <nav className={concatClass("navbar navbar-expand bg-dark navbar-dark", props.className)}>
        <div className="container-fluid">
            <a className="navbar-brand">Color Picker</a>
            <ul className="navbar-nav">
                <NavbarActions onImportClick={props.onImportClick}
                onExportClick={props.onExportClick}/>
            </ul>
            <button className="btn-close btn" type="button" onClick={props.onClose}></button>
        </div>
    </nav>;

export default NavBar;