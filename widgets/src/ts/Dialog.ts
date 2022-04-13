import {Util} from "./Util.js";
import {_Widget, Widget, WidgetEvents} from "./Widget.js";
import {Button, ButtonBox, ContentBox, FlexAlign, Top} from "./Widgets.js";

const DialogEvents = {
    ...WidgetEvents,
    accepted: "accepted",
    finished: "finished",
    rejected: "rejected",
};

enum DialogState {
    accepted = "accepted",
    rejected = "rejected",
    closed = "closed",
    open = "open",
    notOpen = "notOpen",
}

type DialogEvents = (typeof DialogEvents)[keyof typeof DialogEvents];

interface _Dialog extends _Widget {
    accept(): this;

    reject(): this;

    open(): this;
}

abstract class Dialog<EventType extends DialogEvents, ValueType, ContentBoxHtmlElementType extends HTMLElement = HTMLDivElement, ContentBoxItemHtlElementType extends HTMLElement = HTMLDivElement, ContentBoxItemType extends Widget<WidgetEvents, ContentBoxItemHtlElementType> = Widget<WidgetEvents, ContentBoxItemHtlElementType>> extends Widget<EventType, HTMLDivElement> implements _Dialog {
    private _state: DialogState = DialogState.notOpen;
    private _value: ValueType | undefined;
    private readonly _buttonBox: ButtonBox = new ButtonBox();
    private readonly _aTop: Top = new Top();
    private readonly _aContent: ContentBox<ContentBoxHtmlElementType, ContentBoxItemType>;

    protected constructor(htmlElementType?: string, contentHtmlType?: string) {
        super(htmlElementType);
        this._aContent = new ContentBox(contentHtmlType);
        this.addChild("buttons", this._buttonBox);
        this.addChild("atop", this._aTop);
        this.addChild("aContent", this._aContent);
    }

    protected buildTop(): JQuery<HTMLElement> {
        return this._aTop.build()
            .appendTo(this.domObject);
    }

    protected buildContent(): JQuery<ContentBoxHtmlElementType> {
        return this._aContent.build()
            .appendTo(this.domObject);
    }

    protected buildButtons(): JQuery<HTMLElement> {
        return this._buttonBox.build()
            .appendTo(this.domObject);
    }

    public override build(suppressCallback: boolean = false): JQuery<HTMLDivElement> {
        super.build(true)
            .addClass("dialog-widget");

        return this.buildCallback(suppressCallback);
    }

    public enableTop(value: boolean): this {
        this._aTop.setInheritVisibility(value);
        return this;
    }

    public enableContent(value: boolean): this {
        this._aContent.setInheritVisibility(value);
        return this;
    }

    public enableButtons(value: boolean): this {
        this._buttonBox.setInheritVisibility(value);
        return this;
    }

    public addButton(button: Button, mainAlign: FlexAlign = FlexAlign.center, crossAlign: FlexAlign = FlexAlign.center): this {
        this._buttonBox.addButton(button, mainAlign, crossAlign);
        return this;
    }

    public open(value?: ValueType): this {
        this._state = DialogState.open;
        this._value = value;
        this.setVisibility(true);
        this.rebuild();
        return this;
    }

    /**
     * You should save your result into {@link _value} in this method and return {@link _value}
     * @return {ValueType}
     * @protected
     */
    protected abstract setValue(): ValueType;

    public accept(): this {
        this._state = DialogState.accepted;
        this.close();
        return (this.dispatchEvent(DialogEvents.accepted, [this.setValue()], undefined, DialogEvents.finished));
    }

    public reject(): this {
        this._state = DialogState.rejected;
        this.close();
        return (this.dispatchEvent(DialogEvents.rejected, [], undefined, DialogEvents.finished));
    }

    /**
     * Accepts or rejects the dialog based on some computation which should be implemented in the subclass
     * @returns {this}
     */
    public acceptOrReject(): this {
        return this.reject();
    }

    protected close(): this {
        if (this._state !== DialogState.accepted && this._state !== DialogState.rejected) {
            this._state = DialogState.closed;
        }
        this.setVisibility(false);
        return this;
    }

    public override destroy(): this {
        if (this._state === DialogState.open) {
            this.reject();
        }
        super.destroy();
        return this;
    }

    public get topEnabled(): boolean {
        return this._aTop.inheritVisibility;
    }

    public get contentEnabled(): boolean {
        return this._aContent.inheritVisibility;
    }

    public get buttonsEnabled(): boolean {
        return this._buttonBox.inheritVisibility;
    }

    public get state(): DialogState {
        return this._state;
    }

    public get value(): ValueType | undefined {
        return this._value;
    }

    public get buttonBox(): ButtonBox {
        return this._buttonBox;
    }

    public get aTop(): Top {
        return this._aTop;
    }

    public get aContent(): ContentBox<ContentBoxHtmlElementType, ContentBoxItemType> {
        return this._aContent;
    }
}

export {Dialog, DialogEvents};