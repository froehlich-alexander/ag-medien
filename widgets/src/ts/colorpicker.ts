import {mixin, MixinImplementing} from "./base.js";
import {EventCallbacks} from "./Util.js";
import {WidgetBase, WidgetEvents} from "./Widget.js";
import {FontSize, FontWeight} from "./WidgetBase.js";
import {Overlay} from "./Overlay.js";
import {Dialog, DialogEvents} from "./Dialog.js";
import {CheckboxEvents, FavoriteEvents, IconContainingEvents, Input, InputEvents, Item} from "./AbstractWidgets.js";
import {
    Button,
    ButtonEvents,
    FlexAlign,
    FlexBox,
    Icon,
    IconType,
    ListTile,
    SelectBox,
    SelectBoxEvents,
    SelectBoxItem,
    Text,
    TextInput,
    TextInputEvents
} from "./Widgets.js";
import ColorPickerService from "../../../color_picker_bootstrap/colorpickerBackend.js";
import ColorScheme, {Designs} from "../../../color_picker_bootstrap/colorpickerBackend.js";


// const ColorPickerItemEvents = {
//     // ...WidgetEvents,
//     colorChanged: "colorChanged",
// };
// type ColorPickerItemEvents = (typeof ColorPickerItemEvents)[keyof typeof ColorPickerItemEvents];

enum ColorPickerItemEvents {
    colorChanged = "colorChanged",
    editClicked = "editClicked",
}

class ColorPickerItem extends ListTile<WidgetEvents & IconContainingEvents & CheckboxEvents & FavoriteEvents & ColorPickerItemEvents, HTMLDivElement> {
    private _colorType: string;

    constructor(colorType: string) {
        super();
        this._colorType = colorType;
        this.setInheritVisibility(true)
            .setTrailingIcon(Icon.Edit())
            .enableTrailingIcon(true)
            .on(...EventCallbacks.setHeight)
            .on(IconContainingEvents.iconClicked, (event, _, index) =>
                index === 1 ? this.dispatchEvent(ColorPickerItemEvents.editClicked) : null);
    }

    public override build(suppressCallback: boolean = false): JQuery<HTMLDivElement> {
        super.build(true)
            .addClass("item");

        return this.buildCallback(suppressCallback);
    }

    public setColorType(colorType: string): this {
        this._colorType = colorType;
        return this;
    }

    public get colorType(): string {
        return this._colorType;
    }
}

class ColorPicker extends Dialog<WidgetEvents & DialogEvents, HTMLDivElement, HTMLDivElement, ColorPickerItem | FlexBox<WidgetEvents>> {
    private readonly colorPickerService: ColorPickerService;
    private readonly colorSchemeDialog: Overlay<ColorSchemeDialog>;
    // private readonly colorSchemeNewDialog: Overlay<ColorSchemeNewDialog>;
    private readonly colorSchemeButton: Button;
    private readonly colorSchemeLabel: Text;
    private readonly colorSchemeBox: FlexBox<WidgetEvents>;
    private readonly colorPickerNormalInput: Overlay<ColorPickerNormalInput>;
    private readonly colorPickerGradientInput: Overlay<ColorPickerGradientInputDialog>;

