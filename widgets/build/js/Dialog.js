import { Widget, WidgetEvents } from "./Widget.js";
import { ButtonBox, ContentBox, FlexAlign, Top } from "./Widgets.js";
const DialogEvents = {
    ...WidgetEvents,
    accepted: "accepted",
    finished: "finished",
    rejected: "rejected",
};
var DialogState;
(function (DialogState) {
    DialogState["accepted"] = "accepted";
    DialogState["rejected"] = "rejected";
    DialogState["closed"] = "closed";
    DialogState["open"] = "open";
    DialogState["notOpen"] = "notOpen";
})(DialogState || (DialogState = {}));
class Dialog extends Widget {
    constructor(htmlElementType, contentHtmlType) {
        super(htmlElementType);
        Object.defineProperty(this, "_state", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: DialogState.notOpen
        });
        Object.defineProperty(this, "_value", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
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
        // this.buttonBox.setSpacing("2rem", "2rem", "1rem");
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
    open(value) {
        this._state = DialogState.open;
        this._value = value;
        this.setVisibility(true);
        this.rebuild();
        return this;
    }
    accept() {
        this._state = DialogState.accepted;
        this.close();
        return (this.dispatchEvent(DialogEvents.accepted, [this.setValue()], DialogEvents.finished));
    }
    reject() {
        this._state = DialogState.rejected;
        this.close();
        return (this.dispatchEvent(DialogEvents.rejected, [], DialogEvents.finished));
    }
    close() {
        if (this._state !== DialogState.accepted && this._state !== DialogState.rejected) {
            this._state = DialogState.closed;
        }
        this.setVisibility(false);
        return this;
    }
    destroy() {
        super.destroy();
        if (this._state === DialogState.open) {
            this.reject();
        }
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
    get value() {
        return this._value;
    }
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