import {useEffect, useMemo, useState} from "react";
import {Data, DataType, InlineObjectData} from "../../Data";
import {JsonInlineObject} from "../../types";
import {TemplateContextType} from "../TourContexts";

type JsonTemplate = {
    inlineObject: JsonInlineObject,
}
class Template extends Data<Template>{
    public readonly inlineObject: InlineObjectData;
    declare excludeFromDataType: 'excludeFromDataType';

    constructor({inlineObject}: DataType<Template>) {
        super();
        this.inlineObject = inlineObject;
    }

    public static fromJSON(json: JsonTemplate): Template {
        return new Template({
            inlineObject: InlineObjectData.fromJSON(json.inlineObject),
        })
    }

    public equals(other: any): boolean {
        return other != null && (this === other || (
            this.inlineObject.equals(other.inlineObject)
        ));
    }

    public toJSON(): JsonTemplate {
        return {
            inlineObject: this.inlineObject,
        }
    }
}

export default function useTemplates() {
    const [inlineObject, setInlineObject] = useState(InlineObjectData.default());

    // read from local storage
    useEffect(() => {
        const rawTemplate = window.localStorage.getItem('templates');
        if (rawTemplate) {
            const template: Template = Template.fromJSON(JSON.parse(rawTemplate));
            setInlineObject(template.inlineObject);
        }
    }, []);

    // write to local storage
    useEffect(() => {
        const template = new Template({
            inlineObject: inlineObject,
        });
        console.log('template', template);
        window.localStorage.setItem('templates', JSON.stringify(template));
    }, [inlineObject]);

    const templateContext: TemplateContextType = useMemo(() => ({
        inlineObject: inlineObject,
        setInlineObject: setInlineObject,
    }), [inlineObject]);

    return {
        templateContext,
    };
};
