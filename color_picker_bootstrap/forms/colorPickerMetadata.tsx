import * as React from "react";
import {AuthorInput, ColorSchemeSelect, DescriptionInput, DesignInput, HTMLInputElements, NameInput} from "./inputs";
import {
    ColorScheme,
    ColorSchemeFragment,
    ColorSchemeInterface,
    Designs,
} from "../color-base/colorpickerBackend";
import {Form} from "../utils";
import {ChangeEventHandler, FormEventHandler} from "react";

export type ColorSchemeMetadata = Omit<ColorSchemeInterface, "colors" | "id" | "current" | "preDefined">;

interface ColorPickerMetadataProps {
    selectedColorScheme: ColorScheme,
    onUpdate: (metadata: ColorSchemeMetadata) => any,
}

interface ColorPickerMetadataState {
    workingColorScheme: ColorSchemeFragment,
}

export class ColorPickerMetadata extends React.Component<ColorPickerMetadataProps, ColorPickerMetadataState> {
    inputId = "color-picker-metadata"

    constructor(props: ColorPickerMetadataProps) {
        super(props);

        this.state = {
            workingColorScheme: new ColorSchemeFragment(this.props.selectedColorScheme),
        }
    }


    public render(): React.ReactNode {
        return (
            <Form id='new-cs-form'
                // action='javascript:void(0);'
                  onSubmit={this.handleSubmit}>

                <NameInput onChange={this.handleInputChange}
                           value={this.state.workingColorScheme.name}
                           id={this.inputId}/>

                <DescriptionInput onChange={this.handleInputChange} value={this.state.workingColorScheme.description}
                                  id={this.inputId}/>

                <AuthorInput placeholder={this.props.selectedColorScheme.author}
                             onChange={this.handleInputChange} value={this.state.workingColorScheme.author}
                             id={this.inputId}/>

                <DesignInput onChange={this.handleInputChange}
                             value={this.state.workingColorScheme.design}
                             id={this.inputId}>
                    {Designs.all().map(design =>
                        <option value={design} key={design}>{design}</option>
                    )}
                </DesignInput>
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
    }

    private handleInputChange: ChangeEventHandler<HTMLInputElements> = (event) => {
        this.setState(prevState => ({
            workingColorScheme: prevState.workingColorScheme.withUpdate({[event.target.name]: event.target.value})
        }));
        // this.setState(prevState => ({
        //     workingColorScheme: {
        //         ...prevState.workingColorScheme,
        //         [event.target.name]: event.target.value,
        //     }
        // }));
    }
}