    public constructor() {
        super();
        this.colorPickerService = new ColorPickerService();
        // this.colorSchemeNewDialog = new Overlay<ColorSchemeNewDialog>(new ColorSchemeNewDialog(this.colorPickerService, this.colorPickerService.getCurrent()));
        // this.colorSchemeDialog = new Overlay<Dialog<WidgetEvents, null>>((null, null)
        //     .setMaxSelected(1)
        //     .setMinSelected(1)
        //     .setTitle("Color Scheme")
        //     .addButton(Button.Delete().on(undefined, new Pair(ButtonEvents.clicked, (event) => {
        //     })), FlexAlign.end)
        //     .addButton(new Button().setLabel("New").setIcon(Icon.of("add", IconType.material))
        //         .on(undefined, new Pair(ButtonEvents.clicked, (event) => {
        //             console.log("new");
        //             this.colorSchemeNewDialog.widget.setBaseScheme(this.colorPickerService.getCurrent());
        //             this.colorSchemeNewDialog.widget.open();
        //         })), FlexAlign.end)
        //     .enableButtons(true)
        // );
        this.colorSchemeDialog = new Overlay<ColorSchemeDialog>(new ColorSchemeDialog(this.colorPickerService)
            .on(DialogEvents.finished, () => this.rebuild()));
        this.colorSchemeButton = new Button()
            .setInheritVisibility(true)
            .setIcon(Icon.of("expand_more", IconType.material))
            .on(ButtonEvents.clicked, () => this.colorSchemeDialog.widget.open())
            .on(...EventCallbacks.setWidthToRemaining);
        this.colorSchemeLabel = new Text().set("Color-Scheme")
            .setInheritVisibility(true)
            .setFontWeight(FontWeight.bold)
            .setFontSize(FontSize.large);
        this.colorSchemeBox = new FlexBox().setInheritVisibility(true)
            .addItem(this.colorSchemeLabel, FlexAlign.start)
            .addItem(this.colorSchemeButton, FlexAlign.start)
            .setSpacing("3rem", "1rem", "2rem");
        this.colorPickerNormalInput = new Overlay<ColorPickerNormalInput>(new ColorPickerNormalInput()
            .on(ColorPickerInputEvents.colorChanged, (event) => console.log(this.colorPickerService.getCurrent().id))
            .on(ColorPickerInputEvents.colorChanged, (event) => this.colorPickerService.activate(this.colorPickerService
                .getCurrent().setColor(event.target.colorId, event.target.value!))));
        // .on(ColorPickerInputEvents.colorChanged, (event)=>{
        //     this.aContent.items.find(v=>v instanceof ColorPickerItem && v.colorType === event.target.colorId)!
        //         .dispatchEvent(ColorPickerItemEvents.colorChanged);
        // }));
        this.colorPickerGradientInput = new Overlay<ColorPickerGradientInputDialog>(new ColorPickerGradientInputDialog());

        this.enableTop(true);
        this.aTop.setLabel("Color-Picker")
            .on(IconContainingEvents.iconClicked, () => this.reject())
            .setDefaultTop(true);
        this.enableContent(true);
        // this.top = new Top().setLabel("Color-Picker")
        //     .setInheritVisibility(true)
        //     .setIcon(Icon.Close().setClickable(true));
        // this.addChild("top", this.top);
        this.addChild("colorSchemeDialog", this.colorSchemeDialog);
        this.addChild("colorPickerNormalInput", this.colorPickerNormalInput);
        this.addChild("colorPickerGradientInput", this.colorPickerGradientInput);
        // this.children.set("colorSchemeNewDialog", this.colorSchemeNewDialog);
        // this.children.set("colorSchemeButton", this.colorSchemeButton);
        // this.children.set("colorSchemeLabel", this.colorSchemeLabel);
        this.addChild("colorSchemeBox", this.colorSchemeBox);

        // this.on("sizeSet", () => this.domObject.children(".content").css("max-height", "calc(100% - "
        //     // + this.domObject.find(".bottom").outerHeight(true) + "px - "
        //     + this.domObject.children(".title-widget").outerHeight(true) + "px)"));
        this.enableButtons(false);
    }

