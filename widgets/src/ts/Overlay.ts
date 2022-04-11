import {Pair} from "./base.js";
import {Widget, WidgetEvents} from "./Widget.js";

class Overlay<T extends Widget<WidgetEvents>> extends Widget<WidgetEvents, HTMLDivElement> {
    private readonly _widget: T;

    constructor(widget: T) {
        super();
        this._widget = widget;
        this._widget.on(WidgetEvents.visibilityChanged, (event, value) => this.setVisibility(value));
        // widget.children.set("widget", this._widget);
        // this.setInheritVisibility(true);
        // this.setVisibility(widget.visibility);
    }

    public override build(suppressCallback: boolean = false): JQuery<HTMLDivElement> {
        super.build(true)
            .addClass("overlay-widget")
            .append(this._widget.build());
        return this.buildCallback(suppressCallback);
    }

    public override rebuild(suppressCallback: boolean = false): JQuery<HTMLDivElement> {
        super.rebuild(true);
        this._widget.rebuild();

        return this.rebuildCallback(suppressCallback);
    }

    public get widget(): T {
        return this._widget;
    }
}

export {Overlay};