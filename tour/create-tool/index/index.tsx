import React from "react";
import {createRoot} from "react-dom/client";
import CreateTool from "../CreateTool";

const root = createRoot(document.getElementById("react-root")!);

root.render(<CreateTool/>);