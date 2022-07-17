import * as React from "react";
import {Form} from "../utils";
import {ColorScheme} from "../colorpickerBackend";
import {ColorInput} from "./inputs";
import {ChangeEventHandler} from "react";

interface ColorPickerFormProps {
    selectedColorScheme: ColorScheme,
    colorTypes: string[],
    onColorSchemeChange: (colorScheme: ColorScheme) => any
}

interface ColorPickerFormState {
    history: {
        colorScheme: ColorScheme,
        timestamp: number,
    }[],

}

class ColorPickerForm extends React.Component<ColorPickerFormProps, ColorPickerFormState> {

    constructor(props: ColorPickerFormProps) {
        super(props);
        this.state = {
            history: [{
                colorScheme: this.props.selectedColorScheme,
                timestamp: Date.now(),
            }],
        }
    }


    public render(): React.ReactNode {

        return (
            <div className='container'>
                <Form>
                    {this.props.colorTypes.map(colorType =>
                        <ColorInput labelString={colorType}
                                    id={colorType}
                                    key={colorType}
                                    data-color-id={colorType}
                                    value={this.props.selectedColorScheme.colors.get(colorType)}
                                    onChange={this.handleColorInputChange}
                        />)}
                </Form>
            </div>
        );
    }

    private handleColorInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
        const colorId = event.target.dataset.colorId!;
        const newValue = event.target.value;
        if (this.props.selectedColorScheme.colors.get(colorId) != newValue) {
            this.props.selectedColorScheme.setColor(colorId, newValue);
            let history = this.state.history.concat({
                colorScheme:this.props.selectedColorScheme.copy(),
                timestamp: Date.now(),
            });
            this.setState({
                history: history,
            })
            this.props.onColorSchemeChange(this.props.selectedColorScheme);
        }
    }
}