import {Widget, WidgetEvents} from './Widget.js';
// import * as $ from 'jquery';
import {Button, FlexAlign, Icon, Top} from "./Widgets.js";
import {Dialog, DialogEvents} from "./Dialog.js";

export var a: string = "fdf";

const SelectMenuItemEvents = {
    ...WidgetEvents,
    selected: "selected",
    unselected: "unselected",
};
const SelectMenuEvents = {
    ...DialogEvents,
    checkStateChanged: "checkStateChanged",
};
type SelectMenuItemEvents = (typeof SelectMenuItemEvents)[keyof typeof SelectMenuItemEvents];
type SelectMenuEvents = (typeof SelectMenuEvents)[keyof typeof SelectMenuEvents];


export class SelectMenuItem<T> extends Widget<SelectMenuItemEvents> {
    private label: string;
    private value: T;
    private selected: boolean = false;
    private checkbox: boolean;
    private icon: Icon = new Icon();

    getIcon(): Icon {
        return this.icon;
    }

    setIcon(icon: Icon): this {
        //this.item should never be null
        if (this.icon != null) {
            this.icon.set(icon.getValue(), icon.getType()).show();
        } else {
            this.icon = (<Icon>icon.show());
        }
        this.icon.build(false);
        return this;
    }

    getLabel(): string {
        return this.label;
    }

    setLabel(label: string): this {
        if (this.built && this.label != label) {
            this.domObject
                .find(".text")
                .text(label);
        }
        this.label = label;
        //set this.value if not already set
        if (this.value == null) {
            let value;
            value = (<T><unknown>label);
            if (typeof value == "string") {
                this.value = value;
            }
        }
        return this;
    }

    getValue(): T {
        return this.value;
    }

    setValue(value: T): this {
        this.value = value;
        return this;
    }

    isSelected(): boolean {
        return this.selected;
    }

