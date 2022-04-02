import { Pair } from "./base.js";
import "./imports.js";
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
        this.sizeSetObserver = new MutationObserver((mutationList) => {
            let target = $(mutationList[0].target);
            if (target.filter(":visible").length > 0) {
                if (this.sizeSet) {
                    this.sizeSetObserver.disconnect();
                    return;
                }
                this.sizeSet = true;
                this.dispatchEvent(WidgetEvents.sizeSet);
                this.sizeSetObserver.disconnect();
            }
        });
        this.on(undefined, new Pair(WidgetEvents.sizeSet, () => {
            this.dispatchEvent(WidgetEvents.needVisibilityUpdate);
            this.buildVisibility();
        }));
    }
    build(suppressCallback = false) {
        this._domObject = $(`<${this.htmlElementType}></${this.htmlElementType}>`)
            .addClass("widget")
            .addClass(this._hidingIfNotShown ? "hidingIfNotShown" : null)
            .on("click", () => this.dispatchEvent(WidgetEvents.clicked));
        this.buildCallback(suppressCallback);
        return this._domObject;
    }
    rebuild(suppressCallback = false) {
        this.sizeSetObserver.observe(this._domObject.get(0), {
            attributeFilter: ["style", "class"],
        });
        this.rebuildCallback(suppressCallback);
        return this.domObject;
    }
    tryRebuild(suppressCallback = false) {
        if (this.built) {
            this.rebuild(suppressCallback);
        }
        return this.domObject;
    }
    destroy() {
        console.assert(this._built);
        this._built = false;
        this._domObject.remove().off();
        this.setVisibility(false);
        return this;
    }
    buildCallback(suppress = false) {
        this._built = true;
        if (suppress) {
            return;
        }
        this.rebuild(true);
        this._built = true;
        this.dispatchEvent(WidgetEvents.build);
        this.buildVisibility();
    }
    rebuildCallback(suppress = false) {
        if (suppress) {
            return;
        }
        if (this._built == true) {
            this.dispatchEvent(WidgetEvents.rebuild);
        }
        this.buildVisibility();
    }
    on(events, event) {
        if (this._built) {
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
    on2(events, handler) {
        if (this._built) {
        }
        if (handler !== undefined) {
            this.callbacks.push(new Pair(events, handler));
        }
        else if (events != null) {
            for (let i in events) {
                this.callbacks.push(new Pair(i, events[i]));
                console.log(new Pair(i, events[i]));
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
    addChild(childName, child) {
        if (child === undefined) {
            child = this[childName];
        }
        this.children.set(childName, child);
        child.on(undefined, new Pair(WidgetEvents.needVisibilityUpdate, (event) => {
            if (event.target.inheritVisibility) {
                event.target.setVisibility(this.visibility);
            }
        }));
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
        let changed = this._inheritVisibility !== value;
        this._inheritVisibility = value;
        if (changed && this.built) {
            this.dispatchEvent(WidgetEvents.needVisibilityUpdate);
        }
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
}
export { Widget, WidgetEvents };
