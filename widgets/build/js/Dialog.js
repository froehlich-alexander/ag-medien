import { Widget, WidgetEvents } from "./Widget.js";
import { ButtonBox, FlexAlign, Top } from "./Widgets.js";
const DialogEvents = Object.assign(Object.assign({}, WidgetEvents), { accepted: "accepted", finished: "finished", rejected: "rejected" });
class Dialog extends Widget {
    constructor(htmlElementType) {
        super(htmlElementType);
        this.buttonBox = new ButtonBox();
        this.aTop = new Top();
        this.children.set("buttons", this.buttonBox);
        this.children.set("atop", this.aTop);
    }
    buildTop() {
        let top = this.aTop.build();
        this.domObject.append(top);
        return top;
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
    open() {
        this.opened = true;
        this.result = null;
        this.value = null;
        this.setVisibility(true);
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
