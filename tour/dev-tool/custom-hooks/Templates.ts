import {useEffect, useMemo, useState} from "react";
import {DataType, InlineObjectData} from "../../js/Data";
import {JsonInlineObject} from "../../js/types";
import {TemplateContextType} from "../TourContexts";

type JsonTemplate = {
    inlineObject: JsonInlineObject,
}
class Template {
    public readonly inlineObject: InlineObjectData;

    constructor({inlineObject}: DataType<Template>) {
        this.inlineObject = inlineObject;
    }

    public toJSON(): JsonTemplate {
        return {
            inlineObject: this.inlineObject,
        }
    }

    public static fromJSON(json: JsonTemplate): Template {
        return new Template({
            inlineObject: InlineObjectData.fromJSON(json.inlineObject),
        })
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
