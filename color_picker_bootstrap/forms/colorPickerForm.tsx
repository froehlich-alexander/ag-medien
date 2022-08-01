import * as React from "react";
import {ChangeEventHandler, FormEventHandler} from "react";
import {Colors, ColorScheme} from "../color-base/colorpickerBackend";
import ColorPickerService from "../color-base/ColorPickerService";
import {Form} from "../utils/Form";
import {ColorInput} from "./inputs";

interface ColorPickerFormProps {
    selectedColorScheme: ColorScheme,
    colorTypes: readonly string[],
    onColorSchemeChange: (colors: { colors: Colors }) => any,
}

interface ColorPickerFormState {
    // history: {
    //     colorSchemeId: string,
    //     colors: ColorMap,
    //     timestamp: number,
    // }[],

}

export class ColorPickerForm extends React.Component<ColorPickerFormProps, ColorPickerFormState> {

    constructor(props: ColorPickerFormProps) {
        super(props);
        // this.state = {
        //     history: [{
        //         colorSchemeId: this.props.selectedColorScheme.id,
        //         colors: this.props.selectedColorScheme.colors,
        //         timestamp: Date.now(),
        //     }],
        // }
    }


    public render(): React.ReactNode {
        console.log("render color picker form", this.props.selectedColorScheme.colors);
        const disabled = this.props.selectedColorScheme.preDefined;
        return (
            <Form onSubmit={this.handleSubmit}
                  className="row gx-3">
                {this.props.colorTypes.map(colorType => [colorType, ColorPickerService.getDisplayColorName(colorType)])
                    .map(([colorType, displayName]) =>
                        <div className="col-6"
                             key={colorType}>
                            <ColorInput labelString={displayName}
                                        id={colorType}
                                        data-color-id={colorType}
                                        value={this.props.selectedColorScheme.colors.get(colorType)}
                                        onChange={this.handleColorInputChange}
                                        disabled={disabled}
                            />
                        </div>)}
            </Form>
        );
    }

    private handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
        console.log("color picker form submitted");
    };

    private handleColorInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
        const colorId = event.target.dataset.colorId!;
        const newValue = event.target.value;
        let newCS = this.props.selectedColorScheme.colors.withColor(colorId, newValue);
        // console.log("color inpt change", colorId, newValue, newCS.colors);
        this.props.onColorSchemeChange({colors: newCS});
        // if (this.props.selectedColorScheme.colors.get(colorId) != newValue) {
        //     this.props.selectedColorScheme.setColor(colorId, newValue);
        //     let history = this.state.history.concat({
        //         colorScheme: this.props.selectedColorScheme.copy(),
        //         timestamp: Date.now(),
        //     });
        //     this.setState({
        //         history: history,
        //     })
        //     this.props.onColorSchemeChange(this.props.selectedColorScheme);
        // }
    };
}