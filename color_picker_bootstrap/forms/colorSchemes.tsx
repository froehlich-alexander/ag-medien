import {Designs} from "../colorpickerBackend.js";
import * as React from "react";
import {
    ChangeEventHandler,
    ComponentProps,
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
    children?: T extends HTMLSelectElement
        ? ReactElement<HTMLProps<HTMLOptionElement>> | ReactElement<HTMLProps<HTMLOptionElement>>[]
        : never,
}

interface InputContainerProps {
    labelString: InputProps<any>["labelString"],
    text?: InputProps<any>["text"],
    invalidFeedback?: string,
    validFeedback?: string,
    children: ReactElement<HTMLProps<HTMLInputElements>>,
}

const InputContainer: FunctionComponent<InputContainerProps> = (props) => {
    let invalidFeedback;
    let inputProps: typeof props.children.props = {};
    if (props.invalidFeedback) {
        invalidFeedback = <div id={props.children.props.id + "-invalid-feedback"}
                               className='invalid-feedback'>{props.invalidFeedback}</div>;
        inputProps["aria-describedby"] = concatClass(props.children.props["aria-describedby"], invalidFeedback.props.id);
    }
    return (
        <div className='mb-3'>
            <label htmlFor={props.children.props.id} className='form-label'>{props.labelString}</label>
            {React.cloneElement(props.children, inputProps)}
            {props.text && <div className='form-text'>{props.text}</div>}
            {invalidFeedback}
            {props.validFeedback && <div id={props.children.props.id + "-valid-feedback"}
                                         className='valid-feedback'>{props.validFeedback}</div>}
        </div>
    );
}


interface ColorSchemeSelectProps extends InputProps<HTMLSelectElement> {
    children: ReactElement<HTMLProps<HTMLOptionElement>> | ReactElement<HTMLProps<HTMLOptionElement>>[],
    labelString: InputProps<any>["labelString"],
}

const ColorSchemeSelect: FunctionComponent<ColorSchemeSelectProps> = (props: ColorSchemeSelectProps) => {
    return (
        <InputContainer text={props.text} labelString={props.labelString}>
            <select id='new-cs-parent-cs-input'
                    name='colorScheme'
                    {...props}
                    className={concatClass(props.className, 'form-select')}>
                {props.children}
            </select>
        </InputContainer>
    );
}

interface NameInputProps extends InputProps<HTMLInputElement> {
}

const NameInput: FunctionComponent<NameInputProps> = (props) => {
    return (
        <InputContainer labelString={props.labelString ?? "Name"}
                        invalidFeedback='You must provide a name'
                        text={props.text}>
            <input id="new-cs-name-input"
                   name='name'
                   className={concatClass(props.className, 'form-control')}
                   type='text'
                   required
                   placeholder="Your Color Scheme's name"
                   {...props}/>
        </InputContainer>
    );
}

interface DescriptionInputProps extends InputProps<HTMLTextAreaElement> {

}

const DescriptionInput: FunctionComponent<DescriptionInputProps> = (props) => {
    return (
        <InputContainer labelString={props.labelString ?? "Description"}>
            <textarea id="new-cs-description-input"
                      name='description'
                      placeholder='A very interesting description...'
                      {...props}
                      className={concatClass(props.className, 'form-control')}/>
        </InputContainer>);
}

interface AuthorInputProps extends InputProps<HTMLInputElement> {

}

const AuthorInput: FunctionComponent<AuthorInputProps> = (props) => {
    return (
        <InputContainer labelString={props.labelString ?? "Author"}
                        invalidFeedback='You must provide an author'>
            <input id="new-cs-author-input"
                   name='author'
                   type='text'
                   required
                   {...props}
                   className={concatClass(props.className, 'form-control')}/>
        </InputContainer>
    );
}

interface DesignProps extends InputProps<HTMLSelectElement> {

}

const DesignInput: FunctionComponent<DesignProps> = (props) => {
    return (
        <InputContainer labelString={props.labelString ?? "Design"}>
            <select id="new-cs-design-select"
                    name='design'
                    required
                    {...props}
                    className={concatClass(props.className, 'form-select')}>
                {props.children}
            </select>
        </InputContainer>
    );
}

export {ColorSchemeSelect, NameInput, DescriptionInput, AuthorInput, DesignInput};