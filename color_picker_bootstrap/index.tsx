// <reference path="react.d.ts" />
import {useEffect, useLayoutEffect, useRef, useState} from "react";
import * as React from "react";
import {Button, Toast, ToastContainer} from "react-bootstrap";
import {createRoot} from "react-dom/client";
import {Toast as BSToast} from "bootstrap";
import ColorPicker from "./ColorPicker";
import {Toast} from "./Toast";

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
    // let toast = useRef<HTMLDivElement>(null);
    // useEffect(() => {
    //     if (vis) {
    //         BSToast.getOrCreateInstance(toast.current!).show();
    //     } else {
    //         BSToast.getOrCreateInstance(toast.current!).hide();
    //     }
    // }, [vis]);
    //
    // useEffect(() => {
    //     toast.current!.addEventListener("hide.bs.toast", () => setVis(false));
    //     // toast.current!.addEventListener("show.bs.toast", () => setVis(true));
    // }, []);
    const [lastClick, setLastClick]  = useState(0);

    // setTimeout(()=>setLastClick(prevState => prevState), 1000);
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