    public override build(suppressCallback: boolean = false): JQuery<HTMLDivElement> {
        //color schemes
        // for (let scheme of this.colorPickerService.all.values()) {
        //     let item = new SelectMenuItem<string>()
        //         .setInheritVisibility(true)
        //         .setLabel(scheme.name)
        //         .setCheckbox(true)
        //         .setValue(scheme.id)
        //         .setSelected(scheme.current)
        //         .setIcon(Icon.Info());
        //     this.colorSchemeDialog.widget.addItems(item);
        // }

        super.build(true)
            .addClass("color-picker")
            .append(this.colorSchemeDialog.build())
            .append(this.colorPickerNormalInput.build())
            .append(this.colorPickerGradientInput.build())
            // .append(this.colorSchemeNewDialog.build())
            // .append(this.top.build()
            //     .addClass("top"));
            .append(this.buildTop());
        // this.colorSchemeDialog.widget.domObject
        //     .addClass("color-scheme-dialog");
        // let content = $("<div></div>")
        //     .addClass("content")
        //     .appendTo(this.domObject);

        //color scheme select menu
        // content.append($("<div></div>")
        //     .addClass("color-scheme-select-button")
        //     .on("click", this.colorSchemeDialog.open))

        // content.append($("<div></div>")
        //     .addClass("color-scheme")
        //     .append(this.colorSchemeLabel.build()
        //         .addClass("label"))
        //     .append(this.colorSchemeButton.build()
        //         .addClass("button")));
        this.aContent.addItems(this.colorSchemeBox);
        this.aContent.addItems(this.colorPickerService.colorTypes
            // not needed because colorType won't change
            // filter old items
            // .filter(v => this.aContent.items.findIndex(value => value.colorType === v) === -1)
            .map(v => {
                let item = new ColorPickerItem(v);
                item.backgroundColor.set(`var(${v})`);
                item.setLabel(this.colorPickerService.getDisplayColorName(v));
                return item.setInheritVisibility(true).on(ColorPickerItemEvents.colorChanged, (event, colorValue) => this.colorPickerService.onChange((<ColorPickerItem>event.target).colorType, colorValue))
                    .on(ColorPickerItemEvents.editClicked, (event) => {
                        //TODO distinct between normal and gradient colors
                        if (true) {
                            console.log("edit clicked")
                            this.colorPickerNormalInput.widget
                                .setColorId(event.target.colorType)
                                .open();
                        }
                    });
            }));

        this.domObject.append(this.buildContent());
        this.colorSchemeBox.domObject
            .addClass("color-scheme");

        //color items
        // let i = 0;
        // for (let colorType of this.colorPickerService.colorTypes) {
        //     let item = new ColorPickerItem(colorType);
        //     this.addChild("colorPickerItem" + i, item);
        //
        //     item.setVisibility(this.visibility);
        //     item.backgroundColor.set("var(" + colorType + ")");
        //     item.label.set(this.colorPickerService.getDisplayColorName(colorType));
        //     item.on(ColorPickerItemEvents.colorChanged, (event, colorValue) => this.colorPickerService.onChange((<ColorPickerItem>event.target).label.get(), colorValue));
        //
        //     this.aContent.domObject.append(item.build());
        //     i++;
        // }

        return this.buildCallback(suppressCallback);
    }

    public override rebuild(suppressCallback: boolean = false): JQuery<HTMLDivElement> {
        super.rebuild(true);
        this.colorSchemeButton.setLabel(this.colorPickerService.getCurrent().name)
            .rebuild();
        return this.rebuildCallback(suppressCallback);
    }
}

enum ColorSchemeItemEvents {
    infoClicked = "infoClicked",
}

interface ColorSchemeItem extends MixinImplementing, Item {
}

@mixin(Item)
class ColorSchemeItem extends ListTile<WidgetEvents & IconContainingEvents & CheckboxEvents & FavoriteEvents & ColorSchemeItemEvents> {
    private readonly _colorScheme: ColorScheme;

    constructor(colorScheme: ColorScheme) {
        super();
        this.mixinConstructor();
        this._colorScheme = colorScheme;
        this.setLeadingIcon(Icon.Info());
        this.leadingIcon.on(WidgetEvents.clicked, () => console.log("icon clicked"))
            .on(WidgetEvents.clicked, (event) => {
                this.dispatchEvent(ColorSchemeItemEvents.infoClicked);
                event.originalEvent?.stopPropagation();
            });
        // this.addItem(Icon.of("favorite", IconType.material), FlexAlign.start);
        this.enableFavorite(true)
            .setLabel(colorScheme.name)
            .enableCheckbox(true)
            .on(FavoriteEvents.unFavored, (event, favored) => console.log(favored, this.domObject?.closest(event.originalEvent?.target).length))
            .on(FavoriteEvents.unFavored, (event) => ((event.originalEvent instanceof MouseEvent) && this.domObject?.closest(event.originalEvent.target!).length > 0) ? this.setFavored(true) : null);
    }

