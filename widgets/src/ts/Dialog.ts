import {_Widget, Widget, WidgetEvents} from "./Widget.js";
import {Button, ButtonBox, ContentBox, FlexAlign, Top} from "./Widgets.js";

const DialogEvents = {
    ...WidgetEvents,
    accepted: "accepted",
    finished: "finished",
    rejected: "rejected",
};
type DialogEvents = (typeof DialogEvents)[keyof typeof DialogEvents];

interface _Dialog extends _Widget {
    accept(): this;

    reject(): this;

    open(): this;
}

abstract class Dialog<EventType extends DialogEvents, ValueType> extends Widget<EventType> implements _Dialog {
    private result: string;
    protected value: ValueType;
    private opened: boolean;
    protected readonly buttonBox: ButtonBox = new ButtonBox();
    protected readonly aTop: Top = new Top();
    protected readonly aContent: ContentBox;

    protected constructor(htmlElementType?: string, contentHtmlType?: string) {
        super(htmlElementType);
        this.aContent = new ContentBox(contentHtmlType);
        this.addChild("buttons", this.buttonBox);
        this.addChild("atop", this.aTop);
        this.addChild("aContent", this.aContent);
        // this.buttonBox.setSpacing("2rem", "2rem", "1rem");
    }

    protected buildTop(): JQuery<HTMLElement> {
        let top = this.aTop.build();
        this.domObject!.append(top);
        return top;
    }

    protected buildContent(): JQuery<HTMLElement> {
        let content = this.aContent.build();
        this.domObject!.append(content);
        return content;
    }

    protected buildButtons(): JQuery<HTMLElement> {
        let buttonBox = this.buttonBox.build();
        this.domObject!.append(buttonBox);
        return buttonBox;
    }

    public override build(suppressCallback: boolean = false): JQuery<HTMLElement> {
        super.build(true)
            .addClass("dialog-widget");

        this.buildCallback(suppressCallback);
        return this.domObject!;
    }

    public enableButtons(value: boolean): this {
        this.buttonBox.setInheritVisibility(value);
        return this;
    }

    public buttonsEnabled(): boolean {
        return this.buttonBox.inheritVisibility;
    }

    public enableTop(value: boolean): this {
        this.aTop.setInheritVisibility(value);
        return this;
    }

    public topEnabled(): boolean {
        return this.aTop.inheritVisibility;
    }

    public enableContent(value: boolean): this {
        this.aContent.setInheritVisibility(value);
        return this;
    }

    public contentEnabled(): boolean {
        return this.aContent.inheritVisibility;
    }

    public addButton(button: Button, mainAlign: FlexAlign = FlexAlign.center, crossAlign: FlexAlign = FlexAlign.center): this {
        this.buttonBox.addButton(button, mainAlign, crossAlign);
        return this;
    }

    public getResult(): string {
        return this.result;
    }

    public isOpened(): boolean {
        return this.opened;
    }

    public open(value?: ValueType): this {
        this.opened = true;
        this.result = null;
        this.value = value;
        this.setVisibility(true);
        this.rebuild();
        return this;
    }

    /**
     * You should save your result into {@link value} in this method and return {@link value}
     * @return {ValueType}
     * @protected
     */
    protected abstract setValue(): ValueType;

    public accept(): this {
        this.result = DialogEvents.accepted;
        this.close();
        return (this.dispatchEvent(DialogEvents.accepted, [this.setValue()], DialogEvents.finished));
    }

    public reject(): this {
        this.result = DialogEvents.rejected;
        this.close();
        return (this.dispatchEvent(DialogEvents.rejected, [], DialogEvents.finished));
    }

    protected close(): this {
        this.opened = false;
        this.setVisibility(false);
        return this;
    }

    public override destroy(): this {
        super.destroy();
        if (this.opened) {
            this.reject();
        }
        return this;
    }
}

export {Dialog, DialogEvents};