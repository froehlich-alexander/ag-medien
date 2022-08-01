import classNames from "classnames";
import * as React from "react";
import {MouseEventHandler} from "react";
import {ColorScheme} from "./color-base/colorpickerBackend";
import {DefaultProps} from "./utils/types";

interface ColorSchemeActionProps extends DefaultProps {
    selectedColorScheme: ColorScheme, // we need it to disable the right buttons, change their tooltips, etc.

    // onStateSelected?: (state: ColorSchemeActionsState["selection"]) => any,
    onDelete: () => any,
    onActivate: () => any,
}

interface ColorSchemeActionsState {
    selection: typeof ColorSchemeActions.State[keyof typeof ColorSchemeActions.State],
}

/**
 * @deprecated
 */
class ColorSchemeActions extends React.Component<ColorSchemeActionProps, ColorSchemeActionsState> {
    constructor(props: ColorSchemeActionProps) {
        super(props);
        this.state = {
            selection: ColorSchemeActions.State["activate"],
        };

        // this.handleStateSelect = this.handleStateSelect.bind(this);
        // this.handleButtonClickOld = this.handleButtonClickOld.bind(this);
    }

    static readonly State: { [k in ["activate", "delete"][number]]: { id: k, name: string, buttonStyle: string, callback: (NonNullable<Exclude<{ [k in keyof ColorSchemeActionProps]: NonNullable<ColorSchemeActionProps[k]> extends () => any ? k : never }[keyof ColorSchemeActionProps], never>>) } } = {
        activate: {id: "activate", name: "Activate", buttonStyle: "success", callback: "onActivate"},
        delete: {id: "delete", name: "Delete", buttonStyle: "danger", callback: "onDelete"},
        // edit: {id: "edit", name: "Edit", buttonStyle: "primary"},
    };

    public render(): JSX.Element {
        console.log("render actions", this.props);
        return (
            <div className={classNames("btn-group", this.props.className)}
                 role="group"
                 aria-label="Color Scheme Actions">
                {Object.values(ColorSchemeActions.State).map(state =>
                    <button className={`btn btn-${state.buttonStyle}`}
                            type="button"
                            data-state-id={state.id}
                            key={state.id}
                            disabled={this.buttonShouldBeDisabled(state.id)}
                            onClick={this.handleButtonClick}>
                        {state.name}
                    </button>)}


                {/*------------------------*/}
                {/*<button type="button"*/}
                {/*        disabled={this.buttonShouldBeDisabled(this.state.selection.id)}*/}
                {/*        className={`btn btn-${this.state.selection.buttonStyle}`}*/}
                {/*        onClick={this.handleButtonClickOld.bind(this)}>*/}
                {/*    {this.state.selection.name}*/}
                {/*</button>*/}
                {/*<button type="button"*/}
                {/*        className={`btn btn-${this.state.selection.buttonStyle} dropdown-toggle dropdown-toggle-split`}*/}
                {/*        data-bs-toggle="dropdown"/>*/}

                {/*<ul className="dropdown-menu"*/}
                {/*    onClick={this.handleStateSelect}>*/}
                {/*    {Object.values(ColorSchemeActions.State).map(state =>*/}
                {/*        <li key={state.id}>*/}
                {/*            <button className={`dropdown-item bg-${state.buttonStyle}`}*/}
                {/*                    data-state-id={state.id}*/}
                {/*                    disabled={this.buttonShouldBeDisabled(state.id)}>*/}
                {/*                {state.name}*/}
                {/*            </button>*/}
                {/*        </li>)}*/}
                {/*</ul>*/}
            </div>
        );
    }

    /**
     * Return whether the button of the state given should be disabled or not<br>
     * The result depends on the selected color scheme
     * @param {keyof typeof ColorSchemeActions.State} type
     * @returns {boolean}
     * @private
     */
    private buttonShouldBeDisabled(type: keyof typeof ColorSchemeActions.State): boolean {
        let colorScheme = this.props.selectedColorScheme;
        switch (type) {
            case "activate":
                return colorScheme.current;
            case "delete":
                return colorScheme.preDefined || colorScheme.current;
        }
    }

    // private handleStateSelect: MouseEventHandler = (event)=> {
    //     let stateId = (event.target as Element).getAttribute("data-state-id");
    //     if (stateId) {
    //         let state = ColorSchemeActions.State[stateId as keyof typeof ColorSchemeActions.State];
    //
    //         if (state != null) {
    //             this.setState({
    //                 selection: state,
    //             });
    //             this.props.onStateSelected?.(state);
    //         } else {
    //             console.warn(ColorSchemeActions.name, "state == null", state, stateId);
    //         }
    //         console.log("state changed", state);
    //     }
    // }
    //
    // private handleButtonClickOld() {
    //     switch (this.state.selection.id) {
    //         case "activate":
    //             this.props.onActivate();
    //             break;
    //         case "delete":
    //             this.props.onDelete();
    //             break;
    //     }
    // }

    private handleButtonClick: MouseEventHandler<HTMLButtonElement> = (event) => {
        const state = ColorSchemeActions.State[(event.target as HTMLButtonElement).dataset.stateId! as keyof typeof ColorSchemeActions.State];
        this.props[state.callback]();
    };
}

export default ColorSchemeActions;