    public override build(suppressCallback: boolean = false): JQuery<HTMLDivElement> {
        super.build(true)
            .addClass("default-item");
        this.buildCallback(suppressCallback);
        return this.domObject;
    }

    public override rebuild(suppressCallback: boolean = false): JQuery<HTMLDivElement> {
        super.rebuild(true);
        this.rebuildCallback(suppressCallback);
        // console.log("item rebuild");
        this.setLabel(this._colorScheme.name);
        this.setFavored(this._colorScheme.current);
        this._label.rebuild();
        return this.domObject;
    }

    public get colorScheme(): ColorScheme {
        return this._colorScheme;
    }
}

class ColorSchemeDialog extends Dialog<WidgetEvents & DialogEvents, HTMLDivElement, HTMLDivElement, ColorSchemeItem> {
    private readonly colorSchemeNewDialog: Overlay<ColorSchemeNewDialog>;
    private readonly colorSchemeInfoDialog: Overlay<ColorSchemeInfoDialog>;
    private readonly colorPickerService: ColorPickerService;

    constructor(colorPickerService: ColorPickerService) {
        super();
        this.colorPickerService = colorPickerService;
        this.colorSchemeNewDialog = new Overlay<ColorSchemeNewDialog>(new ColorSchemeNewDialog(this.colorPickerService, this.colorPickerService.getCurrent())
            .on(DialogEvents.accepted, () => {
                this.rebuild();
                // this.aContent.addItems(value);
            }));
        this.colorSchemeInfoDialog = new Overlay<ColorSchemeInfoDialog>(new ColorSchemeInfoDialog(this.colorPickerService, this.colorPickerService.getCurrent())
            .on(DialogEvents.accepted, () => this.rebuild()));

        this.enableTop(true);
        this.aTop.setLabel("Color Schemes");
        this.aTop.on(IconContainingEvents.iconClicked, () => this.reject());

        this.enableContent(true);

        this.enableButtons(true);
        this.buttonBox
            .addButton(Button.Delete()
                .on(ButtonEvents.clicked, (event) => {
                    console.log("delete");
                    this.colorPickerService.delete(this.aContent.items
                        .filter(v => v.checked && !v.colorScheme.preDefined)
                        //TODO 12.04.2022 alert if one is trying to delete pre defined colorSchemes
                        .map(v => v.colorScheme));
                    this.rebuild();
                }), FlexAlign.end)
            .addButton(new Button().setLabel("New").setIcon(Icon.of("add", IconType.material))
                .on(ButtonEvents.clicked, (event) => {
                    console.log("new");
                    this.colorSchemeNewDialog.widget.setBaseScheme(this.colorPickerService.getCurrent());
                    this.colorSchemeNewDialog.widget.open();
                }), FlexAlign.end);

        this.addChild("colorSchemeNewDialog");
        this.addChild("colorSchemeInfoDialog");
    }

    public override rebuild(suppressCallback: boolean = false): JQuery<HTMLDivElement> {
        super.rebuild(true);
        //color schemes
        this.aContent.addItems([...this.colorPickerService.all.values()]
            .filter(value => this.aContent.items
                // .filter(v => v instanceof ColorSchemeItem)//todo redundant? performance?
                .map(value1 => value1.colorScheme.id).indexOf(value.id) === -1)
            .map(value => {
                console.log(value === this.colorPickerService.all.get(value.id));
                let item = new ColorSchemeItem(value)
                    .setInheritVisibility(true)
                    .show()
                    .on(ColorSchemeItemEvents.infoClicked, (event) => {
                        console.log("info clicked");
                        console.log(event.target);
                        this.colorSchemeInfoDialog.widget
                            .open(event.target.colorScheme);
                    })
                    .on(FavoriteEvents.favored, (event) => {
                        console.log("item activate");
                        this.colorPickerService.activate(item.colorScheme);
                        event.originalEvent?.stopPropagation();
                        this.aContent.rebuild();
                    });
                item.build();
                return item;
            }));

        let indexesToDelete: number[] = [];
        this.aContent.items.map(value => value.colorScheme.id)
            .forEach((value, index) => {
                if (this.colorPickerService.all.get(value) === undefined) {
                    // this.aContent.removeItem(index);
                    indexesToDelete.push(index);
                }
            });
        this.aContent.removeItem(...indexesToDelete);
        let i = 0;
        for (let c of this.colorPickerService.all.values()) {
            this.aContent.items.find(value => value.colorScheme.id === c.id)!.setIndex(i);
            i++;
        }
        this.aContent.orderItems().rebuild();
        // .filter()
        // .map(value => new SelectMenuItem<string>()
        //     .setInheritVisibility(true)
        //     .setLabel(value.name)
        //     .setCheckbox(true)
        //     .setValue(value.id)
        //     .setSelected(value.current)
        //     .setIcon(Icon.Info())));

        if (this.built) {
            this.rebuildCallback(suppressCallback);
        }
        return this.domObject;
    }

