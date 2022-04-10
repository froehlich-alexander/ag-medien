import { Pair } from "./base.js";
// import {$, jQuery} from "../lib/jquery";
// import * as $ from "jquery";
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
        Object.defineProperty(this, "_built", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "_domObject", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "children", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "callbacks", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "_disabledEvents", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Set()
        });
        Object.defineProperty(this, "_visibility", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "_inheritVisibility", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "_hidingIfNotShown", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "sizeSet", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "sizeSetObserver", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "htmlElementType", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "div"
        });
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
        this.on(undefined, new Pair(WidgetEvents.sizeSet, () => {
            this.dispatchEvent(WidgetEvents.needVisibilityUpdate);
            this.buildVisibility();
        }));
    }
    /**
     * This method should call {@link buildCallback} before it returns
     */
    build(suppressCallback = false) {
        this._domObject = $(`<${this.htmlElementType}></${this.htmlElementType}>`)
            .addClass("widget")
            .toggleClass("hidingIfNotShown", this._hidingIfNotShown)
            .on("click", () => this.dispatchEvent(WidgetEvents.clicked));
        // this.sizeSetObserver.observe(this._domObject.get()[0], {
        //     attributeFilter: ["style", "class"],
        // });
        // this._built = true;
        return this.buildCallback(suppressCallback);
    }
    rebuild(suppressCallback = false) {
        this.sizeSetObserver.observe(this._domObject.get(0), {
            attributeFilter: ["style", "class"],
        });
        for (let i of this.children.values()) {
            i?.tryRebuild();
        }
        return this.rebuildCallback(suppressCallback);
    }
    tryRebuild(suppressCallback = false) {
        if (this.built) {
            this.rebuild(suppressCallback);
        }
        return this._domObject;
    }
    destroy() {
        console.assert(this.built);
        this._built = false;
        this._domObject.remove().off();
        this.setVisibility(false);
        return this;
    }
    buildCallback(suppress = false) {
        this._built = true;
        if (suppress) {
            return this._domObject;
        }
        this.rebuild(true);
        this._built = true;
        this.dispatchEvent(WidgetEvents.build);
        this.buildVisibility();
        return this.domObject;
    }
    rebuildCallback(suppress = false) {
        if (suppress) {
            return this._domObject;
        }
        if (this.built) {
            this.dispatchEvent(WidgetEvents.rebuild);
        }
        this.buildVisibility(); //todo do we need this? remove???
        return this._domObject;
    }
    on(events, event) {
        if (this._built) {
            // console.log("on called after element is built");
            // console.log(events);
            // console.log(this);
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
    on2(events, handler) {
        if (this._built) {
            // console.log("on called after element is built");
            // console.log(events);
            // console.log(this);
            // this.domObject.on(events);
        }
        if (handler !== undefined && typeof events === "string") {
            this.callbacks.push(new Pair(events, handler));
        }
        else if (events != null) {
            for (let i in events) {
                // @ts-ignore
                this.callbacks.push(new Pair(i, events[i]));
                // @ts-ignore
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
    /**
     * Using this function single parameterized works only if the child is a field (with the same name as {@link childName}) of this object
     * @param {string} childName
     * @param {Widget<WidgetEvents>} child
     * @return {this}
     * @protected
     */
    addChild(childName, child) {
        if (child === undefined) {
            // @ts-ignore
            child = this[childName];
        }
        this.children.set(childName, child);
        child.on2(WidgetEvents.needVisibilityUpdate, (event) => {
            if (event.target.inheritVisibility) {
                event.target.setVisibility(this.visibility);
            }
        });
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
    /**
     * Loads the visibility into the domObj (if already built)
     * @private
     */
    buildVisibility() {
        if (this._built) {
            if (this._visibility) {
                this._domObject.addClass("show");
                if (!this.sizeSet && this._domObject.filter(":visible").length > 0) {
                    // this.sizeSet = true;
                    // this.sizeSetObserver.disconnect();
                    // this.dispatchEvent("sizeSet");
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
    /**
     * Copies all the important data from the other object to this object
     * @param {this} other the other object
     * @return {this} self
     */
    copy(other) {
        this.setInheritVisibility(other._inheritVisibility);
        this.setHidingIfNotShown(other._hidingIfNotShown);
        this.setVisibility(other._visibility);
        return this;
    }
    show() {
        return this.setVisibility(true);
    }
    /**
     * Set whether this widget's visibility should always be set to the parent's visibility
     * @param value
     */
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
        return this._built && this._domObject !== undefined && this._domObject !== null;
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
//# sourceMappingURL=Widget.js.map