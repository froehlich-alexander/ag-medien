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
export type PageAnimations = "forward" | "backward";
export type TextAnimations = undefined;
export type CustomAnimations = undefined;
export type AnimationType = PageAnimations | TextAnimations | CustomAnimations;

/**
 * A type for all objects which can be addressed in any way
 */
type JsonAdressableObject = {
    id: string; //a UNIQUE id
}
/**
 * Type for the Page-Objects in pages.json (or pages.json)
 */
export type JsonPage = JsonAdressableObject & {
    img: JsonMedia;
    is_360?: boolean;
    is_panorama?: boolean;
    initial_direction?: number;
    clickables?: Omit<JsonClickable, "type">[];
    inlineObjects?: JsonInlineObject[];
}
export type JsonMedia = {
    //see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video for video
    //and https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img for img
    /*
    normal src paths can be absolute OR
    they can be relative to document root (e.g. '/images/img.jpg' -> 'https://rheingau-gymnasium.de/images/img.jpg') OR
    they can be relative to img1 (e.g. 'test.jpg' -> 'img1/test.jpg' -> 'https://rheingau-gymnasium.de/current-path/img1/test.jpg').
    */
    src?: JsonSource;
    srcMin?: JsonSource;
    srcMax?: JsonSource;
    type?: MediaType | "auto";
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
export type JsonSource = string | {
    name: string,
    width?: number,
    height?: number,
    type?: MediaType,
}
type AbstractJsonInlineObject = {
    x: number | string;
    y: number | string;
    position?: InlineObjectPosition;
    goto?: string;
    animationType?: AnimationType;
    type: InlineObjectType; //which kind of object this is (e.g. a clickable, text, etc.)
}
/**
 * A type which represents a clickable object in the pages json file (pages.json or pages.json)
 */
export type JsonClickable = AbstractJsonInlineObject & {
    title: string;
    goto: string;
    icon?: IconType;
    //@depreciated
    backward?: boolean; //depreciated use animationType instead
    type: "clickable";
    animationType?: PageAnimations;
    // targetType?: ClickableType; //on what kind of object this clickable points
}

export type JsonCustomObject = AbstractJsonInlineObject & {
    htmlId: string; //the id of the js object (the object must be created and appended to the DOM before this js is executed)
    type: "custom";
    animationType?: CustomAnimations;
}
export type JsonTextField = AbstractJsonInlineObject & JsonAdressableObject & {
    content: string;
    title?: string;
    footer?: string;
    cssClasses?: string[] | string; // ["class-a", "class-b"] OR "class-a class-b"
    type: "text";
    animationType?: TextAnimations;
}

export type JsonInlineObject = JsonCustomObject | JsonTextField | JsonClickable;

export type JsonSchulTourConfigFile = {
    pages: JsonPage[],
}