    public override build(suppressCallback: boolean = false): JQuery<HTMLDivElement> {
        super.build(true)
            .addClass("color-scheme-dialog")
            .append(this.colorSchemeNewDialog.build())
            .append(this.colorSchemeInfoDialog.build());

        //color schemes
        // this.aContent.addItems(...[...this.colorPickerService.all.values()].map((value, index) => new ColorSchemeItem(value)
        //     .setInheritVisibility(true)
        //     .on(ColorSchemeItemEvents.infoCLicked, (event) => {
        //         console.log("info clicked");
        //         console.log(event.target);
        //         this.colorSchemeInfoDialog.widget
        //             // .setColorScheme((<ColorSchemeItem>event.target).colorScheme)
        //             .open((<ColorSchemeItem>event.target).colorScheme);
        //     })));

        this.buildTop();
        this.buildContent();
        this.buildButtons();
        this.buildCallback(suppressCallback);
        return this.domObject;
    }
}

namespace Utils {
    export function nameInput(identifier: string): TextInput {
        return new TextInput()
            .setId(identifier + "_name")
            .setLabel("Name")
            .setMinLength(3)
            .setSpellcheck(true);
    }

    export function authorInput(identifier: string): TextInput {
        return new TextInput()
            .setId(identifier + "_author")
            .setLabel("Author")
            .setMinLength(5);
    }

    export function colorSchemeSelectBox(service: ColorPickerService, identifier: string): SelectBox {
        let box = new SelectBox();
        return box
            // .addItems(...[...service.all.values()]
            //     .filter(v => !box.has(v.id))
            //     .map(v => {
            //         let item = new SelectBoxItem()
            //             .setLabel(v.name)
            //             .setId(identifier + v.id);
            //         item.value.setValue(v.id)
            //             .setChecked(v.current);
            //         return item;
            //     }))
            .on(WidgetEvents.rebuild, (event) => event.target
                .addItems(...[...service.all.values()]
                    .filter(v => !event.target.has(identifier + v.id))
                    .map(v => {
                        let item = new SelectBoxItem()
                            .setLabel(v.name)
                            .setId(identifier + v.id);
                        item.value.setValue(v.id)
                            .setChecked(v.current);
                        return item;
                    }))
                .removeItems(...event.target.items
                    .filter(v => !service.all.has(v.id.substring(identifier.length)))));
    }

    export function designSelectBox(current: Designs, identifier: string): SelectBox {
        return new SelectBox()
            .addItems(...Object.entries(Designs)
                .map(v => {
                    let item = new SelectBoxItem()
                        .setId(identifier + v[0])
                        .setLabel(v[1]);
                    item.value.setValue(v[1])
                        .setChecked(current === v[0]);
                    return item;
                }));
    }
}

class ColorSchemeNewDialog extends Dialog<WidgetEvents & DialogEvents, HTMLDivElement, HTMLDivElement, WidgetBase<WidgetEvents, HTMLDivElement>> {
    private _baseScheme: ColorScheme;
    private readonly _colorScheme: ColorScheme;
    private readonly service: ColorPickerService;
    private readonly nameInput: TextInput;
    private readonly authorInput: TextInput;
    private readonly designInput: SelectBox;
    private readonly colorSchemeSelectBox: SelectBox;