    setSelected(value: boolean): this {
        if (this.built) {
            if (value) {
                this.domObject.addClass("selected");
                this.domObject.find(".checkbox")
                    .text("check_box");
            } else {
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

    setVisibility(visible: boolean): this {
        if (this.icon != null) {
            this.icon.setVisibility(visible);
        }
        return super.setVisibility(visible);
    }

    hasCheckbox(): boolean {
        return this.checkbox;
    }

    /**
     * Prefer setting the item policy in {@link SelectMenu}
     * @param value
     */
    setCheckbox(value: boolean): this {
        if (this.built && this.checkbox != value) {
            this.domObject.toggleClass("checkbox");
        }
        this.checkbox = value;
        return this;
    }

    public build(suppressCallback: boolean = false): JQuery<HTMLElement> {
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

export class SelectMenu extends Dialog<SelectMenuEvents> {
    private items: Array<SelectMenuItem<string>> = [];
    private title: string;
    private minSelected: number = 1;
    private maxSelected: number = 1;
    private values: string[];
    private readonly top: Top;

    constructor() {
        super();
        this.addButton(Button.Ok().on({"clicked": () => this.accept()}), FlexAlign.start);
        this.addButton(Button.Cancel().on({"clicked": () => this.reject()}), FlexAlign.end);
        this.top = new Top().setInheritVisibility(true)
            .setIcon(Icon.Close().on({
                clicked: () => this.reject()
            }).setClickable(true));
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
        this.on({
            "sizeSet": () => {
                this.domObject.find(".content").css("max-height", "calc(100% - "
                    + this.domObject.find(".bottom").outerHeight(true) + "px - " + this.domObject.find(".top").outerHeight(true) + "px)");
            }
        });
    }

    build(): JQuery<HTMLElement> {
        super.build(true)
            .addClass("select-menu");

        //top
        // $("<div/>")
        //     .addClass("top")
        //     .append(
        //         $("<div></div>")
        //             .addClass("title")
        //             .text(this.title))
        //     .append(
        //         $("<div></div>")
        //             .addClass("material-icons")
        //             .addClass("close-icon")
        //             .text("close")
        //             .on({
        //                 click: () => {
        //                     this.reject();
        //                 },
        //             }))
        //     .appendTo(this.domObject);
        this.domObject.append(this.top.build().addClass("top"));

        //content
        let content = $("<div/>")
            .addClass("content")
            .appendTo(this.domObject);
        for (let i of this.items) {
            i.on({
                selected: (event) => {
                    // for (let i of this.callbacks.filter(value => value.key == SelectMenuEvents.checkStateChanged || value.key == SelectMenuEvents.all)) {
                    //     i.value({type: i.key, target: this}, event.type == SelectMenuItemEvents.selected, event.target);
                    // }
                    this.dispatchEvent(SelectMenuEvents.checkStateChanged, [event.type == SelectMenuItemEvents.selected, event.target]);
                },
                unselected: (event) => {
                    // for (let i of this.callbacks.filter(value => value.key == SelectMenuEvents.checkStateChanged || value.key == SelectMenuEvents.all)) {
                    //     i.value({type: i.key, target: this}, event.type == SelectMenuItemEvents.selected, event.target);
                    // }
                    this.dispatchEvent(SelectMenuEvents.checkStateChanged, [event.type == SelectMenuItemEvents.selected, event.target]);
                },
            })
                .build()
                .appendTo(content);
        }

        this.buildButtons();
        //bottom
        /*
        $("<div></div>")
            .addClass("bottom")
            .append(
                $("<div></div>")
                    .addClass("button-widget")
                    .addClass("reject-button")
                    .append($("<div></div>")
                        .addClass("material-icons icon")
                        .text("cancel"))
                    .append($("<div></div>")
                        .text("Cancel")
                        .addClass("text"))
                    .on({
                        click: () => {
                            this.reject();
                        },
                    })
            )
            .append($("<div></div>")
                .addClass("align-spacer"))
            .append(
                $("<div></div>")
                    .addClass("button-widget")
                    .addClass("accept-button")
                    .append($("<div></div>")
                        .addClass("material-icons icon")
                        .text("done"))
                    .append($("<div></div>")
                        .text("Ok")
                        .addClass("text"))
                    .on({
                        click: () => {
                            this.accept();
                        },
                    })
            )
            .appendTo(this.domObject);
         */
        this.buildCallback();
        return this.domObject;
    }

    protected buildButtons(): JQuery<HTMLElement> {
        return super.buildButtons()
            .addClass("bottom");
    }

    // public static default(): SelectMenu {
    //     return new SelectMenu().enableButtons(true);
    // }

    public getValues(): string[] {
        console.assert(this.built && this.getResult() != null && this.values != null);
        return this.values;
    }

    open(): this {
        this.values = null;
        return super.open();
    }

    protected close(): this {
        this.values = this.items.filter(value => value.isSelected()).map(value => value.getValue());
        return super.close();
    }

    setVisibility(visible: boolean): this {
        for (let i of this.items) {
            i.setVisibility(visible);
        }
        return super.setVisibility(visible);
    }

    itemPolicy(checkbox?: boolean): this {
        if (checkbox != undefined) {
            for (let i of this.items) {
                i.setCheckbox(checkbox);
            }
        }
        return this;
    }

    getItems(): Array<SelectMenuItem<string>> {
        return this.items;
    }

    setItems(value: Array<SelectMenuItem<string>>): this {
        this.items = value;
        return this;
    }

    getTitle(): string {
        return this.title;
    }

    setTitle(value: string): this {
        this.title = value;
        this.top.setLabel(value);
        return this;
    }

    getMinSelected(): number {
        return this.minSelected;
    }

    setMinSelected(value: number): this {
        this.minSelected = value;
        return this;
    }

    getMaxSelected(): number {
        return this.maxSelected;
    }

    setMaxSelected(value: number): this {
        this.maxSelected = value;
        return this;
    }
}