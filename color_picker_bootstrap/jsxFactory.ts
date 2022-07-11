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
            props: {};
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

export abstract class ClassComponent implements JSX.ElementClass {
    declare props: {};

    public abstract render(): JSX.Element;
}

export default function jsx(tag: JSX.Tag | JSX.Component | ClassComponent,
                            attributes: { [key: string]: any } | null,
                            ...children: (Node | string)[]) {

    if (typeof tag === 'function') {
        console.log(tag, attributes, ...children)
        // if we have a class component (stateful)
        if (tag instanceof ClassComponent) {
            let component = new tag(attributes ?? {});
            component.children.extend(children);
            return component.render();
        }
        return tag(attributes ?? {}, children);
    }
    // else if (typeof tag == 'object') {
    //     return tag.render(attributes ?? {}, children)
    // }
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

function appendChildren(parent: Node, child: Node | string | (Node | string)[]) {
    if (Array.isArray(child)) {
        for (let i in child) {
            appendChildren(parent, i)
        }
    } else {
        if (typeof child == "string") {
            parent.appendChild(document.createTextNode(child));
        } else {
            parent.appendChild(child)
        }
    }
}