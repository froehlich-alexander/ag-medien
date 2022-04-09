import { Widget, WidgetEvents } from "./Widget.js";
import { ButtonBox, ContentBox, FlexAlign, Top } from "./Widgets.js";
const DialogEvents = {
    ...WidgetEvents,
    accepted: "accepted",
    finished: "finished",
    rejected: "rejected",
};
class Dialog extends Widget {
    constructor(htmlElementType, contentHtmlType) {
        super(htmlElementType);
        Object.defineProperty(this, "result", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "value", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "opened", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "buttonBox", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new ButtonBox()
        });
        Object.defineProperty(this, "aTop", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Top()
        });
        Object.defineProperty(this, "aContent", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.aContent = new ContentBox(contentHtmlType);
        this.addChild("buttons", this.buttonBox);
        this.addChild("atop", this.aTop);
        this.addChild("aContent", this.aContent);
        // this.buttonBox.setSpacing("2rem", "2rem", "1rem");
    }
    buildTop() {
        let top = this.aTop.build();
        this.domObject.append(top);
        return top;
    }
    buildContent() {
        let content = this.aContent.build();
        this.domObject.append(content);
        return content;
    }
    buildButtons() {
        let buttonBox = this.buttonBox.build();
        this.domObject.append(buttonBox);
        return buttonBox;
    }
    build(suppressCallback = false) {
        super.build(true)
            .addClass("dialog-widget");
        this.buildCallback(suppressCallback);
        return this.domObject;
    }
    enableButtons(value) {
        this.buttonBox.setInheritVisibility(value);
        return this;
    }
    buttonsEnabled() {
        return this.buttonBox.inheritVisibility;
    }
    enableTop(value) {
        this.aTop.setInheritVisibility(value);
        return this;
    }
    topEnabled() {
        return this.aTop.inheritVisibility;
    }
    enableContent(value) {
        this.aContent.setInheritVisibility(value);
        return this;
    }
    contentEnabled() {
        return this.aContent.inheritVisibility;
    }
    addButton(button, mainAlign = FlexAlign.center, crossAlign = FlexAlign.center) {
        this.buttonBox.addButton(button, mainAlign, crossAlign);
        return this;
    }
    getResult() {
        return this.result;
    }
    isOpened() {
        return this.opened;
    }
    open(value) {
        this.opened = true;
        this.result = null;
        this.value = value;
        this.setVisibility(true);
        this.rebuild();
        return this;
    }
    accept() {
        this.result = DialogEvents.accepted;
        this.close();
        return (this.dispatchEvent(DialogEvents.accepted, [this.setValue()], DialogEvents.finished));
    }
    reject() {
        this.result = DialogEvents.rejected;
        this.close();
        return (this.dispatchEvent(DialogEvents.rejected, [], DialogEvents.finished));
    }
    close() {
        this.opened = false;
        this.setVisibility(false);
        return this;
    }
    destroy() {
        super.destroy();
        if (this.opened) {
            this.reject();
        }
        return this;
    }
}
export { Dialog, DialogEvents };
//# sourceMappingURL=Dialog.js.map