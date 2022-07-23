import * as React from "react";
import {MouseEvent} from "react";
import {concatClass, DefaultProps} from "./utils";

const NavBar = (props: DefaultProps & { onClose: (event: MouseEvent<HTMLButtonElement>) => any }) =>
    <nav className={concatClass("navbar navbar-expand bg-dark navbar-dark", props.className)}>
        <div className="container-fluid">
            <a className="navbar-brand">Color Picker</a>
            <ul className="navbar-nav">
            </ul>
            <button className="btn-close btn" type="button" onClick={props.onClose}></button>
        </div>
    </nav>;

export default NavBar;