    constructor(service: ColorPickerService, baseScheme: ColorScheme) {
        super(undefined, "form");
        this.service = service;
        this.enableContent(true);
        this.enableButtons(true);
        this.addButton(new Button().setLabel("Create").setIcon(Icon.of("add", IconType.material))
            .on(ButtonEvents.clicked, () => this.accept()), FlexAlign.end);
        this.addButton(Button.Cancel().on(ButtonEvents.clicked, () => this.reject()), FlexAlign.end);
        this.enableTop(true);
        this.aTop.setLabel("New Color-Scheme")
            .setDefaultTop(true)
            .on(IconContainingEvents.iconClicked, () => this.reject());
        // this.aTop.setIcon(Icon.Close().on(undefined, new Pair(IconEvents.clicked, () => {this.reject();
        //     console.log("close");})));

        this._baseScheme = baseScheme ?? service.getDefault();
        this._colorScheme = this._baseScheme.copy()
            //should be redundant
            .setPreDefined(false)
            .setCurrent(false);

        this.on(DialogEvents.accepted, (event) => {
            console.log("accepted");
            console.log(event);
            this.service.save(this._colorScheme.copy(this.service.getColorScheme()));
        });

        //ColorScheme field inputs
        this.nameInput = Utils.nameInput(ColorSchemeNewDialog.name)
            .on(TextInputEvents.input, (event, value) => {
                this._colorScheme.setName(value);
                this.nameInput.rebuild();
            });

        this.authorInput = Utils.authorInput(ColorSchemeNewDialog.name)
            .on(TextInputEvents.input, (event, value) => {
                this._colorScheme.setAuthor(value);
                this.nameInput.rebuild();
            });

        this.designInput = Utils.designSelectBox(this._baseScheme.design, ColorSchemeNewDialog.name)
            .on(InputEvents.input, (event, value) => {
                this._colorScheme.setDesign(value.value);
            });

        this.colorSchemeSelectBox = Utils.colorSchemeSelectBox(this.service, ColorSchemeNewDialog.name)
            .on(SelectBoxEvents.input, (event, value) => this.setBaseScheme(this.service.getColorScheme(value)!).rebuild());

        this.aContent.addItems(this.colorSchemeSelectBox, this.nameInput, this.authorInput, this.designInput);
    }

    public override build(suppressCallback: boolean = false): JQuery<HTMLDivElement> {
        super.build(true)
            .addClass("color-scheme-new-dialog");

        // for (let i of Object.keys(ColorScheme)) {
        //     this.content.addItems();
        // }

        //choose Base Widget
        // this.content.addItems();

        //ColorScheme field inputs
        // this.content.addItems(...[
        //     new TextInput()
        //         .setId("_name")
        //         .setLabel("Name")
        //         .setMinLength(3)
        //         .setSpellcheck(true),
        //     new TextInput()
        //         .setId("_author")
        //         .setLabel("Author")
        //         .setMinLength(5)
        // ].map(value => value.setId(ColorSchemeNewDialog.name + value.id)
        //     // @ts-ignore
        //     .setPlaceHolder(this.baseScheme[value.id.value])));

        this.buildTop();
        this.buildContent();
        this.buildButtons();

        this.buildCallback(suppressCallback);
        return this.domObject;
    }

    public override rebuild(suppressCallback: boolean = false): JQuery<HTMLDivElement> {
        super.rebuild(true);

        this.nameInput.setPlaceHolder(this._baseScheme.name);
        this.authorInput.setPlaceHolder(this._baseScheme.author);
        this.designInput.setChecked(this._baseScheme.design);

        this.rebuildCallback(suppressCallback);
        return this.domObject;
    }

