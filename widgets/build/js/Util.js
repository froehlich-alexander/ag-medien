import { WidgetEvents } from "./Widget.js";
class Util {
    static setHeight(element) {
        var _a;
        element.outerHeight((_a = element.outerHeight(false)) !== null && _a !== void 0 ? _a : 0, false);
    }
    static setWidth(element) {
        var _a;
        element.outerWidth((_a = element.outerWidth(false)) !== null && _a !== void 0 ? _a : 0, false);
    }
    /**
     * Add something to a css-property of a Html Element
     * @param element the {@link JQuery} Html Element
     * @param property the name of the css property
     * @param value the value to add to
     */
    static addCssProperty(element, property, value) {
        if (value == null || value == "") {
            return element;
        }
        if (element.get(0).style.getPropertyValue(property) === "") {
            element.css(property, value);
        }
        else {
            element.css(property, "calc(" + element.get(0).style.getPropertyValue(property) + "+" + value + ")");
        }
        return element;
    }
    static setHeightToRemaining(parent, child) {
        var _a;
        let children = parent.children().not(child).not(".overlay-widget");
        let w = 0;
        for (let i = 0; i < children.length; i++) {
            w += (_a = children.eq(i).outerHeight(true)) !== null && _a !== void 0 ? _a : 0;
        }
        child.css("max-height", `calc(100% - ${w}px`);
    }
    static setWidthToRemaining(parent, child) {
        var _a;
        let children = parent.children().not(child).not(".overlay-widget");
        let w = 0;
        for (let i = 0; i < children.length; i++) {
            w += (_a = children.eq(i).outerWidth(true)) !== null && _a !== void 0 ? _a : 0;
        }
        child.css("max-width", `calc(100% - ${w}px`);
    }
}
class EventCallbacks {
}
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
Object.defineProperty(EventCallbacks, "setHeight", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: [
        WidgetEvents.sizeSet, function (event) {
            Util.setHeight(event.target.domObject);
        }
    ]
});
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
Object.defineProperty(EventCallbacks, "setWidth", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: [
        WidgetEvents.sizeSet, function (event) {
            Util.setWidth(event.target.domObject);
        }
    ]
});
// static setWidthToRemaining = (child: Widget<WidgetEvents>) => new Pair<WidgetEvents, EventHandler<WidgetEvents, Widget<WidgetEvents>>>(WidgetEvents.sizeSet, function (event) {
//     Util.setWidthToRemaining(event.target.domObject, child.domObject);
// });
//
// static setHeightToRemaining = (child: Widget<WidgetEvents>) => new Pair<WidgetEvents, EventHandler<WidgetEvents, Widget<WidgetEvents>>>(WidgetEvents.sizeSet, function (event) {
//     Util.setHeightToRemaining(event.target.domObject, child.domObject);
// });
Object.defineProperty(EventCallbacks, "setWidthToRemaining", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: [
        WidgetEvents.sizeSet, function (event) {
            Util.setWidthToRemaining(event.target.domObject.parent(), event.target.domObject);
        }
    ]
});
Object.defineProperty(EventCallbacks, "setHeightToRemaining", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: [
        WidgetEvents.sizeSet, function (event) {
            Util.setHeightToRemaining(event.target.domObject.parent(), event.target.domObject);
        }
    ]
});
export { EventCallbacks };
export { Util };
//# sourceMappingURL=Util.js.map