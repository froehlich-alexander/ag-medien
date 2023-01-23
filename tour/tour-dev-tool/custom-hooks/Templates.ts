import {useEffect, useMemo, useState} from "react";
import {Data, DataClass, DataType, DataTypeInitializer, InlineObjectData} from "../../Data";
import {JsonInlineObject} from "../../types";
import {TemplateContextType} from "../TourContexts";

type JsonTemplate = {
    inlineObject: JsonInlineObject,
}

interface TemplateType {
    readonly inlineObject: InlineObjectData;
}

interface Template extends DataTypeInitializer<TemplateType> {
}
class Template extends Data<TemplateType>{
    declare json: JsonTemplate;

    constructor({inlineObject}: TemplateType) {
        super();
        this.setFields({
            inlineObject: inlineObject,
        });
    }
    static {
        DataClass<typeof this, TemplateType>(this, ['inlineObject']);
    }

    public static fromJSON(json: JsonTemplate): Template {
        return new Template({
            inlineObject: InlineObjectData.fromJSON(json.inlineObject),
        })
    }
    static {
        this.makeImmutable();
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