    private setValue(): ColorScheme {
        throw "setVALUE";
        console.log("setValue");
        // let inputs = {};
        // for (let i of this.content.items.filter((value: TextInput) => value.id.startsWith(ColorSchemeNewDialog.name))) {
        //     let id = (<TextInput>i).id.substring(ColorSchemeNewDialog.name.length, (<TextInput>i).id.length);
        //     console.log(id);
        //     if ((<TextInput>i).value != null) {
        //         // @ts-ignore
        //         inputs[id] = (<TextInput>i).value;
        //     } else {
        //         // @ts-ignore
        //         inputs[id] = this.baseScheme[id];
        //     }
        // }
        // let tempScheme = new ColorScheme(inputs);
        let scheme = this.service.getColorScheme()
            .setColors(this._baseScheme.colors)
            .setCurrent(false)
            .setPreDefined(false)
            .setName(this.nameInput.value ?? this._baseScheme.name)
            .setAuthor(this.authorInput.value ?? this._baseScheme.author)
            .setDesign(this.designInput.items.find(v => v.value.checked)!.value.value! as Designs);
        this.service.save(scheme);
        return scheme;
    }

    public override open(baseScheme?: ColorScheme): this {
        this._baseScheme = (baseScheme ?? this._baseScheme) ?? this.service.getCurrent();
        this.colorSchemeSelectBox.rebuild();
        this.colorSchemeSelectBox.setChecked(this._baseScheme.id)
            .rebuild();
        // super.open(baseScheme);
        super.open();
        this.nameInput.setValue("")
            .setPlaceHolder(this._baseScheme.name);
        this.authorInput.setValue("")
            .setPlaceHolder(this._baseScheme.author);
        this.designInput.setChecked(this._baseScheme.design);
        return this;
    }

    public setBaseScheme(scheme: ColorScheme): this {
        this._baseScheme = scheme;
        return this;
    }

    public get baseScheme(): ColorScheme {
        return this._baseScheme;
    }

    public get colorScheme(): ColorScheme {
        return this._colorScheme;
    }
}

class ColorSchemeInfoDialog extends Dialog<WidgetEvents & DialogEvents, HTMLDivElement, HTMLDivElement, TextInput<HTMLDivElement> | SelectBox<HTMLDivElement>> {
    private _colorScheme: ColorScheme;
    private readonly colorSchemeBackup: ColorScheme;
    private readonly nameInput: TextInput;
    private readonly authorInput: TextInput;
    private readonly designInput: SelectBox;
    private readonly service: ColorPickerService;

    constructor(service: ColorPickerService, colorScheme: ColorScheme) {
        super();
        this.colorSchemeBackup = colorScheme.copy();
        this.service = service;
        this._colorScheme = colorScheme;

        //ColorScheme field inputs
        this.nameInput = Utils.nameInput(ColorSchemeInfoDialog.name)
            .on(TextInputEvents.input, (event, value) => {
                this._colorScheme.setName(value);
                // this.nameInput.rebuild();
                this.service.save(this._colorScheme);
            });

        this.authorInput = Utils.authorInput(ColorSchemeInfoDialog.name)
            .on(TextInputEvents.input, (event, value) => {
                this._colorScheme.setAuthor(value);
                this.nameInput.rebuild();
                this.service.save(this._colorScheme);
            });

        this.designInput = Utils.designSelectBox(this._colorScheme.design, ColorSchemeInfoDialog.name)
            .on(InputEvents.input, (event, value) => {
                this._colorScheme.setDesign(value.value);
                this.service.activate(this._colorScheme);
            });

        this.aContent.addItems(this.nameInput, this.authorInput, this.designInput);

        this.enableTop(true);
        this.enableContent(true);
        this.enableButtons(true);
        this.aTop.setLabel(colorScheme.name)
            .setDefaultTop(true)
            .on(IconContainingEvents.iconClicked, () => this.acceptOrReject());
        this.addButton(Button.Reset()
            .on(WidgetEvents.clicked, () => {
                this.colorSchemeBackup.copy(this._colorScheme);
                if (this._colorScheme.current) {
                    this.service.activate(this._colorScheme);
                }
                this.service.save(this._colorScheme);
                this.rebuild();
            }), FlexAlign.end);
        this.addButton(Button.Activate().on(WidgetEvents.clicked, () => {
            this.service.activate(this._colorScheme);
            this.service.save(this._colorScheme);
        }), FlexAlign.end);
    }

