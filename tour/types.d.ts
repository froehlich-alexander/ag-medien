/*
 * This File contains only types for compile time type checking.
 * Do NOT include it (or it's .js - file) in production
 */


export type MediaType = "img" | "video" | "iframe";
export type IconType = "arrow_l" | "arrow_r" | "arrow_u" | "arrow_d";
export type VideoPreloadType = "metadata" | "auto"; //cannot use "none" because then we won't get the loadmetadata event
export type LoadingType = "eager" | "lazy";
export type FetchPriorityType = "high" | "low" | "auto";
export type InlineObjectType = "clickable" | "text" | "custom";
export type InlineObjectPosition = "media" | "page"; //  whether the object is moving together with the media (like clickables) or the page and whether it is positioned relative to the media or to the page (normally full screen)
export type TextFieldSize = "normal" | "small" | "large" | "x-large" | "xx-large";
type AnimationForAll = "fade" | "none";
export type PageAnimations = AnimationForAll | "forward" | "backward";
export type TextAnimations = AnimationForAll;
export type CustomAnimations = AnimationForAll;
export type AnimationType = PageAnimations | TextAnimations | CustomAnimations;
export type AddressableObjects = "page" | "text-field";
export type ActionType = "activate" | "deactivate" | "toggle";

/**
 * A type for all objects which can be addressed in any way
 */
interface JsonAddressableObject {
    id: string; //a UNIQUE id
    animationType?: AnimationType;
}

/**
 * Type for the Page-Objects in pages.json (or pages.json)
 */
export type JsonPage = JsonAddressableObject & {
    media: JsonMedia,
    // is_panorama?: boolean,
    centralPositions?: number|number[],
    initialScroll?: {
        start?: number,
        destination?: number,
    }
    clickables?: Omit<JsonClickable, "type">[],
    inlineObjects?: JsonInlineObject[];
    animationType?: PageAnimations,
    secondBeginning?: number,
} & ({
    is_360: true,
    is_panorama?: true,
} | {
    is_360: false,
    is_panorama?: boolean,
} | {
    is_360?: undefined,
    is_panorama?: undefined,
})
export type JsonMedia = {
    //see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video for video
    //and https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img for img
    /*
    Normal src paths can be absolute OR
    they can be relative to document root (e.g. '/images/img.jpg' -> 'https://rheingau-gymnasium.de/images/img.jpg') OR
    they can be relative to img1 (e.g. 'test.jpg' -> 'img1/test.jpg' -> 'https://rheingau-gymnasium.de/current-path/img1/test.jpg').
    */
    src?: JsonSource;
    srcMin?: JsonSource;
    srcMax?: JsonSource;
    loading?: LoadingType | "auto";     //works for img, iframe
    fetchPriority?: FetchPriorityType;  //works for img, iframe
    //video attributes
    poster?: string;
    autoplay?: boolean;
    loop?: boolean;
    muted?: boolean
    preload?: VideoPreloadType;
    //iframe attributes

};
/**
 * Can be a string containing the source url or an object with a few more additional options
 */
export type JsonSource = string | {
    /**
     * The url to the source url (relative to tour/media or absolut)
     */
    name: string,
    /**
     * The type of the source object (overrides {@link JsonMedia.type})
     */
    type?: MediaType | "auto",
} & ({
    /** width and height can be absent but if one is specified, the other one must be specified too */
    width: number,
    /** width and height can be absent but if one is specified, the other one must be specified too */
    height: number,
} | {});

interface AbstractJsonInlineObject {
    x: number | string;
    y: number | string;
    position?: InlineObjectPosition;
    animationType?: AnimationType;
    // which kind of object this is (e.g. a clickable, text, etc.)
    type: InlineObjectType;
    // whether it is initially hidden (clickables will always be hidden, but e.g. text-fields can still be shown if there is something to trigger it)
    hidden?: boolean,
}

/**
 * A type that is used by everything that can target and activate (or disable) a JsonAddressableObject (like a page, a text-field, etc.)
 */
export type JsonActivating = ({
    // the id of the target (JsonAddressableObject)
    goto?: string;
    action?: ActionType;
    // scroll?: {
    //     // the initial scroll after this clickable is clicked (in percent)
    //     // if absent we will scroll to end without animation
    //     start: number,
    //
    //     // the position where we will scroll to (in percent)
    //     // if this is equal to start, we won't have a scroll animation, instead we will instantly scroll to this position
    //     end: number,
    //
    //     // time in ms (scrolling speed)
    //     time: number,
    // }
} & ({
    // The Type of the target
    targetType?: "page",
    animationType?: PageAnimations | "auto",
    action?: "activate",
} | {
    // The Type of the target
    targetType?: "text-field",
    animationType?: TextAnimations | "auto",
} | {
    targetType?: AddressableObjects | "auto";
    animationType?: AnimationType | "auto";
}));

/**
 * A type which represents a clickable object in the pages json file (pages.json or pages.json)
 */
export type JsonClickable = AbstractJsonInlineObject & JsonActivating & {
    title: string;
    // goto?: string;
    icon?: IconType;
    // the scroll percent where we arrive at the destination
    destinationScroll?: number | "auto",
    type: "clickable";
    // animationType?: PageAnimations;
    // targetType?: ClickableType; //on what kind of object this clickable points
}

export type JsonCustomObject = AbstractJsonInlineObject & {
    // the id of the js object (the object must be created and appended to the DOM before this js is executed)
    htmlId: string;
    type: "custom";
    animationType?: CustomAnimations;
}

export interface JsonTextField extends AbstractJsonInlineObject, JsonAddressableObject {
    content: string;
    title?: string;
    cssClasses?: string[] | string; // ["class-a", "class-b"] OR "class-a class-b"
    type: "text";
    animationType?: TextAnimations;
    size?: TextFieldSize;
}

export type JsonInlineObject = JsonCustomObject | JsonTextField | JsonClickable;

export type JsonSchulTourConfigFile = {
    pages: JsonPage[],
    initialPage?: string,
    fullscreen?: boolean,
    mode?: "normal" | "inline",
    colorTheme?: "dark" | "light",
    includeClickableHints?: boolean,
}
