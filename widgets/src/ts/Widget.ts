import {Pair} from "./base.js";
// import {$, jQuery} from "../lib/jquery";
// import * as $ from "jquery";
import "./imports.js";
import Event = JQuery.Event;

const WidgetEvents = {
    build: "build",
    all: "all",
    visibilityChanged: "visibilityChanged",
    sizeSet: "sizeSet",
    initialize: "initialize",
    rebuild: "rebuild",
    needVisibilityUpdate: "needVisibilityUpdate",
    clicked: "clicked"
};

type WidgetEvents = (typeof WidgetEvents)[keyof typeof WidgetEvents];

type EventCallback<T extends WidgetEvents, T1 extends HTMLElement, T2 extends Widget<T, T1> = Widget<T, T1>> = {
    [type in T]?: EventHandler<T, T1, T2>;
};

type EventHandler<T extends WidgetEvents, T1 extends HTMLElement, T2 extends Widget<T, T1> = Widget<T, T1>> = (event: { type: T, target: T2, originalEvent: Event | null }, ...args: any[]) => void;

abstract class _EventHandler<HtmlElementType extends HTMLElement> {
    public abstract on(events: EventCallback<string, HtmlElementType> | string, handler?: EventHandler<string, HtmlElementType>): this;

    protected abstract dispatchEvent(type: string, args?: any[], originalEvent?: Event | null, ...acceptedTypes: string[]): this;
}

interface _Widget {
    // appendTo(element: JQuery.Selector | JQuery<HTMLElement> | JQuery.htmlString | JQuery.TypeOrArray<Element | DocumentFragment>): this;

    build(suppressCallback: boolean): JQuery<HTMLElement>;

    rebuild(suppressCallback: boolean): JQuery<HTMLElement>;

    destroy(): this;

    show(): this;

    hide(): this;

    setVisibility(visible: boolean): this;
}

abstract class Widget<EventType extends WidgetEvents, HtmlElementType extends HTMLElement = HTMLElement> extends _EventHandler<HtmlElementType> implements _Widget {
    private _built: boolean = false;
    private _domObject?: JQuery<HtmlElementType>;
    protected readonly children: Map<string, Widget<WidgetEvents, any>> = new Map();
    private readonly callbacks: Array<Pair<string, EventHandler<string, HtmlElementType, this>>> = [];
    private readonly _disabledEvents: Set<string> = new Set();
    private _visibility: boolean = false;
    private _inheritVisibility: boolean = false;
    private _hidingIfNotShown: boolean = false;
    private sizeSet: boolean = false;
    private sizeSetObserver: MutationObserver;
    private htmlElementType: string = "div";

    constructor(htmlElementType?: string) {
        super();
        if (htmlElementType != null) {
            this.htmlElementType = htmlElementType;
        }
        this.sizeSetObserver = new MutationObserver((mutationList) => {
            let target = $(mutationList[0].target);
            if (target.filter(":visible").length > 0) {
                if (this.sizeSet) {
                    this.sizeSetObserver.disconnect();
                    return;
                }
                this.sizeSet = true;
                this.dispatchEvent(WidgetEvents.sizeSet);
                // if (target.filter(".button-box-widget").length > 0) {
                //     console.log("widget sizeSetObserver");
                //     console.log(target);
                //     console.log(mutationList[0]);
                // }
                this.sizeSetObserver.disconnect();
            }
        });
        this.on(WidgetEvents.sizeSet, () => {
            this.dispatchEvent(WidgetEvents.needVisibilityUpdate);
            this.buildVisibility();
        });
    }

    /**
     * This method should call {@link buildCallback} before it returns
     */
    public build(suppressCallback: boolean = false): JQuery<HtmlElementType> {
        this._domObject = <JQuery<HtmlElementType>>$(`<${this.htmlElementType}></${this.htmlElementType}>`)
            .addClass("widget")
            .toggleClass("hidingIfNotShown", this._hidingIfNotShown)
            .on("click", (event) => this.dispatchEvent(WidgetEvents.clicked, undefined, event));
        // this.sizeSetObserver.observe(this._domObject.get()[0], {
        //     attributeFilter: ["style", "class"],
        // });
        // this._built = true;
        return this.buildCallback(suppressCallback);
    }

    public rebuild(suppressCallback: boolean = false): JQuery<HtmlElementType> {
        this.sizeSetObserver.observe(this._domObject!.get(0)!, {
            attributeFilter: ["style", "class"],
        });
        for (let i of this.children.values()) {
            i.tryRebuild();
        }
        return this.rebuildCallback(suppressCallback);
    }

    public tryRebuild(suppressCallback: boolean = false): JQuery<HtmlElementType> | undefined {
        if (this.built) {
            this.rebuild(suppressCallback);
        }
        return this._domObject;
    }

    public destroy(): this {
        console.assert(this.built);
        this._built = false;
        this._domObject!.remove().off();
        this.setVisibility(false);
        return this;
    }

    protected buildCallback(suppress: boolean = false): JQuery<HtmlElementType> {
        this._built = true;
        if (suppress) {
            return this._domObject!;
        }
        this.rebuild(true);
        this._built = true;
        this.dispatchEvent(WidgetEvents.build);
        this.buildVisibility();
        return this.domObject!;
    }

