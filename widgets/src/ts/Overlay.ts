import {Dialog} from "./Dialog.js";
import {Widget, WidgetBase, WidgetEvents} from "./Widget.js";

enum OverlayEvents {
}

class Overlay<T extends WidgetBase<WidgetEvents, T2>, T2 extends HTMLElement = HTMLDivElement> extends Widget<WidgetEvents, HTMLDivElement> {
    private readonly _widget: T;

    constructor(widget: T) {
        super();
        this._widget = widget;
        this._widget.on(WidgetEvents.visibilityChanged, (event, value) => this.visibility !== this._widget.visibility ? this.setVisibility(value) : this);
        this.children.set("widget", this._widget);
        widget.setInheritVisibility(true);
        this.setVisibility(widget.visibility);
        if (widget instanceof Dialog) {
            this._widget.on(WidgetEvents.clicked, (event) => event.originalEvent!.stopPropagation());
            this.on(WidgetEvents.clicked, () => widget.acceptOrReject());
        }
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