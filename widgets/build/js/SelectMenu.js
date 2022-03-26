import { Widget, WidgetEvents } from './Widget.js';
import { Button, FlexAlign, Icon, Top } from "./Widgets.js";
import { Dialog, DialogEvents } from "./Dialog.js";
export var a = "fdf";
const SelectMenuItemEvents = Object.assign(Object.assign({}, WidgetEvents), { selected: "selected", unselected: "unselected" });
const SelectMenuEvents = Object.assign(Object.assign({}, DialogEvents), { checkStateChanged: "checkStateChanged" });
export class SelectMenuItem extends Widget {
    constructor() {
        super(...arguments);
        this.selected = false;
        this.icon = new Icon();
    }
    getIcon() {
        return this.icon;
    }
    setIcon(icon) {
        if (this.icon != null) {
            this.icon.set(icon.getValue(), icon.getType()).show();
        }
        else {
            this.icon = icon.show();
        }
        this.icon.build(false);
        return this;
    }
    getLabel() {
        return this.label;
    }
    setLabel(label) {
        if (this.built && this.label != label) {
            this.domObject
                .find(".text")
                .text(label);
        }
        this.label = label;
        if (this.value == null) {
            let value;
            value = label;
            if (typeof value == "string") {
                this.value = value;
            }
        }
        return this;
    }
    getValue() {
        return this.value;
    }
    setValue(value) {
        this.value = value;
        return this;
    }
    isSelected() {
        return this.selected;
    }
    setSelected(value) {
        if (this.built) {
            if (value) {
                this.domObject.addClass("selected");
                this.domObject.find(".checkbox")
                    .text("check_box");
            }
            else {
                this.domObject.removeClass("selected");
                this.domObject.find(".checkbox")
                    .text("check_box_outline_blank");
            }
            this.dispatchEvent(value ? SelectMenuItemEvents.selected : SelectMenuItemEvents.unselected);
        }
        this.selected = value;
        return this;
    }
    setVisibility(visible) {
        if (this.icon != null) {
            this.icon.setVisibility(visible);
        }
        return super.setVisibility(visible);
    }
    hasCheckbox() {
        return this.checkbox;
    }
    setCheckbox(value) {
        if (this.built && this.checkbox != value) {
            this.domObject.toggleClass("checkbox");
        }
        this.checkbox = value;
        return this;
    }
    build(suppressCallback = false) {
        super.build(true)
            .addClass("item")
            .addClass(this.selected ? "selected" : null)
            .append(this.icon.build())
            .append($("<div></div>")
            .addClass("text")
            .text(this.label))
            .append($("<div></div>")
            .addClass("material-icons checkbox")
            .addClass(this.checkbox ? "show" : null)
            .text(this.selected ? "check_box" : "check_box_outline_blank"))
            .on({
            click: () => {
                this.setSelected(!this.selected);
            }
        });
        this.buildCallback(suppressCallback);
        return this.domObject;
    }
}
export class SelectMenu extends Dialog {
    constructor(acceptButton = Button.Ok(), rejectButton = Button.Cancel()) {
        super();
        this.items = [];
        this.minSelected = 1;
        this.maxSelected = 1;
        if (acceptButton != null) {
            this.addButton(acceptButton.on({ "clicked": () => this.accept() }), FlexAlign.start);
        }
        if (rejectButton != null) {
            this.addButton(rejectButton.on({ "clicked": () => this.reject() }), FlexAlign.end);
        }
        this.top = new Top().setInheritVisibility(true)
            .setIcon(Icon.Close().on({
            clicked: () => this.reject()
        }).setClickable(true));
        this.children.set("top", this.top);
        this.on({
            "sizeSet": () => {
                this.domObject.find(".content").css("max-height", "calc(100% - "
                    + this.domObject.find(".bottom").outerHeight(true) + "px - " + this.domObject.find(".top").outerHeight(true) + "px)");
            }
        });
    }
    build() {
        super.build(true)
            .addClass("select-menu");
        this.domObject.append(this.top.build().addClass("top"));
        let content = $("<div/>")
            .addClass("content")
            .appendTo(this.domObject);
        for (let i of this.items) {
            i.on({
                selected: (event) => {
                    this.dispatchEvent(SelectMenuEvents.checkStateChanged, [event.type == SelectMenuItemEvents.selected, event.target]);
                },
                unselected: (event) => {
                    this.dispatchEvent(SelectMenuEvents.checkStateChanged, [event.type == SelectMenuItemEvents.selected, event.target]);
                },
            })
                .build()
                .appendTo(content);
        }
        this.buildButtons();
        this.buildCallback();
        return this.domObject;
    }
    buildButtons() {
        return super.buildButtons()
            .addClass("bottom");
    }
    setValue() {
        this.value = this.items.filter(value => value.isSelected()).map(value => value.getValue());
        return this.value;
    }
    setVisibility(visible) {
        for (let i of this.items) {
            i.setVisibility(visible);
        }
        return super.setVisibility(visible);
    }
    itemPolicy(checkbox) {
        if (checkbox != undefined) {
            for (let i of this.items) {
                i.setCheckbox(checkbox);
            }
        }
        return this;
    }
    getItems() {
        return this.items;
    }
    addItems(...items) {
        for (let item of items) {
            this.children.set("item" + this.items.push(item), item);
        }
        return this;
    }
    getTitle() {
        return this.title;
    }
    setTitle(value) {
        this.title = value;
        this.top.setLabel(value);
        return this;
    }
    getMinSelected() {
        return this.minSelected;
    }
    setMinSelected(value) {
        this.minSelected = value;
        return this;
    }
    getMaxSelected() {
        return this.maxSelected;
    }
    setMaxSelected(value) {
        this.maxSelected = value;
        return this;
    }
}
