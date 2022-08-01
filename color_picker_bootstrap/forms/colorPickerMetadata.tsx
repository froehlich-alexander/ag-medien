import * as React from "react";
import {ChangeEventHandler, FormEventHandler, MouseEventHandler} from "react";
import {ColorScheme, ColorSchemeFragment, ColorSchemeInterface, Designs} from "../color-base/colorpickerBackend";
import {Form} from "../utils/Form";
import {AuthorInput, DescriptionInput, DesignInput, HTMLInputElements, NameInput} from "./inputs";

export type ColorSchemeMetadata = Omit<ColorSchemeInterface, "colors" | "id" | "current" | "preDefined">;

interface ColorPickerMetadataProps {
    selectedColorScheme: ColorScheme,
    onUpdate: (metadata: ColorSchemeMetadata) => any,
    changesUnsaved: (value: boolean) => any,
}

interface ColorPickerMetadataState {
    workingColorScheme: ColorSchemeFragment,
}

export class ColorPickerMetadata extends React.Component<ColorPickerMetadataProps, ColorPickerMetadataState> {
    inputId = "color-picker-metadata";

    constructor(props: ColorPickerMetadataProps) {
        super(props);

        this.state = {
            workingColorScheme: new ColorSchemeFragment(this.props.selectedColorScheme),
        };
    }


    public render(): React.ReactNode {
        const disabled = this.props.selectedColorScheme.preDefined;
        return (
            <Form id={this.inputId + "-form"}
                  action="javascript:void(0);"
                  onSubmit={this.handleSubmit}>

                <NameInput onChange={this.handleInputChange}
                           value={this.state.workingColorScheme.name}
                           id={this.inputId}
                           disabled={disabled}/>

                <DescriptionInput onChange={this.handleInputChange} value={this.state.workingColorScheme.description}
                                  id={this.inputId}
                                  disabled={disabled}/>

                <AuthorInput placeholder={this.props.selectedColorScheme.author}
                             onChange={this.handleInputChange} value={this.state.workingColorScheme.author}
                             id={this.inputId}
                             disabled={disabled}/>

                <DesignInput onChange={this.handleInputChange}
                             value={this.state.workingColorScheme.design}
                             id={this.inputId}
                             disabled={disabled}>
                    {Designs.all().map(design =>
                        <option value={design} key={design}>{design}</option>,
                    )}
                </DesignInput>
                <div className="container-fluid">
                    <div className="gx-3 row">
                        <div className="col-auto">
                            <button type="submit" className="btn btn-primary">Save</button>
                        </div>
                        <div className="col-auto">
                            <button type="button" className="btn btn-secondary"
                                    onClick={this.handleCancelClick}>Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </Form>
        );
    }

    public getSnapshotBeforeUpdate(prevProps: Readonly<ColorPickerMetadataProps>, prevState: Readonly<ColorPickerMetadataState>): any {
        const selectedColorScheme = this.props.selectedColorScheme;
        if (prevProps.selectedColorScheme.id != selectedColorScheme.id) {
            this.setState({
                workingColorScheme: new ColorSchemeFragment(selectedColorScheme),
            });
        }
        return null;
    }

    private handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
        // save color scheme
        const working = this.state.workingColorScheme;
        // we could have some unwanted fields (like "colors") in our working cs
        this.props.onUpdate({
            name: working.name!,
            description: working.description!,
            author: working.author!,
            design: working.design!,
        });
    };

    private handleInputChange: ChangeEventHandler<HTMLInputElements> = (event) => {
        this.setState((prevState, props) => {
            const newWorking = prevState.workingColorScheme.withUpdate({[event.target.name]: event.target.value});
            props.changesUnsaved(!newWorking.equals(props.selectedColorScheme));
            return {
                workingColorScheme: newWorking,
            };
        });
        // this.setState(prevState => ({
        //     workingColorScheme: {
        //         ...prevState.workingColorScheme,
        //         [event.target.name]: event.target.value,
        //     }
        // }));
    };

    private handleCancelClick: MouseEventHandler<HTMLButtonElement> = (event) => {
        this.setState({
            workingColorScheme: new ColorSchemeFragment(this.props.selectedColorScheme),
        });
    };
}