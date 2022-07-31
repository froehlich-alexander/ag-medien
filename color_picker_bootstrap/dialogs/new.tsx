import {ColorScheme, ColorSchemeFragmentType, Design, Designs} from "../color-base/colorpickerBackend.js";
import * as React from "react";
import {ChangeEvent, createRef, FormEvent, RefObject} from "react";
import {Modal} from "react-bootstrap";
import {DefaultProps, Form} from "../utils.js";
import {AuthorInput, ColorSchemeSelect, DescriptionInput, DesignInput, NameInput} from "../forms/inputs.js";

interface NewColorSchemeDialogProps extends DefaultProps {
    onNewColorScheme: (colorScheme: ColorSchemeFragmentType) => any,
    onDialogVisibilityChange: (visibility: boolean) => any,
    show: boolean,
    // used to get e.g. the colors for the new colorscheme
    selectedColorScheme: ColorScheme,
    defaultDesign: Design,
    allColorSchemes: ColorScheme[],
}

interface NewColorSchemeDialogState {
    name: string,
    description: string,
    author: string,
    design: Design,
    // the color scheme id to use for the colors
    colorScheme: string,
}

export class NewColorSchemeDialog extends React.Component<NewColorSchemeDialogProps, NewColorSchemeDialogState> {
    // private readonly modal: RefObject<HTMLDivElement>;
    private inputId: string = "new-dialog";
    //
    // declare events: NormalEventType<Component> & {
    //     colorSchemeCreated?: (colorScheme: ColorScheme) => any,
    // };
    //
    // static override eventList = [
    //     "colorSchemeCreated",
    // ];

    constructor(props: NewColorSchemeDialogProps) {
        super(props);
        this.state = {
            name: "",
            description: "",
            author: "",
            design: props.defaultDesign,
            colorScheme: props.selectedColorScheme.id,
        };

        // this.modal = createRef<HTMLDivElement>();

        this.handleHide = this.handleHide.bind(this);
        this.handleShow = this.handleShow.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.createNewColorScheme = this.createNewColorScheme.bind(this);
    }

    public render(): JSX.Element {
        // console.log(this.constructor.name, "Designs", Object.keys(Designs), Object.entries(Designs));

        return (
            <Modal className={this.props.className}//concatClass("modal fade", this.props.className)}
                   id="new-color-scheme-dialog"
                // ref={this.modal}
                   tabIndex={-1}
                   show={this.props.show}
                   onHide={this.handleHide}
                   onShow={this.handleShow}
                   centered
                   aria-hidden={true}
                   aria-label="Dialog to create a new Color Scheme">
                {/*<div className="modal-dialog modal-dialog-centered">*/}
                {/*    <div className="modal-content">*/}
                {/*        <div className="modal-header">*/}
                <Modal.Header closeButton={true}>
                    <Modal.Title>New Color Scheme</Modal.Title>
                    {/*<button className="btn-close" type="button" data-bs-dismiss="modal"*/}
                    {/*        aria-label="Close"></button>*/}
                </Modal.Header>
                <Modal.Body>
                    <Form id="new-cs-form"
                          action="javascript:void(0);"
                          onSubmit={this.createNewColorScheme}
                          successfulSubmitted={((!this.props.show) || undefined)&&false}>

                        <ColorSchemeSelect value={this.state.colorScheme}
                                           text="You can later manually edit the colors"
                                           labelString="Base Color Scheme"
                                           onChange={this.handleInputChange}
                                           id={this.inputId}>
                            {this.props.allColorSchemes.map(cs =>
                                <option value={cs.id} key={cs.id}>{cs.name}</option>)}
                        </ColorSchemeSelect>

                        <NameInput onChange={this.handleInputChange}
                                   value={this.state.name}
                                   id={this.inputId}/>

                        <DescriptionInput onChange={this.handleInputChange}
                                          value={this.state.description}
                                          id={this.inputId}/>

                        <AuthorInput placeholder={this.props.selectedColorScheme.author}
                                     onChange={this.handleInputChange}
                                     value={this.state.author}
                                     id={this.inputId}/>

                        <DesignInput onChange={this.handleInputChange}
                                     value={this.state.design}
                                     id={this.inputId}>
                            {Designs.all().map((design) =>
                                <option value={design} key={design}>{design}</option>,
                            )}
                        </DesignInput>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <button type="button" className="btn btn-secondary" onClick={this.handleHide}>Cancel
                    </button>
                    <button type="submit" form="new-cs-form"
                            className="btn btn-primary">Create
                    </button>
                </Modal.Footer>
                {/*</div>*/}
                {/*</div>*/}
            </Modal>
        );
    }

