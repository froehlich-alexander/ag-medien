import { Widget, WidgetEvents } from "./Widget.js";
import { ButtonBox, FlexAlign } from "./Widgets.js";
const DialogEvents = Object.assign(Object.assign({}, WidgetEvents), { accepted: "accepted", finished: "finished", rejected: "rejected" });
class Dialog extends Widget {
    constructor() {
        super();
        this.buttonBox = new ButtonBox();
        this.children.set("buttons", this.buttonBox);
    }
    buildButtons() {
        let buttonBox = this.buttonBox.build();
        this.domObject.append(buttonBox);
        return buttonBox;
    }
    enableButtons(value) {
        this.buttonBox.setInheritVisibility(value);
        return this;
    }
    buttonsEnabled() {
        return this.buttonBox.inheritVisibility;
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
        this.setVisibility(true);
        return this;
    }
    accept() {
        this.result = DialogEvents.accepted;
        this.close();
        return (this.dispatchEvent(DialogEvents.accepted, [], DialogEvents.finished));
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
