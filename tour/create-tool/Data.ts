class PageData {
    public img: MediaData;
    public id: string;
    public is360: boolean;
    public isPanorama: boolean;
    public initialDirection: number;
    public inlineObjects: InlineObjectData[];

    constructor(img: MediaData, id: string, is360: boolean, isPanorama: boolean, initialDirection: number, inlineObjects: InlineObjectData[]) {
        this.img = img;
        this.id = id;
        this.is360 = is360;
        this.isPanorama = isPanorama;
        this.initialDirection = initialDirection;
        this.inlineObjects = inlineObjects;
    }

    static fromJSON(page: JsonPage): PageData {
        return new PageData(
            MediaData.fromJSON(page.img),
            page.id,
            page.is_360 ?? false,
            page.is_panorama ?? false,
            page.initial_direction ?? 0,
            page.inlineObjects?.map(InlineObjectData.fromJSON) ?? [],
        );
    }

    public equals(other: PageData): boolean {
        return this === other || (
            this.img.equals(other.img) &&
            this.id === other.id &&
            this.is360 === other.is360 &&
            this.initialDirection === other.initialDirection &&
            this.isPanorama === other.isPanorama &&
            (this.inlineObjects.length === other.inlineObjects.length && this.inlineObjects.map(v => other.inlineObjects.find(value => value.equals(v)) !== undefined)
                .reduce((prev, now) => prev && now, true))
        );
    }
}

class MediaData {
    public readonly src?: string;
    public readonly srcMin?: string;
    public readonly srcMax?: string;
    public readonly loading: LoadingType | "auto";
    public readonly type: MediaType;
    public readonly fetchPriority: FetchPriorityType;
    public readonly poster?: string;
    public readonly autoplay: boolean;
    public readonly muted: boolean;
    public readonly loop: boolean;
    public readonly preload: VideoPreloadType;

    public static readonly imgFileEndings = ["png", "jpeg", "jpg", "gif", "svg", "webp", "apng", "avif"];
    public static readonly videoFileEndings = ["mp4", "webm", "ogg", "ogm", "ogv", "avi"];
    //this list is not exhaustive
    public static readonly iframeUrlEndings = ["html", "htm", "com", "org", "edu", "net", "gov", "mil", "int", "de", "en", "eu", "us", "fr", "ch", "at", "au"];

    constructor(src: string | undefined, srcMin: string | undefined, srcMax: string | undefined, loading: LoadingType | "auto", type: MediaType, fetchPriority: FetchPriorityType, poster: string | undefined, autoplay: boolean, muted: boolean, loop: boolean, preload: VideoPreloadType) {
        this.src = src;
        this.srcMin = srcMin;
        this.srcMax = srcMax;
        this.loading = loading;
        this.type = type;
        this.fetchPriority = fetchPriority;
        this.poster = poster;
        this.autoplay = autoplay;
        this.muted = muted;
        this.loop = loop;
        this.preload = preload;
    }

    public static fromJSON(media: JsonMedia) {
        return new MediaData(
            media.src,
            media.srcMin,
            media.srcMax,
            media.loading ?? "auto",
            MediaData.determineType(media.type ?? "auto", media.src ?? media.srcMin ?? media.srcMax as string),
            media.fetchPriority ?? "auto",
            media.poster,
            media.autoplay ?? false,
            media.muted ?? false,
            media.loop ?? false,
            media.preload ?? "auto",
        );
    }

    public static determineType(value: MediaType | "auto", src: string): MediaType {
        let res: MediaType;
        if (value === "auto") {
            let fileSplit = src.split(".");
            let fileEnding = fileSplit[fileSplit.length - 1];
            if (MediaData.imgFileEndings.indexOf(fileEnding) > -1) {
                res = "img";
            } else if (MediaData.videoFileEndings.indexOf(fileEnding) > -1) {
                res = "video";
            } else if (MediaData.iframeUrlEndings.indexOf(fileEnding) > -1) {
                res = "iframe";
            } else {
                console.warn("Please add the file (or url) ending to the list\n'iframe' is used as default because there are endless different url endings\nFile Name which produced the Error:", src);
                res = "iframe";
            }
        } else {
            res = value;
        }
        return res;
    }

    public equals(other: MediaData): boolean {
        return this === other || (
            this.src === other.src &&
            this.srcMax === other.srcMax &&
            this.srcMin === other.srcMin &&
            this.preload === other.preload &&
            this.autoplay === other.autoplay &&
            this.fetchPriority === other.fetchPriority &&
            this.loading === other.loading &&
            this.loop === other.loop &&
            this.muted === other.muted &&
            this.poster === other.poster &&
            this.type === other.type
        );
    }
}

class InlineObjectData {
    public readonly x: number;
    public readonly y: number;
    public readonly type: InlineObjectType;
    public readonly goto?: string;
    public readonly position: InlineObjectPosition;
    public readonly animationType: PageAnimations;

    constructor(x: number, y: number, type: InlineObjectType, goto: string | undefined, position: InlineObjectPosition, animationType: PageAnimations) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.goto = goto;
        this.position = position;
        this.animationType = animationType;
    }

    static fromJSON(object: JsonInlineObject) {
        return new InlineObjectData(
            typeof object.x === "number" ? object.x : parseFloat(object.x),
            typeof object.y === "number" ? object.y : parseFloat(object.y),
            object.type,
            object.goto,
            object.position,
            object.animationType ?? "forward",
        );
    }

    public equals(other: InlineObjectData): boolean {
        return this == other || (
            this.x === other.x &&
            this.y === other.y &&
            this.type === other.type &&
            this.position === other.position &&
            this.animationType === other.animationType &&
            this.goto === other.goto
        );
    }
}

export {PageData, InlineObjectData, MediaData};