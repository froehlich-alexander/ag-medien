import { Widget } from "./Widget.js";
import { ButtonBox, ContentBox, FlexAlign, Top } from "./Widgets.js";
var DialogState;
(function (DialogState) {
    DialogState["accepted"] = "accepted";
    DialogState["rejected"] = "rejected";
    DialogState["closed"] = "closed";
    DialogState["open"] = "open";
    DialogState["notOpen"] = "notOpen";
})(DialogState || (DialogState = {}));
// const DialogEvents = {
//     ...WidgetEvents,
//     accepted: "accepted",
//     finished: "finished",
//     rejected: "rejected",
// };
//
// type DialogEvents = (typeof DialogEvents)[keyof typeof DialogEvents];
var DialogEvents;
(function (DialogEvents) {
    DialogEvents["accepted"] = "accepted";
    DialogEvents["finished"] = "finished";
    DialogEvents["rejected"] = "rejected";
})(DialogEvents || (DialogEvents = {}));
//
// interface _Dialog extends _WidgetBase {
//     accept(): this;
//
//     reject(): this;
//
//     open(): this;
// }
class Dialog extends Widget {
    constructor(htmlElementType, contentHtmlType) {
        super(htmlElementType);
        Object.defineProperty(this, "_state", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: DialogState.notOpen
        });
        // private _value: ValueType | undefined;
        Object.defineProperty(this, "_buttonBox", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new ButtonBox()
        });
        Object.defineProperty(this, "_aTop", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Top()
        });
        Object.defineProperty(this, "_aContent", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this._aContent = new ContentBox(contentHtmlType);
        this.addChild("buttons", this._buttonBox);
        this.addChild("atop", this._aTop);
        this.addChild("aContent", this._aContent);
    }
    buildTop() {
        return this._aTop.build()
            .appendTo(this.domObject);
    }
    buildContent() {
        return this._aContent.build()
            .appendTo(this.domObject);
    }
    buildButtons() {
        return this._buttonBox.build()
            .appendTo(this.domObject);
    }
    build(suppressCallback = false) {
        super.build(true)
            .addClass("dialog-widget");
        return this.buildCallback(suppressCallback);
    }
    enableTop(value) {
        this._aTop.setInheritVisibility(value);
        return this;
    }
    enableContent(value) {
        this._aContent.setInheritVisibility(value);
        return this;
    }
    enableButtons(value) {
        this._buttonBox.setInheritVisibility(value);
        return this;
    }
    addButton(button, mainAlign = FlexAlign.center, crossAlign = FlexAlign.center) {
        this._buttonBox.addButton(button, mainAlign, crossAlign);
        return this;
    }
    open() {
        this._state = DialogState.open;
        // this._value = value;
        this.setVisibility(true);
        this.rebuild();
        return this;
    }
    /**
     * You should save your result into {@link _value} in this method and return {@link _value}
     * @return {ValueType}
     * @protected
     */
    // protected abstract setValue(): ValueType;
    accept(...args) {
        this._state = DialogState.accepted;
        this.close();
        return (this.dispatchEvent(DialogEvents.accepted, ...args, undefined, DialogEvents.finished));
    }
    reject() {
        this._state = DialogState.rejected;
        this.close();
        return (this.dispatchEvent(DialogEvents.rejected, [], undefined, DialogEvents.finished));
    }
    /**
     * Accepts or rejects the dialog based on some computation which should be implemented in the subclass
     * @returns {this}
     */
    acceptOrReject() {
        return this.reject();
    }
    close() {
        if (this._state !== DialogState.accepted && this._state !== DialogState.rejected) {
            this._state = DialogState.closed;
        }
        this.setVisibility(false);
        return this;
    }
    destroy() {
        if (this._state === DialogState.open) {
            this.reject();
        }
        super.destroy();
        return this;
    }
    get topEnabled() {
        return this._aTop.inheritVisibility;
    }
    get contentEnabled() {
        return this._aContent.inheritVisibility;
    }
    get buttonsEnabled() {
        return this._buttonBox.inheritVisibility;
    }
    get state() {
        return this._state;
    }
    // public get value(): ValueType | undefined {
    //     return this._value;
    // }
    get buttonBox() {
        return this._buttonBox;
    }
    get aTop() {
        return this._aTop;
    }
    get aContent() {
        return this._aContent;
    }
}
export { Dialog, DialogEvents };
//# sourceMappingURL=Dialog.js.map