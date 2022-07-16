import * as React from "react";
import {createRef, FormEvent, HTMLProps} from "react";

interface DefaultProps {
    className?: string,
}

type FunctionComponent<P extends {[k: string]:any}> = React.FunctionComponent<(P extends {"children":any} ? P : React.PropsWithChildren<P>)>;

function concatClass(...classes: (string | false | undefined)[]): string | undefined {
    return classes.filter(v => v).join(" ") ?? undefined;
}

interface FormProps extends HTMLProps<HTMLFormElement> {
}

interface FormState {
}

/**
 * A bootstrap form which can apply custom validation feedbacks
 */
class Form extends React.Component<FormProps, FormState> {
    private readonly formRef;

    constructor(props: FormProps) {
        super(props);

        this.handleSubmit = this.handleSubmit.bind(this);
        this.formRef = createRef<HTMLFormElement>();
    }

    public render(): React.ReactNode {
        return (
            <form noValidate
                  {...this.props}
                  ref={this.formRef}
                  onSubmit={this.handleSubmit}>
                {this.props.children}
            </form>
        );
    }

    private handleSubmit(event: FormEvent<HTMLFormElement>) {
        this.formRef.current!.classList.add("was-validated");
        if (!this.formRef.current!.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
        } else {
            this.props.onSubmit?.(event);
        }
    }
}

export {Form, concatClass, DefaultProps, FunctionComponent};