    protected rebuildCallback(suppress: boolean = false): JQuery<HtmlElementType> {
        if (suppress) {
            return this._domObject!;
        }
        if (this.built) {
            this.dispatchEvent(WidgetEvents.rebuild);
        }
        this.buildVisibility();//todo do we need this? remove???
        return this._domObject!;
    }

    public on(events: EventCallback<string, HtmlElementType, this> | string, handler?: EventHandler<string, HtmlElementType, this>): this {
        if (this._built) {
            // console.log("on called after element is built");
            // console.log(events);
            // console.log(this);
            // this.domObject.on(events);
        }
        console.assert(events != null);
        if (typeof events === "string") {
            console.assert(handler != null);
            this.callbacks.push(new Pair<string, EventHandler<string, HtmlElementType, this>>(events, handler!));
        } else {
            for (let i in events) {
                this.callbacks.push(new Pair<string, EventHandler<string, HtmlElementType, this>>(i, events[i]!));
                console.log(new Pair(i, events[i]));
            }
        }
        return this;
    }

    protected dispatchEvent(event: string, args?: any[], originalEvent: Event | null = null, ...acceptedTypes: string[]): this {
        if (!this.eventDisabled(event)) {
            for (let i of this.callbacks.filter(value => value.first == event || value.first == WidgetEvents.all || value.first in acceptedTypes)) {
                if (args != undefined && args.length > 0) {
                    i.second({type: event, target: this, originalEvent: originalEvent}, ...args);
                } else {
                    i.second({type: event, target: this, originalEvent: originalEvent});
                }
            }
        }
        return this;
    }

    /**
     * Using this function single parameterized works only if the child is a field (with the same name as {@link childName}) of this object
     * @param {string} childName
     * @param {Widget<WidgetEvents>} child
     * @return {this}
     * @protected
     */
    protected addChild<ChildHtmlElementType extends HTMLElement>(childName: string, child?: Widget<WidgetEvents, ChildHtmlElementType>): this {
        if (child === undefined) {
            child = this[childName as keyof this] as unknown as Widget<WidgetEvents, ChildHtmlElementType>;
        }
        if (childName.startsWith("_")) {
            childName = childName.replaceAll(new RegExp("^[_#]*", "g"), "");
        }
        this.children.set(childName, child!);
        child!.on(WidgetEvents.needVisibilityUpdate, (event) => {
            if (event.target.inheritVisibility) {
                event.target.setVisibility(this.visibility);
            }
        });
        return this;
    }

    protected disableEvent(event: string, disable: boolean = true): this {
        if (disable) {
            this._disabledEvents.add(event);
        } else {
            this._disabledEvents.delete(event);
        }
        return this;
    }

    public eventDisabled(event: string): boolean {
        return this._disabledEvents.has(event);
    }

    public hide(): this {
        return this.setVisibility(false);
    }

    /**
     * Loads the visibility into the domObj (if already built)
     * @private
     */
    private buildVisibility(): this {
        if (this._built) {
            if (this._visibility) {
                this._domObject!.addClass("show");
                if (!this.sizeSet && this._domObject!.filter(":visible").length > 0) {
                    // this.sizeSet = true;
                    // this.sizeSetObserver.disconnect();
                    // this.dispatchEvent("sizeSet");
                }
            } else {
                this._domObject!.removeClass("show");
            }
            this.dispatchEvent(WidgetEvents.visibilityChanged, [this._visibility]);
        }
        return this;
    }

    public setVisibility(visible: boolean): this {
        this._visibility = visible;
        this.buildVisibility();
        for (let i of this.children.values()) {
            if (i != null && i._inheritVisibility) {
                i.setVisibility(visible);
            }
        }
        return this;
    }

    /**
     * Copies all the important data from the other object to this object
     * @param {this} other the other object
     * @return {this} self
     */
    public copy(other: this): this {
        this.setInheritVisibility(other._inheritVisibility);
        this.setHidingIfNotShown(other._hidingIfNotShown);
        this.setVisibility(other._visibility);
        return this;
    }

    public show(): this {
        return this.setVisibility(true);
    }

    /**
     * Set whether this widget's visibility should always be set to the parent's visibility
     * @param value
     */
    public setInheritVisibility(value: boolean): this {
        let changed = this._inheritVisibility !== value;
        this._inheritVisibility = value;
        if (changed && this.built) {
            this.dispatchEvent(WidgetEvents.needVisibilityUpdate);
        }
        return this;
    }

    public setHidingIfNotShown(value: boolean): this {
        this._hidingIfNotShown = value;
        return this;
    }


    public get built(): boolean {
        return this._built && this._domObject !== undefined && this._domObject !== null;
    }

    public get domObject(): JQuery<HtmlElementType> {
        return this._domObject!;
    }

    public get visibility(): boolean {
        return this._visibility;
    }

    public set visibility(value: boolean) {
        this.setVisibility(value);
    }

    public get inheritVisibility(): boolean {
        return this._inheritVisibility;
    }

    public set inheritVisibility(value: boolean) {
        this.setInheritVisibility(value);
    }

    public get hidingIfNotShown(): boolean {
        return this._hidingIfNotShown;
    }

    public set hidingIfNotShown(value: boolean) {
        this.setHidingIfNotShown(value);
    }
}

export {_Widget, Widget, WidgetEvents, EventCallback, EventHandler};