import { Widget, WidgetEvents } from './Widget.js';
// import * as $ from 'jquery';
import { Button, FlexAlign, Icon, Top } from "./Widgets.js";
import { Dialog, DialogEvents } from "./Dialog.js";
export var a = "fdf";
const SelectMenuItemEvents = {
    ...WidgetEvents,
    selected: "selected",
    unselected: "unselected",
};
const SelectMenuEvents = {
    ...DialogEvents,
    checkStateChanged: "checkStateChanged",
};
export class SelectMenuItem extends Widget {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "label", {
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
        Object.defineProperty(this, "selected", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "checkbox", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "icon", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Icon()
        });
    }
    getIcon() {
        return this.icon;
    }
    setIcon(icon) {
        //this.item should never be null
        if (this.icon != null) {
            this.icon.set(icon.value, icon.type).show().tryRebuild();
        }
        else {
            this.icon = icon.show();
        }
        this.icon.tryRebuild();
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
        //set this.value if not already set
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
            //do this only if the state has changed
            this.dispatchEvent(value ? SelectMenuItemEvents.selected : SelectMenuItemEvents.unselected);
            // if (value != this.selected) {
            //     for (let i of this.callbacks.filter(value1 => value1.key == (value ? SelectMenuItemEvents.selected : SelectMenuItemEvents.unselected) || value1.key == SelectMenuItemEvents.all)) {
            //         i.value({
            //             type: value ? SelectMenuItemEvents.selected : SelectMenuItemEvents.unselected,
            //             target: this
            //         });
            //     }
            // }
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
    /**
     * Prefer setting the item policy in {@link SelectMenu}
     * @param value
     */
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
            .toggleClass("selected", this.selected)
            .append(this.icon.build())
            .append($("<div></div>")
            .addClass("text")
            .text(this.label))
            .append($("<div></div>")
            .addClass("material-icons checkbox")
            .toggleClass("show", this.checkbox)
            .text(this.selected ? "check_box" : "check_box_outline_blank"))
            .on("click", () => this.setSelected(!this.selected));
        this.buildCallback(suppressCallback);
        return this.domObject;
    }
}
export class SelectMenu extends Dialog {
    constructor(acceptButton = Button.Ok(), rejectButton = Button.Cancel()) {
        super();
        Object.defineProperty(this, "items", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "title", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "minSelected", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 1
        });
        Object.defineProperty(this, "maxSelected", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 1
        });
        Object.defineProperty(this, "values", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "top", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        if (acceptButton != null) {
            this.addButton(acceptButton.on("clicked", () => this.accept()), FlexAlign.start);
        }
        if (rejectButton != null) {
            this.addButton(rejectButton.on("clicked", () => this.reject()), FlexAlign.end);
        }
        this.top = new Top().setInheritVisibility(true)
            .setIcon(Icon.Close().on("clicked", () => this.reject())
            .setClickable(true));
        this.children.set("top", this.top);
        // this.buttonBox.setSpacing(1, 10, 0);
        // this.on({
        //     "sizeSet": () => {
        //         console.log("select sizeSet")
        //         //set content height
        //         let contentHeight: number = 0;
        //         for (let i of this.items) {
        //             contentHeight += i.domObject.outerHeight(true);
        //         }
        //         this.domObject.find(".content").height(contentHeight);
        //     }
        // });
        this.on("sizeSet", () => this.domObject.find(".content").css("max-height", "calc(100% - "
            + this.domObject.find(".bottom").outerHeight(true) + "px - " + this.domObject.find(".top").outerHeight(true) + "px)"));
    }
    build() {
        super.build(true)
            .addClass("select-menu");
        this.domObject.append(this.top.build().addClass("top"));
        //content
        let content = $("<div/>")
            .addClass("content")
            .appendTo(this.domObject);
        for (let i of this.items) {
            i.on("selected", (event) => 
            // for (let i of this.callbacks.filter(value => value.key == SelectMenuEvents.checkStateChanged || value.key == SelectMenuEvents.all)) {
            //     i.value({type: i.key, target: this}, event.type == SelectMenuItemEvents.selected, event.target);
            // }
            this.dispatchEvent(SelectMenuEvents.checkStateChanged, [event.type == SelectMenuItemEvents.selected, event.target]))
                .on("unselected", (event) => 
            // for (let i of this.callbacks.filter(value => value.key == SelectMenuEvents.checkStateChanged || value.key == SelectMenuEvents.all)) {
            //     i.value({type: i.key, target: this}, event.type == SelectMenuItemEvents.selected, event.target);
            // }
            this.dispatchEvent(SelectMenuEvents.checkStateChanged, [event.type == SelectMenuItemEvents.selected, event.target]))
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
    // public static default(): SelectMenu {
    //     return new SelectMenu().enableButtons(true);
    // }
    // public getValues(): string[] {
    //     console.assert(this.built && this.getResult() != null && this.values != null);
    //     return this.values;
    // }
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
//# sourceMappingURL=SelectMenu.js.map