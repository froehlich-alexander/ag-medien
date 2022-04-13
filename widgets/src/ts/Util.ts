import {EventHandler, WidgetEvents} from "./Widget.js";

class Util {
    static setHeight(element: JQuery<HTMLElement>): void {
        element.outerHeight(element.outerHeight(false) ?? 0, false);
    }

    static setWidth(element: JQuery<HTMLElement>): void {
        element.outerWidth(element.outerWidth(false) ?? 0, false);
    }

    /**
     * Add something to a css-property of a Html Element
     * @param element the {@link JQuery} Html Element
     * @param property the name of the css property
     * @param value the value to add to
     */
    static addCssProperty(element: JQuery<HTMLElement>, property: string, value: string | number): JQuery<HTMLElement> {
        if (value == null || value == "") {
            return element;
        }
        if (element.get(0)!.style.getPropertyValue(property) === "") {
            element.css(property, value);
        } else {
            element.css(property, "calc(" + element.get(0)!.style.getPropertyValue(property) + "+" + value + ")");
        }
        return element;
    }

    static setHeightToRemaining(parent: JQuery<HTMLElement>, child: JQuery<HTMLElement>): void {
        let children = parent.children().not(child).not(".overlay-widget");
        let w = 0;
        for (let i = 0; i < children.length; i++) {
            w += children.eq(i).outerHeight(true) ?? 0;
        }
        child.css("max-height", `calc(100% - ${w}px`);
    }

    static setWidthToRemaining(parent: JQuery<HTMLElement>, child: JQuery<HTMLElement>): void {
        let children = parent.children().not(child).not(".overlay-widget");
        let w = 0;
        for (let i = 0; i < children.length; i++) {
            w += children.eq(i).outerWidth(true) ?? 0;
        }
        child.css("max-width", `calc(100% - ${w}px`);
    }
}

class EventCallbacks {
    // /**
    //  * Calculates and sets the height of an element
    //  * @type Pair
    //  */
    // static setHeight = new Pair<WidgetEvents, EventHandler<WidgetEvents, Widget<WidgetEvents>>>(
    //     WidgetEvents.sizeSet, function (event) {
    //         Util.setHeight(event.target.domObject);
    //     });

    /**
     * Calculates and sets the height of an element
     * @type Pair
     */
    static setHeight = <[WidgetEvents, EventHandler<WidgetEvents, HTMLElement>]>[
        WidgetEvents.sizeSet, function (event) {
            Util.setHeight(event.target.domObject);
        }];

    // /**
    //  * Calculates and sets the width of an element
    //  * @type Pair
    //  */
    // static setWidth = new Pair<WidgetEvents, EventHandler<WidgetEvents, Widget<WidgetEvents>>>(
    //     WidgetEvents.sizeSet, function (event) {
    //         Util.setWidth(event.target.domObject);
    //     });

    /**
     * Calculates and sets the width of an element
     * @type Pair
     */
    static setWidth = <[WidgetEvents, EventHandler<WidgetEvents, HTMLElement>]>[
        WidgetEvents.sizeSet, function (event) {
            Util.setWidth(event.target.domObject);
        }];

    // static setWidthToRemaining = (child: Widget<WidgetEvents>) => new Pair<WidgetEvents, EventHandler<WidgetEvents, Widget<WidgetEvents>>>(WidgetEvents.sizeSet, function (event) {
    //     Util.setWidthToRemaining(event.target.domObject, child.domObject);
    // });
    //
    // static setHeightToRemaining = (child: Widget<WidgetEvents>) => new Pair<WidgetEvents, EventHandler<WidgetEvents, Widget<WidgetEvents>>>(WidgetEvents.sizeSet, function (event) {
    //     Util.setHeightToRemaining(event.target.domObject, child.domObject);
    // });

    static setWidthToRemaining = <[WidgetEvents, EventHandler<WidgetEvents, HTMLElement>]>[
        WidgetEvents.sizeSet, function (event) {
            Util.setWidthToRemaining(event.target.domObject.parent(), event.target.domObject);
        }];

    static setHeightToRemaining = <[WidgetEvents, EventHandler<WidgetEvents, HTMLElement>]>[
        WidgetEvents.sizeSet, function (event) {
            Util.setHeightToRemaining(event.target.domObject.parent(), event.target.domObject);
        }];
}

export {EventCallbacks};
export {Util};