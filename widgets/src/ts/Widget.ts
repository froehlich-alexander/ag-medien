import {Pair} from "./base.js";
// import {$, jQuery} from "../lib/jquery";
// import * as $ from "jquery";
import "./imports.js"

const WidgetEvents = {
    build: "build",
    all: "all",
    visibilityChanged: "visibilityChanged",
    sizeSet: "sizeSet",
    initialize: "initialize",
};

type WidgetEvents = (typeof WidgetEvents)[keyof typeof WidgetEvents];

type EventCallback<T extends WidgetEvents, T2 extends Widget<T>> = {
    [type in T]?: EventHandler<T, T2>;
};

type EventHandler<T extends WidgetEvents, T2 extends Widget<T>> = (event: { type: T, target: T2 }, ...args: any[]) => void;

abstract class _EventHandler {
    public abstract on(events: EventCallback<any, any>): this;

    protected abstract dispatchEvent(type: string, args?: any[], ...acceptedTypes: string[]): this;
}

interface _Widget {
    // appendTo(element: JQuery.Selector | JQuery<HTMLElement> | JQuery.htmlString | JQuery.TypeOrArray<Element | DocumentFragment>): this;

    build(suppressCallback: boolean): JQuery<HTMLElement>;

    destroy(): this;

    show(): this;

    hide(): this;

    setVisibility(visible: boolean): this;
}

abstract class Widget<EventType extends WidgetEvents> extends _EventHandler implements _Widget {
    private _built: boolean = false;
    private _domObject: JQuery<HTMLElement>;
    protected readonly children: Map<string, Widget<WidgetEvents> | null> = new Map();
    private readonly callbacks: Array<Pair<string, EventHandler<string, Widget<EventType>>>> = [];
    private readonly _disabledEvents: Set<string> = new Set();
    private _visibility: boolean = false;
    private _inheritVisibility: boolean = false;
    private _hidingIfNotShown: boolean = false;
    private sizeSet: boolean = false;
    private observer: MutationObserver;
    private _setWidth: boolean;
    private _setHeight: boolean;

    constructor() {
        super();
        this.observer = new MutationObserver((mutationList) => {
            let target = $(mutationList[0].target);
            if (target.filter(":visible").length > 0) {
                if (this.sizeSet) {
                    this.observer.disconnect();
                    return;
                }
                this.sizeSet = true;
                this.dispatchEvent(WidgetEvents.sizeSet);
                // if (target.filter(".button-box-widget").length > 0) {
                //     console.log("widget observer");
                //     console.log(target);
                //     console.log(mutationList[0]);
                // }
                this.observer.disconnect();
            }
        });
        this.on(undefined, new Pair(WidgetEvents.sizeSet, () => {this.buildVisibility();}));
    }

    /**
     * This method should call {@link buildCallback} before it returns
     */
    build(suppressCallback: boolean = false): JQuery<HTMLElement> {
        this._domObject = $("<div></div>")
            .addClass("widget")
            .addClass(this._hidingIfNotShown ? "hidingIfNotShown" : null);
        this.observer.observe(this._domObject.get()[0], {
            attributeFilter: ["style", "class"],
        });
        this._built = true;
        this.buildCallback(suppressCallback);
        return this._domObject;
    }

    public destroy(): this {
        console.assert(this._built);
        this._built = false;
        this._domObject.remove().off();
        this.setVisibility(false);
        return this;
    }

    protected buildCallback(suppress: boolean = false): void {
        if (suppress) {
            return;
        }
        this._built = true;
        this.dispatchEvent(WidgetEvents.build);
        this.buildVisibility();
    }

    public on(events?: EventCallback<EventType, Widget<EventType>>, event?: Pair<string, EventHandler<string, Widget<EventType>>>): this {
        if (this._built) {
            console.log("on called to jquery");
            console.log(events);
            // this.domObject.on(events);
        }
        if (event != null) {
            this.callbacks.push(event);
        }

        if (events != null) {
            for (let i in events) {
                this.callbacks.push(new Pair(i, events[i]));
            }
        }
        return this;
    }

    protected dispatchEvent(event: string, args?: any[], ...acceptedTypes: string[]): this {
        if (!this.eventDisabled(event)) {
            for (let i of this.callbacks.filter(value => value.first == event || value.first == WidgetEvents.all || value.first in acceptedTypes)) {
                if (args != undefined && args.length > 0) {
                    i.second({type: event, target: this}, ...args);
                } else {
                    i.second({type: event, target: this});
                }
            }
        }
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
                this._domObject.addClass("show");
                if (!this.sizeSet && this._domObject.filter(":visible").length > 0) {
                    // this.sizeSet = true;
                    // this.observer.disconnect();
                    // this.dispatchEvent("sizeSet");
                }
            } else {
                this._domObject.removeClass("show");
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
        this._inheritVisibility = value;
        return this;
    }

    public setHidingIfNotShown(value: boolean): this {
        this._hidingIfNotShown = value;
        return this;
    }


    public get built(): boolean {
        return this._built;
    }

    public get domObject(): JQuery<HTMLElement> {
        return this._domObject;
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

    public get setWidth(): boolean {
        return this._setWidth;
    }

    protected set setWidth(value: boolean) {
        this._setWidth = value;
    }

    public get setHeight(): boolean {
        return this._setHeight;
    }

    protected set setHeight(value: boolean) {
        this._setHeight = value;
    }
}

export {_Widget, Widget, WidgetEvents, EventCallback, EventHandler};