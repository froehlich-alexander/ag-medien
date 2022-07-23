// <reference path="react.d.ts" />
import * as React from "react";
import {createRoot} from "react-dom/client";
import ColorPicker from "./ColorPicker";

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

const root = createRoot(
    document.getElementById("color-picker-root")!);
root.render(<ColorPicker/>);