    public override build(suppressCallback: boolean = false): JQuery<HTMLDivElement> {
        super.build(true);
        this.domObject.addClass("color-scheme-info-dialog");

        this.buildTop();
        this.buildContent();
        this.buildButtons();

        this.buildCallback(suppressCallback);
        return this.domObject;
    }

    public override rebuild(suppressCallback: boolean = false): JQuery<HTMLDivElement> {
        super.rebuild(true);

        this.nameInput.setPlaceHolder(this._colorScheme.name);
        // this.nameInput.setLabel(this._colorScheme.name);
        this.authorInput.setPlaceHolder(this._colorScheme.author);
        // this.authorInput.setLabel(this._colorScheme.author);
        console.log("setChecked", this._colorScheme.design);
        // console.log(this._colorScheme.design);
        // console.log(this.designInput);
        // console.log(this.designInput.items);
        this.designInput.setChecked(this._colorScheme.design);
        console.log([...this.designInput.items.values()].map(v => v.value)
            .map(v => v.value + v.domObject.find("input").prop("checked") + " vs " + v.checked).join())

        this.aTop.rebuild();
        this.aContent.rebuild();
        this.buttonBox.rebuild();
        this.nameInput.rebuild();
        this.authorInput.rebuild();
        this.designInput.rebuild();

        this.rebuildCallback(suppressCallback);
        return this.domObject;
    }

    public override open(value?: ColorScheme): this {
        super.open();
        if (value !== undefined) {
            this.setColorScheme(value);
        }
        this.aTop.setLabel(this._colorScheme.name);
        this.nameInput.setValue(this._colorScheme.name);
        this.authorInput.setValue(this._colorScheme.author);
        this.tryRebuild();
        return this;
    }

    public override acceptOrReject(): this {
        return JSON.stringify(this._colorScheme.copy()) !== JSON.stringify(this.colorSchemeBackup.toJSON()) ? this.accept() : this.reject();
    }

    public get colorScheme(): ColorScheme {
        return this._colorScheme;
    }

    public setColorScheme(colorScheme: ColorScheme): this {
        this._colorScheme = colorScheme;
        colorScheme.copy(this.colorSchemeBackup);
        return this;
    }
}

enum ColorPickerInputEvents {
    colorChanged = "colorChanged"
}

interface ColorPickerNormalInput extends MixinImplementing, Input<string, WidgetEvents & InputEvents, HTMLDivElement> {
}

@mixin(Input)
class ColorPickerNormalInput extends Dialog<WidgetEvents & InputEvents, HTMLDivElement> {
    private _colorId?: string;

    constructor() {
        super();
        this.mixinConstructor()
            .enableTop(false)
            .enableContent(false)
            .enableButtons(false)
            .setType("color")
            .setName("normal-color-input")
            .setId("normal-color-input")
            .on(InputEvents.change, () => console.log("change"))
            .on(InputEvents.input, () => console.log("input"))
            .on(InputEvents.change, () => {
                this.accept();
                this.dispatchEvent(ColorPickerInputEvents.colorChanged);
            });
    }

    public override build(suppressCallback: boolean = false): JQuery<HTMLDivElement> {
        super.build(true)
            .addClass("color-picker-normal-input")
            .append(this.buildInput())
        return this.buildCallback(suppressCallback);
    }

    public override rebuild(suppressCallback: boolean = false): JQuery<HTMLDivElement> {
        super.rebuild(true);
        if (this._colorId !== undefined) {
            console.log(this.domObject.css(this._colorId).substring(0, 7))
            this.setValue(this.domObject.css(this._colorId).substring(0, 7));
        }
        this.rebuildInput();
        return this.rebuildCallback(suppressCallback);
    }

    public get colorId(): string {
        return this._colorId!;
    }

    public setColorId(value: string): this {
        this._colorId = value;
        return this;
    }
}

class ColorPickerGradientInputDialog extends Dialog<WidgetEvents & DialogEvents> {
}

export {ColorPicker};