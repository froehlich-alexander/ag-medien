import * as React from "react";
import {createRef, FormEvent, HTMLProps} from "react";
import {concatClass} from "./helperFunctions";

interface FormProps extends HTMLProps<HTMLFormElement> {
    /** Whether the form was successfully submitted.<br>
     * Wenn diese prop verändert wird (sich von der vorherigen variante unterscheidet), wird wasValidated folgendermaßen gesetzt:<br>
     * wasValidated = !successfullSubmitted, denn nach einem submit sollte ein form nicht mehr wasValidated haben
     */
    successfulSubmitted?: boolean,
    /** set wasValidated directly, all other inner logic will be ignored */
    wasValidated?: boolean,
}

interface FormState {
    /** Whether the .was-validated class should be applied */
    wasValidated: boolean,
}

/**
 * A bootstrap form which can apply custom validation feedbacks
 */
class Form extends React.Component<FormProps, FormState> {
    private readonly formRef;

    constructor(props: FormProps) {
        super(props);

        this.state = {
            wasValidated: false,
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.formRef = createRef<HTMLFormElement>();
    }

    public render(): React.ReactNode {
        let {className, onSubmit, successfulSubmitted, ...formProps} = this.props;
        return (
            <form noValidate
                  {...formProps}
                  className={concatClass(className, (this.props.wasValidated ?? this.state.wasValidated) && "was-validated")}
                  ref={this.formRef}
                  onSubmit={this.handleSubmit}>
            </form>
        );
    }

    public override getSnapshotBeforeUpdate(prevProps: Readonly<FormProps>, prevState: Readonly<FormState>): any {
        if (this.props.successfulSubmitted != null && this.props.successfulSubmitted != prevProps.successfulSubmitted) {
            this.setState({
                wasValidated: !this.props.successfulSubmitted,
            });
        }
        return null;
    }

    private handleSubmit(event: FormEvent<HTMLFormElement>) {
        console.log("Form handle submit");
        this.setState({
            wasValidated: true,
        });
        // this.formRef.current!.classList.add("was-validated");
        if (!this.formRef.current!.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
            console.log("prevent");
        } else {
            this.props.onSubmit?.(event);
        }
    }
}

export {Form};