// <reference path="react.d.ts" />
import * as React from "react";
import {useState} from "react";
import {Button, ToastContainer, Card} from "react-bootstrap";
import {createRoot} from "react-dom/client";
import ColorPicker from "../ColorPicker";
import {Toast} from "../utils/Toast";

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

// root.render(<ColorPicker/>);
function Example({}) {
    let [vis, setVis] = useState(false);
    const [lastClick, setLastClick]  = useState(0);

    return (
        <div>
            <Button onClick={() => {
                console.log("b click");
                setLastClick(Date.now());
                setVis(true);
            }}>Hello</Button>
            <ToastContainer position="bottom-start">
                <Toast
                    // data-bs-autohide={true}
                    //  data-bs-delay={2000}>
                    show={vis}
                    reopen={lastClick}
                    onVisibilityChange={setVis}
                    autohide
                    delay={Date.now()-lastClick+2000}>
                    <Toast.Header closeButton={true}>
                        <strong>Hello World</strong>
                    </Toast.Header>
                    <Toast.Body>
                        Toast...<br/>
                        content...
                    </Toast.Body>
                </Toast>
            </ToastContainer>
        </div>
    );
}

root.render(
    <ColorPicker/>,
);