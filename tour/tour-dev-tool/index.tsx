import "bootstrap";
import React from "react";
import {createRoot} from "react-dom/client";
import CreateTool from "./CreateTool";
import "./i18n";

const root = createRoot(document.getElementById("react-root")!);

root.render(<CreateTool/>);
