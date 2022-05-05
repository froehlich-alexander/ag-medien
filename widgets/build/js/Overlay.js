import { Dialog } from "./Dialog.js";
import { Widget, WidgetEvents } from "./Widget.js";
var OverlayEvents;
(function (OverlayEvents) {
})(OverlayEvents || (OverlayEvents = {}));
class Overlay extends Widget {
    constructor(widget) {
        super();
        Object.defineProperty(this, "_widget", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this._widget = widget;
        this._widget.on(WidgetEvents.visibilityChanged, (event, value) => this.visibility !== this._widget.visibility ? this.setVisibility(value) : this);
        this.children.set("widget", this._widget);
        widget.setInheritVisibility(true);
        this.setVisibility(widget.visibility);
        if (widget instanceof Dialog) {
            this._widget.on(WidgetEvents.clicked, (event) => event.originalEvent.stopPropagation());
            this.on(WidgetEvents.clicked, () => widget.acceptOrReject());
        }
    }
    build(suppressCallback = false) {
        super.build(true)
            .addClass("overlay-widget")
            .append(this._widget.build());
        return this.buildCallback(suppressCallback);
    }
    rebuild(suppressCallback = false) {
        super.rebuild(true);
        this._widget.rebuild();
        return this.rebuildCallback(suppressCallback);
    }
    get widget() {
        return this._widget;
    }
}
export { Overlay };
//# sourceMappingURL=Overlay.js.map