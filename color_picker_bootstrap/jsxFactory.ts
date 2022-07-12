/// <reference lib="DOM" />

declare global {
    namespace JSX {
        type Element = HTMLElement & { jsObject?: ClassComponent };

        type IntrinsicElementMap = {
            [K in keyof HTMLElementTagNameMap]: {
                [k: string]: any
            }
        }

        export interface IntrinsicElements extends IntrinsicElementMap {
        }

        interface ElementAttributesProperty {
            props: PropsType<ClassComponent>;
        }

        interface ElementChildrenAttribute {
            children: Node[];
        }

        interface Component {
            (properties?: { [key: string]: any }, children?: (Node | string)[]): HTMLElement
        }

        interface ElementClass {
            render: () => HTMLElement;
        }

        type Tag = keyof HTMLElementTagNameMap;
    }
}

function JSXElement<T extends ClassComponent>(htmlElement: HTMLElement, jsObject?: T): JSX.Element {
    //@ts-ignore
    htmlElement.jsObject = jsObject;
    return htmlElement;
}

export type NormalEventType<T extends ClassComponent> = { [k in keyof T["events"]]: T["events"][k] };
export type EventType<T extends ClassComponent> = { [k in keyof NormalEventType<T> as `on${Capitalize<string & k>}`]: NormalEventType<T>[k] };
export type NormalPropsType<T extends ClassComponent> = { [k in keyof T["props"]]: T["props"][k] }
export type PropsType<T extends ClassComponent> = NormalPropsType<T> | EventType<T>;
export type DefaultPropsType<T extends ClassComponent> = { [k in keyof NormalPropsType<T>]?: NormalPropsType<T>[k] }

export abstract class ClassComponent implements JSX.ElementClass, JSX.ElementAttributesProperty, JSX.ElementChildrenAttribute {
    props: EventType<ClassComponent> & { class?: string };
    children: Array<Node> = [];
    declare readonly events: { all?: () => any };
    protected static readonly eventList: string[] = []
    public rendered: boolean = false;

    //@ts-ignore
    protected readonly handler: { [k in keyof ClassComponent["events"] as Lowercase<k>]-?: ClassComponent["events"][k][] } = {};
    protected static readonly defaultProps: DefaultPropsType<ClassComponent> = {}

    constructor(props: PropsType<ClassComponent>) {
        // default properties
        this.props = {};
        let o: typeof ClassComponent = this.constructor as typeof ClassComponent;
        while (o.prototype instanceof ClassComponent || o == ClassComponent) {
            // inherit defaultProps
            for (let [k, v] of Object.entries(o.defaultProps)) {
                if (!(k in this.props)) {
                    this.props[k as keyof NormalPropsType<ClassComponent>] = v as string & ((...rest: any[]) => any);
                }
            }
            // inherit events
            for (let i of o.eventList) {
                if (!(this.constructor as typeof ClassComponent).eventList.includes(i)) {
                    if (typeof i !== "string") {
                        console.log("i not strong", i)
                    }
                    (this.constructor as typeof ClassComponent).eventList.push(i);
                }
            }
            o = Object.getPrototypeOf(o) as typeof ClassComponent;
        }

        // init event handlers
        for (let eventsKey of (this.constructor as typeof ClassComponent).eventList) {
            this.handler[eventsKey.toLowerCase() as Lowercase<keyof ClassComponent["events"]>] = [];
            this.props[("on" + eventsKey.replace(/^[a-zA-Z]/, eventsKey[0].toUpperCase())) as keyof PropsType<ClassComponent>] = ((...args: any[]) => this.handleEvent(eventsKey as keyof ClassComponent["events"], ...args)) as ClassComponent["events"][keyof ClassComponent["events"]];
        }

        console.log((this.constructor as typeof ClassComponent).name, "event list", (this.constructor as typeof ClassComponent).eventList)

        for (let [k, v] of (Object.entries(props) as [keyof PropsType<ClassComponent>, string | (() => any)][])) {
            // if [k, v] is an event handler entry
            if (k.startsWith("on") && (this.constructor as typeof ClassComponent).eventList.map(v=>v.toLowerCase()).includes(k.substring(2).toLowerCase())) {
                if (typeof v == "function") {
                    this.handler[k.substring(2).toLowerCase() as Lowercase<keyof ClassComponent["events"]>].push(v);
                } else {
                    console.log("typeof v != function but starts with on etc. ", k, v)
                }
            }
            // if [k, v] is a normal property
            else {
                this.props[k] = v as any;
            }
        }

        console.log(this.constructor.name, "props", this.props, this.handler, (this.constructor as typeof ClassComponent).eventList);
    }

