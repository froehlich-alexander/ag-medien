import {Modal} from "bootstrap";
import {createRef, RefObject} from "react";
import * as React from "react";
import {ColorScheme, ColorSchemeFragmentType, Designs} from "./color-base/colorpickerBackend";
import ColorPickerService from "./color-base/ColorPickerService";
import ColorSchemeActions from "./ColorSchemeActions";
import ExportDialog from "./dialogs/Export";
import ImportDialog from "./dialogs/Import";
import {NewColorSchemeDialog} from "./dialogs/new";
import {ColorPickerForm} from "./forms/colorPickerForm";
import {ColorPickerMetadata} from "./forms/colorPickerMetadata";
import NavBar from "./NavBar";
import ColorSchemeDropdownMenu from "./ColorSchemeDropdownMenu";
import {concatClass, DefaultProps, saveToFile} from "./utils";

interface ColorPickerProps extends DefaultProps {
}

interface ColorPickerState {
    selectedColorScheme: ColorScheme, // the color scheme which is selected by the user and on which actions like delete will apply
    activeColorScheme: ColorScheme, // the color scheme which got activated via ColorSchemeService.activate()
    newColorSchemeDialogVisibility: boolean,
    allColorSchemes: ColorScheme[],
    colorSchemeMetadataUnsaved: boolean, // whether the color scheme metadata inputs hold unsaved data
}

export class ColorPicker extends React.Component<ColorPickerProps, ColorPickerState> {
    // declare props: PropsType<Component> & { service: ColorPickerService };
    private service: ColorPickerService;
    private downloadAnchor: RefObject<HTMLAnchorElement> = createRef();

    constructor(props: ColorPickerProps) {
        super(props);
        this.service = new ColorPickerService();
        this.state = {
            selectedColorScheme: this.service.getCurrent(),
            newColorSchemeDialogVisibility: false, // = dialog hidden
            allColorSchemes: this.service.allList,
            activeColorScheme: this.service.getCurrent(),
            colorSchemeMetadataUnsaved: false,
        };
    }

    public render(): JSX.Element {

        // update NewColorSchemeDialog and ColorSchemeActions when a new CS is selected
        // (colorSchemeDropdownMenu.jsObject! as ColorSchemeDropdownMenu).on("colorSchemeSelected",
        //     (newColorSchemeDialog.jsObject! as NewColorSchemeDialog).setParentColorScheme.bind(newColorSchemeDialog.jsObject!));
        // (colorSchemeDropdownMenu.jsObject! as ColorSchemeDropdownMenu).on("colorSchemeSelected",
        //     (colorSchemeActions.jsObject! as ColorSchemeActions).setColorSchemeId.bind(colorSchemeActions.jsObject!))

        return (
            <>
                <NewColorSchemeDialog
                    allColorSchemes={this.state.allColorSchemes}
                    hidden={!this.state.newColorSchemeDialogVisibility}
                    onDialogVisibilityChange={(visibility) => this.setState({newColorSchemeDialogVisibility: visibility})}
                    defaultDesign={Designs.system}
                    selectedColorScheme={this.state.selectedColorScheme}
                    onNewColorScheme={this.handleNewColorScheme}/>
                <ExportDialog downloadAnchor={this.downloadAnchor}
                              allColorSchemes={this.state.allColorSchemes}/>
                <ImportDialog allColorSchemes={this.state.allColorSchemes}
                              service={this.service}
                              onColorSchemeImport={this.handleNewColorScheme}/>
                <div className={concatClass("container p-5", this.props.className)}>
                    <NavBar onClose={() => console.log("colorpicker closed")}></NavBar>
                    <div className="row">
                        <ColorSchemeDropdownMenu
                            selectedColorSchemes={(new Set<string>()).add(this.state.selectedColorScheme.id)}
                            colorSchemes={this.state.allColorSchemes}
                            onColorSchemeSelected={this.handleColorSchemeSelected}
                            className="col-5"/>
                        <div className="col-2"></div>
                        <ColorSchemeActions selectedColorScheme={this.state.selectedColorScheme}
                                            onActivate={this.handleActivate}
                                            onDelete={this.handleDelete}
                                            className="col-5"/>
                    </div>
                    <div className="accordion" id="color-picker-main-accordion">
                        <div className="accordion-item">
                            {/*Color Picker*/}
                            <h2 className="accordion-header" id="color-picker-form-header">
                                <button className="accordion-button" type="button" data-bs-toggle="collapse"
                                        data-bs-target="#color-picker-form" aria-expanded="true"
                                        aria-controls="color-picker-form">
                                    Colors
                                </button>
                            </h2>
                            <div id="color-picker-form" className="accordion-collapse collapse"
                                 aria-labelledby="color-picker-form-header"
                                 data-bs-parent="#color-picker-main-accordion">
                                <div className="accordion-body">
                                    <ColorPickerForm colorTypes={this.service.colorTypes}
                                                     selectedColorScheme={this.state.selectedColorScheme}
                                                     onColorSchemeChange={this.handleColorSchemeChange}/>
                                </div>
                            </div>

                            {/*Edit Color Scheme*/}
                            <h2 className="accordion-header" id="edit-color-scheme-metadata-header">
                                <button className="accordion-button" type="button" data-bs-toggle="collapse"
                                        data-bs-target="#edit-color-scheme-metadata" aria-expanded="true"
                                        aria-controls="edit-color-scheme-metadata">
                                    Color Scheme Metadata
                                </button>
                            </h2>
                            <div id="edit-color-scheme-metadata" className="accordion-collapse collapse show"
                                 aria-labelledby="edit-color-scheme-metadata-header"
                                 data-bs-parent="#color-picker-main-accordion">
                                <div className="accordion-body">
                                    <ColorPickerMetadata selectedColorScheme={this.state.selectedColorScheme}
                                                         onUpdate={this.handleColorSchemeChange}
                                                         changesUnsaved={(value) => this.setState({colorSchemeMetadataUnsaved: value})}/>
                                </div>
                            </div>
                        </div>
                    </div>
                    <a className="d-none"
                       aria-label="Hidden Anchor used for downloading text"
                       ref={this.downloadAnchor}></a>
                </div>
            </>
        );
    }

