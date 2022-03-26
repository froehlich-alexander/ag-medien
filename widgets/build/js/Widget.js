import { Pair } from "./base.js";
import "./imports.js";
const WidgetEvents = {
    build: "build",
    all: "all",
    visibilityChanged: "visibilityChanged",
    sizeSet: "sizeSet",
    initialize: "initialize",
};
class _EventHandler {
}
class Widget extends _EventHandler {
    constructor(htmlElementType) {
        super();
        this._built = false;
        this.children = new Map();
        this.callbacks = [];
        this._disabledEvents = new Set();
        this._visibility = false;
        this._inheritVisibility = false;
        this._hidingIfNotShown = false;
        this.sizeSet = false;
        this.htmlElementType = "div";
        if (htmlElementType != null) {
            this.htmlElementType = htmlElementType;
        }
        this.observer = new MutationObserver((mutationList) => {
            let target = $(mutationList[0].target);
            if (target.filter(":visible").length > 0) {
                if (this.sizeSet) {
                    this.observer.disconnect();
                    return;
                }
                this.sizeSet = true;
                this.dispatchEvent(WidgetEvents.sizeSet);
                this.observer.disconnect();
            }
        });
        this.on(undefined, new Pair(WidgetEvents.sizeSet, () => {
            this.buildVisibility();
        }));
    }
    build(suppressCallback = false) {
        this._domObject = $(`<${this.htmlElementType}></${this.htmlElementType}>`)
            .addClass("widget")
            .addClass(this._hidingIfNotShown ? "hidingIfNotShown" : null);
        this.observer.observe(this._domObject.get()[0], {
            attributeFilter: ["style", "class"],
        });
        this._built = true;
        this.buildCallback(suppressCallback);
        return this._domObject;
    }
    destroy() {
        console.assert(this._built);
        this._built = false;
        this._domObject.remove().off();
        this.setVisibility(false);
        return this;
    }
    buildCallback(suppress = false) {
        if (suppress) {
            return;
        }
        this._built = true;
        this.dispatchEvent(WidgetEvents.build);
        this.buildVisibility();
    }
    on(events, event) {
        if (this._built) {
            console.log("on called after element is built");
            console.log(events);
            console.log(this);
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
    dispatchEvent(event, args, ...acceptedTypes) {
        if (!this.eventDisabled(event)) {
            for (let i of this.callbacks.filter(value => value.first == event || value.first == WidgetEvents.all || value.first in acceptedTypes)) {
                if (args != undefined && args.length > 0) {
                    i.second({ type: event, target: this }, ...args);
                }
                else {
                    i.second({ type: event, target: this });
                }
            }
        }
        return this;
    }
    disableEvent(event, disable = true) {
        if (disable) {
            this._disabledEvents.add(event);
        }
        else {
            this._disabledEvents.delete(event);
        }
        return this;
    }
    eventDisabled(event) {
        return this._disabledEvents.has(event);
    }
    hide() {
        return this.setVisibility(false);
    }
    buildVisibility() {
        if (this._built) {
            if (this._visibility) {
                this._domObject.addClass("show");
                if (!this.sizeSet && this._domObject.filter(":visible").length > 0) {
                }
            }
            else {
                this._domObject.removeClass("show");
            }
            this.dispatchEvent(WidgetEvents.visibilityChanged, [this._visibility]);
        }
        return this;
    }
    setVisibility(visible) {
        this._visibility = visible;
        this.buildVisibility();
        for (let i of this.children.values()) {
            if (i != null && i._inheritVisibility) {
                i.setVisibility(visible);
            }
        }
        return this;
    }
    copy(other) {
        this.setInheritVisibility(other._inheritVisibility);
        this.setHidingIfNotShown(other._hidingIfNotShown);
        this.setVisibility(other._visibility);
        return this;
    }
    show() {
        return this.setVisibility(true);
    }
    setInheritVisibility(value) {
        this._inheritVisibility = value;
        return this;
    }
    setHidingIfNotShown(value) {
        this._hidingIfNotShown = value;
        return this;
    }
    get built() {
        return this._built;
    }
    get domObject() {
        return this._domObject;
    }
    get visibility() {
        return this._visibility;
    }
    set visibility(value) {
        this.setVisibility(value);
    }
    get inheritVisibility() {
        return this._inheritVisibility;
    }
    set inheritVisibility(value) {
        this.setInheritVisibility(value);
    }
    get hidingIfNotShown() {
        return this._hidingIfNotShown;
    }
    set hidingIfNotShown(value) {
        this.setHidingIfNotShown(value);
    }
    get setWidth() {
        return this._setWidth;
    }
    set setWidth(value) {
        this._setWidth = value;
    }
    get setHeight() {
        return this._setHeight;
    }
    set setHeight(value) {
        this._setHeight = value;
    }
}
export { Widget, WidgetEvents };