    /**
     * This method calls all registred event handlers of a specific event
     * @param {keyof EventType<ClassComponent>} event
     * @param args
     * @private
     */
    private handleEvent(event: keyof ClassComponent["events"], ...args: any[]): any {
        for (let i of this.handler[event.toLowerCase() as Lowercase<keyof ClassComponent["events"]>]) {
            // we don't know the real signature
            (i as (...rest: any[]) => any)(...args);
        }
    }

    public abstract render(): JSX.Element;

    public _render(element: JSX.Element): JSX.Element {
        this.rendered = true;
        // add props
        for (let [k, v] of Object.entries(filterStandardClassAttributes(this.props))) {
            // if k is prop which can be extended and not overridden
            if (["class"].includes(k)) {
                element.setAttribute(k, element.getAttribute(k) + " " + v);
            } else {
                element.setAttribute(k, v);
            }
        }
        // append children
        for (let i in this.children) {
            appendChildren(element, i);
        }
        return element;
    }
}

export default function jsx(tag: JSX.Tag | JSX.Component,
                            attributes: { [key: string]: any } | null,
                            ...children: (HTMLElement | string)[]): JSX.Element {

    if (typeof tag === 'function') {
        // console.log(tag, attributes, ...children)
        // if we have a class component (stateful)
        if (tag.prototype instanceof ClassComponent) {
            //@ts-ignore
            let component: ClassComponent = new tag(attributes ?? {}) as ClassComponent;
            appendChildren(component, children);
            // console.log("props:", component.props, filterStandardClassAttributes(component.props))
            return JSXElement(component.render(), component)
            // return jsx(component.render.bind(component), filterStandardClassAttributes(component.props), ...component.children);
        }
        // console.log("func", tag, tag.prototype instanceof ClassComponent, tag instanceof ClassComponent)
        return JSXElement(tag(attributes ?? {}, children));
    }

    type Tag = typeof tag;
    const element: HTMLElementTagNameMap[Tag] = document.createElement(tag);

    // attributes
    for (let [key, val] of Object.entries(attributes ?? {})) {
        // event handler
        if (key.toLowerCase().startsWith("on") && key.toLowerCase() in window) {
            element.addEventListener(key.toLowerCase().substring(2), val);
        } else {
            element.setAttribute(key, val.toString());
        }
    }

    // // Assign attributes:
    // let map = (attributes ?? {});
    // let prop: keyof typeof map;
    // for (prop of (Object.keys(map) as any)) {
    //
    //     // Extract values:
    //     prop = prop.toString();
    //     const value = map[prop] as any;
    //     const anyReference = element as any;
    //     if (typeof anyReference[prop] === 'undefined') {
    //         // As a fallback, attempt to set an attribute:
    //         element.setAttribute(prop, value);
    //     } else {
    //         anyReference[prop] = value;
    //     }
    // }

    // append children
    for (let child of children) {
        appendChildren(element, child);
        // if (typeof child === 'string') {
        //     element.innerText += child;
        //     continue;
        // }
        // if (Array.isArray(child)) {
        //     element.append(...child);
        //     continue;
        // }
        // element.appendChild(child);
    }
    return JSXElement(element);

}

function appendChildren(parent: Node | ClassComponent, child: Node | string | (Node | string)[]) {
    if (Array.isArray(child)) {
        for (let i of child) {
            appendChildren(parent, i)
        }
    } else {
        if (typeof child == "string") {
            child = document.createTextNode(child);
        } else if (!(child instanceof Node)) {
            console.log("child not string nor node", child)
        }
        if (parent instanceof Node) {
            parent.appendChild(child);
        } else {
            parent.children.push(child);
        }
    }
}

const standardClassAttributes = ["class"];

function filterStandardClassAttributes(attributes: { [key: string]: any } | null): { [key: string]: any } {
    let res = {}
    for (let [k, v] of Object.entries(attributes ?? {})) {
        if (standardClassAttributes.includes(k)) {
            // @ts-ignore
            res[k] = v;
        }
    }
    return res;
}