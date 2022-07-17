import {Designs} from "../colorpickerBackend.js";
import * as React from "react";
import {
    ChangeEventHandler,
    DetailedReactHTMLElement,
    HTMLProps,
    ReactElement,
    ReactHTMLElement
} from "react";
import {concatClass, FunctionComponent} from "../utils.js";

type HTMLInputElements = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;


// @ts-ignore
interface InputProps<T extends HTMLInputElements> extends HTMLProps<T> {
    onChange?: ChangeEventHandler,
    text?: string | number,
    labelString?: string | number,
    invalidFeedback?: string,
    validFeedback?: string,
    id: NonNullable<HTMLProps<T>["id"]>,
    children?: T extends HTMLSelectElement
        ? ReactElement<HTMLProps<HTMLOptionElement>> | ReactElement<HTMLProps<HTMLOptionElement>>[]
        : never,
}

interface InputContainerProps {
    labelString: InputProps<any>["labelString"],
    text?: InputProps<any>["text"],
    invalidFeedback?: InputProps<any>["invalidFeedback"],
    validFeedback?: InputProps<any>["validFeedback"],
    inputGroup?: boolean,
    children: ReactElement<HTMLProps<HTMLInputElements>>,
}

const InputContainer: FunctionComponent<InputContainerProps> = (props) => {
    let invalidFeedback;
    let validFeedback;
    let text;
    let inputProps: typeof props.children.props = {
        "aria-describedby": props.children.props["aria-describedby"],
        className: props.children.props.className,
    };

    if (props.invalidFeedback) {
        invalidFeedback = <div id={props.children.props.id + "-invalid-feedback"}
                               className='invalid-feedback'>{props.invalidFeedback}</div>;
        inputProps["aria-describedby"] = concatClass(inputProps["aria-describedby"], invalidFeedback.props.id);
    }

    if (props.text) {
        text = <div id={props.children.props.id + "-form-text"} className='form-text col-12'>{props.text}</div>;
        inputProps["aria-describedby"] = concatClass(inputProps["aria-describedby"], text.props.id);
    }

    if (props.validFeedback) {
        validFeedback = <div id={props.children.props.id + "-valid-feedback"}
                             className='valid-feedback'>{props.validFeedback}</div>;
    }

    if (props.inputGroup) {
        return (
            <div className='row input-group mb-3'>
                <label htmlFor={props.children.props.id}
                       className='col-auto input-group-text'>{props.labelString}</label>
                {React.cloneElement(props.children, {
                    ...inputProps,
                    className: concatClass(inputProps.className, "col")
                })}
                {invalidFeedback}
                {validFeedback}
                {text}
            </div>
        );
    } else {
        return (
            <div className='mb-3'>
                <label htmlFor={props.children.props.id} className='form-label'>{props.labelString}</label>
                {React.cloneElement(props.children, inputProps)}
                {text}
                {invalidFeedback}
                {validFeedback}
            </div>
        );
    }
}

InputContainer.defaultProps = {
    inputGroup: true,
}


interface ColorSchemeSelectProps extends InputProps<HTMLSelectElement> {
    children: ReactElement<HTMLProps<HTMLOptionElement>> | ReactElement<HTMLProps<HTMLOptionElement>>[],
    labelString: InputProps<any>["labelString"],
}

const ColorSchemeSelect: FunctionComponent<ColorSchemeSelectProps> = (
    {
        id,
        text,
        labelString,
        className,
        invalidFeedback,
        validFeedback,
        ...inputProps
    }) => {
    return (
        <InputContainer text={text}
                        labelString={labelString}
                        invalidFeedback={invalidFeedback}
                        validFeedback={validFeedback}>
            <select name='colorScheme'
                    {...inputProps}
                    id={id + "-" + 'color-scheme-input'}
                    className={concatClass(className, 'form-select')}>
            </select>
        </InputContainer>
    );
}

interface NameInputProps extends InputProps<HTMLInputElement> {
}

const NameInput: FunctionComponent<NameInputProps> = (
    {
        id,
        text,
        labelString,
        className,
        invalidFeedback,
        validFeedback,
        ...inputProps
    }) => {
    return (
        <InputContainer labelString={labelString}
                        text={text}
                        invalidFeedback={invalidFeedback}
                        validFeedback={validFeedback}>
            <input name='name'
                   type='text'
                   required
                   placeholder="Your Color Scheme's name"
                   {...inputProps}
                   className={concatClass(className, 'form-control')}
                   id={id + "-" + 'name-input'}/>
        </InputContainer>
    );
}
NameInput.defaultProps = {
    labelString: "Name",
    invalidFeedback: "You must provide a name",
}

interface DescriptionInputProps extends InputProps<HTMLTextAreaElement> {

}

const DescriptionInput: FunctionComponent<DescriptionInputProps> = (
    {
        id,
        text,
        labelString,
        className,
        invalidFeedback,
        validFeedback,
        ...inputProps
    }) => {
    return (
        <InputContainer labelString={labelString}
                        text={text}
                        invalidFeedback={invalidFeedback}
                        validFeedback={validFeedback}>
            <textarea name='description'
                      placeholder='A very interesting description...'
                      {...inputProps}
                      className={concatClass(className, 'form-control')}
                      id={id + "-" + 'description-input'}/>
        </InputContainer>);
}
DescriptionInput.defaultProps = {
    labelString: "Description",

}

interface AuthorInputProps extends InputProps<HTMLInputElement> {


}

const AuthorInput: FunctionComponent<AuthorInputProps> = (
    {
        id,
        text,
        labelString,
        className,
        invalidFeedback,
        validFeedback,
        ...inputProps
    }) => {
    return (
        <InputContainer labelString={labelString}
                        text={text}
                        invalidFeedback={invalidFeedback ?? "You must provide an author"}
                        validFeedback={validFeedback ?? ("Hello " + inputProps.value)}
        >
            <input name='author'
                   type='text'
                   required
                   {...inputProps}
                   className={concatClass(className, 'form-control')}
                   id={id + '-author-input'}
            />
        </InputContainer>
    );
}
AuthorInput.defaultProps = {
    labelString: "Author",
}

interface DesignProps extends InputProps<HTMLSelectElement> {

}

const DesignInput: FunctionComponent<DesignProps> = (
    {
        id,
        text,
        labelString,
        className,
        invalidFeedback,
        validFeedback,
        ...inputProps
    }) => {
    return (
        <InputContainer labelString={labelString}
                        text={text}
                        invalidFeedback={invalidFeedback}
                        validFeedback={validFeedback}>
            <select
                name='design'
                required
                {...inputProps}
                className={concatClass(className, 'form-select')}
                id={id + "-" + 'design-select'}>
            </select>
        </InputContainer>
    );
}
DesignInput.defaultProps = {
    labelString: "Design",
}

type ColorInputProps = Omit<InputProps<HTMLInputElement>, "text">;
// interface ColorInputProps extends ExcludeKey<InputProps<HTMLInputElement>, "text">{}

const ColorInput: FunctionComponent<ColorInputProps> = (
    {
        id,
        labelString,
        className,
        invalidFeedback,
        validFeedback,
        ...inputProps
    }) => {
    return (
        <InputContainer labelString={labelString}
            // text={text}
                        invalidFeedback={invalidFeedback}
                        validFeedback={validFeedback}>
            <input type='color'
                   className={concatClass(className, "form-select")}
                   id={id + "-color-input"}
                   {...inputProps}/>
        </InputContainer>
    );
}

export {ColorSchemeSelect, NameInput, DescriptionInput, AuthorInput, DesignInput};