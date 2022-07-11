/// <reference lib="DOM" />

declare global {
    namespace JSX {
        type Element = HTMLElement;

        type IntrinsicElementMap = {
            [K in keyof HTMLElementTagNameMap]: {
                [k: string]: any
            }
        }

        export interface IntrinsicElements extends IntrinsicElementMap {
        }

        interface ElementAttributesProperty {
            props: { class?: string };
        }

        interface ElementChildrenAttribute {
            children: {};
        }

        interface Component {
            (properties?: { [key: string]: any }, children?: (Node | string)[]): Node
        }

        interface ElementClass {
            render: () => JSX.Element;
        }

        type Tag = keyof HTMLElementTagNameMap;
    }
}

export abstract class ClassComponent implements JSX.ElementClass, JSX.ElementAttributesProperty, JSX.ElementChildrenAttribute {
    props: { class?: string };
    children: Array<Node> = [];

    constructor(props: { class?: string, [index: string]: any }) {
        this.props = props;
    }

    public abstract render(): JSX.Element;

    public _render(element: JSX.Element): JSX.Element {
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
                            ...children: (Node | string)[]): Node {

    if (typeof tag === 'function') {
        // console.log(tag, attributes, ...children)
        // if we have a class component (stateful)
        if (tag.prototype instanceof ClassComponent) {
            //@ts-ignore
            let component: ClassComponent = new tag(attributes ?? {}) as ClassComponent;
            appendChildren(component, children);
            // console.log("props:", component.props, filterStandardClassAttributes(component.props))
            return component.render()
            // return jsx(component.render.bind(component), filterStandardClassAttributes(component.props), ...component.children);
        }
        // console.log("func", tag, tag.prototype instanceof ClassComponent, tag instanceof ClassComponent)
        return tag(attributes ?? {}, children);
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
    return element;

}

function appendChildren(parent: Node | ClassComponent, child: Node | string | (Node | string)[]) {
    if (Array.isArray(child)) {
        for (let i of child) {
            appendChildren(parent, i)
        }
    } else {
        if (typeof child == "string") {
            child = document.createTextNode(child);
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