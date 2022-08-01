import React from "react";
import {createRoot} from "react-dom/client";
import CreateTool from "../CreateTool";
import "bootstrap";

const root = createRoot(document.getElementById("react-root")!);

root.render(<CreateTool/>);