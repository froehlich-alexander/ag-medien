// <reference path="react.d.ts" />
import {useEffect, useLayoutEffect, useRef, useState} from "react";
import * as React from "react";
import {Button, Toast, ToastContainer} from "react-bootstrap";
import {createRoot} from "react-dom/client";
import {Toast as BSToast} from "bootstrap";
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

// root.render(<ColorPicker/>);
function Example({}) {
    let [vis, setVis] = useState(false);
    let toast = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (vis) {
            BSToast.getOrCreateInstance(toast.current!).show();
        } else {
            BSToast.getOrCreateInstance(toast.current!).hide();
        }
    }, [vis]);

    useEffect(() => {
        toast.current!.addEventListener("hide.bs.toast", () => setVis(false));
        // toast.current!.addEventListener("show.bs.toast", () => setVis(true));
    }, []);

    return (
        <div>
            <Button onClick={() => setVis(true)}>Hello</Button>
            <ToastContainer position="bottom-start">
                <div className="toast fade"
                     ref={toast}
                     data-bs-autohide={true}
                     data-bs-delay={2000}>
                    {/* show={vis}*/}
                    {/*    onClose={() => setVis(false)}*/}
                    {/*    autohide*/}
                    {/*   delay={2000}>*/}
                    <Toast.Header closeButton={true}>
                        <strong>Hello World</strong>
                    </Toast.Header>
                    <Toast.Body>
                        Toast...<br/>
                        content...
                    </Toast.Body>
                </div>
            </ToastContainer>
        </div>
    );
}

root.render(
    <ColorPicker/>,
);