    public componentDidMount(): void {
        const modal = document.getElementById("color-scheme-import-dialog");
        console.log(modal);
        Modal.getOrCreateInstance(modal!)!.show();
    }

    private handleColorSchemeSelected = (selectedColorSchemes: Set<string>) => {
        let colorScheme = this.service.getColorScheme(Array.from(selectedColorSchemes)[0]);
        if (colorScheme != null && !colorScheme.equals(this.state.selectedColorScheme)) {
            this.setState({
                selectedColorScheme: colorScheme,
            });
        }
    };

    private handleNewColorScheme = (...colorSchemes: (ColorSchemeFragmentType | ColorSchemeFragmentType[])[]) => {
        for (let i of colorSchemes) {
            for (let j of (Array.isArray(i) ? i : [i])) {
                this.service.newColorScheme(j);
            }
        }
        this.setState({
            newColorSchemeDialogVisibility: false,
            allColorSchemes: this.service.allList,
        });
    };

    private handleActivate = (): void => {
        this.service.activate(this.state.selectedColorScheme);
        this.updateState();
    };

    private handleDelete = (): void => {
        this.service.delete(this.state.selectedColorScheme);
        this.updateState();
    };

    private updateState = () => {
        this.setState({
            activeColorScheme: this.service.getCurrent(),
            selectedColorScheme: this.service.getColorScheme(this.state.selectedColorScheme.id) ?? this.getDefaultSelectedColorScheme(),
            allColorSchemes: this.service.allList,
        });
    };

    private getDefaultSelectedColorScheme(): ColorScheme {
        return this.service.getCurrent();
    }

    private handleColorSchemeChange = (colorSchemeFragment: ColorSchemeFragmentType) => {
        const selected = this.state.selectedColorScheme;
        const edited = selected.withUpdate(colorSchemeFragment);
        console.log("cs change", colorSchemeFragment, selected, edited);

        if (!selected.equals(edited)) {
            console.log("cs unequal, update");
            this.service.setColorScheme(edited);
            this.setState({
                selectedColorScheme: this.service.getColorScheme(selected.id)!,
                activeColorScheme: this.service.getCurrent(),
                allColorSchemes: this.service.allList,
            });
        }

        // let serviceColorScheme = this.service.getColorScheme(colorScheme.id)!;
        // if (!colorScheme.equals(serviceColorScheme)) {
        //     colorScheme.copy(serviceColorScheme);
        //
        //     if (this.state.activeColorScheme.id == serviceColorScheme.id || this.state.selectedColorScheme.id == serviceColorScheme.id) {
        //         this.setState({
        //             activeColorScheme: this.service.getCurrent(),
        //             selectedColorScheme: this.service.getColorScheme(this.state.selectedColorScheme.id)!,
        //             allColorSchemes: this.service.allList,
        //         });
        //     }
        // }

    };
}

export default ColorPicker;