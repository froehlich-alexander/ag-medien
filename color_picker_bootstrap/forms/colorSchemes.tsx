import {Designs} from "../colorpickerBackend.js";
import * as React from "react";
import {ChangeEventHandler, FC, ReactHTMLElement} from "react";

type HtmlInputElements = HTMLInputElement|HTMLSelectElement;

interface InputProps<T extends HtmlInputElements> {
    value?: React.ReactHTMLElement<T>["props"]["value"],
    text?: string | number,
    label: string | number,
    onChange?: ChangeEventHandler<T>,
}

interface InputContainerProps {
    label: InputProps<any>["label"],
    text?: InputProps<any>["text"],
    children: ReactHTMLElement<HtmlInputElements>,
}

const InputContainer: React.FunctionComponent<InputContainerProps> = (props) => {
    return (
        <div className='mb-3'>
            <label htmlFor={props.children.props.id} className='form-label'>{props.label}</label>
            {props.children}
            {props.text && <div className='form-text'>{props.text}</div>}
        </div>
    );
}


interface ColorSchemeSelectProps extends InputProps<HTMLSelectElement> {
    options: React.ReactHTMLElement<HTMLOptionElement>[],
}

function ColorSchemeSelect(props: ColorSchemeSelectProps) {
    return (
        <InputContainer text={props.text} label={props.label}>
            <select id='new-cs-parent-cs-input'
                    name='colorScheme'
                    className='form-select'
                    value={props.value}
                    onChange={props.onChange}
                    disabled>
                {props.options}
            </select>
        </InputContainer>
    );
}

{/*Name*/
}
<div className='mb-3'>
    <label htmlFor='new-cs-name-input' className='form-label'>Name</label>
    <input id="new-cs-name-input"
           name='name'
           value={this.state.name}
           onChange={this.handleInputChange}
           aria-describedby='new-cs-name-invalid'
           className='form-control'
           type='text'
           required
           placeholder="Your Color Scheme's name"/>
    <div id='new-cs-name-invalid' className='invalid-feedback'>
        You must provide a name
    </div>
</div>

{/*Description*/
}
<div className='mb-3'>
    <label htmlFor='new-cs-description-input'
           className='form-label'>Description</label>
    <textarea id="new-cs-description-input"
              name='description'
              value={this.state.description}
              onChange={this.handleInputChange}
              aria-describedby="new-cs-description-invalid"
              className='form-control'
              placeholder='A very interesting description...'/>
</div>

{/*Author*/
}
<div className='mb-3'>
    <label htmlFor='new-cs-author-input' className='form-label'>Author</label>
    <input id="new-cs-author-input"
           name='author'
           value={this.state.author}
           onChange={this.handleInputChange}
           aria-describedby='new-cs-author-invalid'
           type='text'
           required
           className='form-control'
           placeholder={this.props.selectedColorScheme.author}/>
    <div id='new-cs-author-invalid' className='invalid-feedback'>
        You must provide an author
    </div>
</div>

{/*Design*/
}
<div className='mb-3'>
    <label htmlFor='new-cs-design-select' className='form-label'>Design</label>
    <select id="new-cs-design-select"
            name='design'
            value={this.state.design}
            onChange={this.handleInputChange}
            className='form-select'
            required>
        {Object.entries(Designs).map(([k, v]) =>
            <option value={v} key={v}>{v}</option>
        )}
    </select>
</div>

export {ColorSchemeSelect};