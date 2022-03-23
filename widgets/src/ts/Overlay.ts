import {Pair} from "./base.js";
import {Widget, WidgetEvents} from "./Widget.js";

class Overlay<T extends Widget<WidgetEvents>> extends Widget<WidgetEvents> {
    private readonly _widget: T;

    constructor(widget: T) {
        super();
        this._widget = widget;
        this._widget.on(undefined, new Pair(WidgetEvents.visibilityChanged, (event, value) => this.setVisibility(value)));
        // widget.children.set("widget", this._widget);
        // this.setInheritVisibility(true);
        // this.setVisibility(widget.visibility);
    }

    public build(suppressCallback: boolean = false): JQuery<HTMLElement> {
        super.build(true)
            .addClass("overlay-widget")
            .append(this._widget.build());
        this.buildCallback(suppressCallback);
        return this.domObject;
    }

    public get widget(): T {
        return this._widget;
    }
}

export {Overlay};