    // public override componentDidUpdate(prevProps: Readonly<NewColorSchemeDialogProps>, prevState: Readonly<NewColorSchemeDialogState>, snapshot?: any): void {
    //     if (prevProps.visibility != this.props.visibility) {
    //         if (this.props.visibility) {
    //             Modal.getInstance(this.modal.current!)!.show();
    //         } else {
    //             Modal.getInstance(this.modal.current!)!.hide();
    //         }
    //     }
    // }

    // public override componentDidMount(): void {
    //     this.modal.current!.addEventListener("hide.bs.modal", this.handleHide);
    //     this.modal.current!.addEventListener("show.bs.modal", this.handleShow);
    // }
    //
    // public override componentWillUnmount(): void {
    //     this.modal.current!.removeEventListener("hide.bs.modal", this.handleHide);
    //     this.modal.current!.removeEventListener("show.bs.modal", this.handleShow);
    // }

    private readonly handleHide = () => {
        this.props.onDialogVisibilityChange(false);
    };

    private readonly handleShow = () => {
        this.props.onDialogVisibilityChange(true);
    };

    private handleInputChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
        const target = event.target;
        const type = target.type;
        const name: keyof NewColorSchemeDialogState = target.name as keyof NewColorSchemeDialogState;
        let value: NewColorSchemeDialogState[typeof name];
        switch (type) {
            // case "checkbox":
            //     value = (target as HTMLInputElement).checked;
            //     break;
            default:
                value = target.value;
        }
        // @ts-ignore
        this.setState({
            [name]: value,
        });
    }

    private createNewColorScheme(): void {
        // let formData = new FormData(event.target as HTMLFormElement);
        // console.log(this.constructor.name, "create new color sceheme form data:", formData);
        // let colorScheme = new ColorScheme({
        //     name: (formData.get("name")!),
        //     description: formData.get("description")!,
        //     author: formData.get("author")!,
        //     design: formData.get("design")!,
        //     colors: this.props.activeColorScheme.colors,
        // });
        console.log(NewColorSchemeDialog.name, "create new color scheme");
        this.props.onNewColorScheme({
            name: this.state.name,
            description: this.state.description,
            author: this.state.author,
            design: this.state.design,
            colors: this.props.allColorSchemes.find(value => value.id === this.state.colorScheme)!.colors,
        });
        // let newColorScheme = this.props.service.newColorScheme({
        //     name: this.inputs!.name.value,
        //     description: this.inputs!.description.value,
        //     author: this.inputs!.author.value,
        //     design: Designs[this.inputs!.design.value as "dark" | "light" | "system"],
        //     colors: this.props.parentColorScheme.colors
        // });
        // this.props.onColorSchemeCreated!(newColorScheme);
        // console.log(this.constructor.name, newColorScheme);
        // this.modal!.hide();
    }

    //
    // public setParentColorScheme(colorSchemeId: string) {
    //     if (this.props.parentColorScheme.id == colorSchemeId) {
    //         return
    //     }
    //     let colorScheme = this.props.service.getColorScheme(colorSchemeId)!;
    //     this.props.parentColorScheme = colorScheme;
    //     this.inputs?.parentColorScheme!.add(<option selected
    //                                                 value={colorScheme.id}>{colorScheme.name}</option> as HTMLOptionElement);
    // }
}