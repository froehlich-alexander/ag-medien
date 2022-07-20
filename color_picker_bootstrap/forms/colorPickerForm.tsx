import * as React from "react";
import {Form} from "../utils";
import {ColorMap, ColorPickerService, Colors, ColorScheme} from "../colorpickerBackend";
import {ColorInput} from "./inputs";
import {ChangeEventHandler, FormEventHandler} from "react";

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
        console.log("render color picker form", this.props.selectedColorScheme.colors)
        return (
            <Form onSubmit={this.handleSubmit}
                  className='row gx-3'>
                {this.props.colorTypes.map(colorType => [colorType, ColorPickerService.getDisplayColorName(colorType)])
                    .map(([colorType, displayName]) =>
                        <div className='col-6'
                             key={colorType}>
                            <ColorInput labelString={displayName}
                                        id={colorType}
                                        data-color-id={colorType}
                                        value={this.props.selectedColorScheme.colors.get(colorType)}
                                        onChange={this.handleColorInputChange}
                            />
                        </div>)}
            </Form>
        );
    }

    private handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
        console.log("color picker form submitted");
    }

    private handleColorInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
        const colorId = event.target.dataset.colorId!;
        const newValue = event.target.value;
        this.props.onColorSchemeChange({colors: this.props.selectedColorScheme.colors.withColor(colorId, newValue)});
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
    }
}