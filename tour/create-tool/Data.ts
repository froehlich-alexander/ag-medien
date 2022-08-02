type DataType<T> = Omit<{ [k in keyof T as T[k] extends Function ? never : k]: T[k] }, never>;
type PageDataType = DataType<PageData>

class PageData {
    public img: MediaData;
    public id: string;
    public is360: boolean;
    public isPanorama: boolean;
    public initialDirection: number;
    public inlineObjects: InlineObjectData[];

    constructor({
                    img,
                    id,
                    is360,
                    isPanorama,
                    initialDirection,
                    inlineObjects,
                }: PageDataType) {
        this.img = img;
        this.id = id;
        this.is360 = is360;
        this.isPanorama = isPanorama;
        this.initialDirection = initialDirection;
        this.inlineObjects = inlineObjects;
    }

    static fromJSON(page: JsonPage): PageData {
        return new PageData({
            img: MediaData.fromJSON(page.img),
            id: page.id,
            is360: page.is_360 ?? false,
            isPanorama: page.is_panorama ?? false,
            initialDirection: page.initial_direction ?? 0,
            inlineObjects: page.inlineObjects?.map(InlineObjectData.fromJSON) ?? [],
        });
    }

    public equals(other: DataType<PageData>): boolean {
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

    public withUpdate(other: Partial<PageData>): PageData {
        return new PageData({...this, ...other});
    }
}

class MediaData {
    public readonly src?: SourceData;
    public readonly srcMin?: SourceData;
    public readonly srcMax?: SourceData;
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

    constructor(src: SourceData | undefined, srcMin: SourceData | undefined, srcMax: SourceData | undefined, loading: LoadingType | "auto", type: MediaType, fetchPriority: FetchPriorityType, poster: string | undefined, autoplay: boolean, muted: boolean, loop: boolean, preload: VideoPreloadType) {
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
            media.src != null ? typeof media.src === "string" ? new SourceData({name: media.src}) : media.src : undefined,
            media.srcMin != null ? typeof media.srcMin === "string" ? new SourceData({name: media.srcMin}) : media.srcMin : undefined,
            media.srcMax != null ? typeof media.srcMax === "string" ? new SourceData({name: media.srcMax}) : media.srcMax : undefined,
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

class SourceData {
    readonly name: string;
    // natural width
    readonly width?: number;
    // natural height
    readonly height?: number;

    // create tool only
    readonly file?: FileData;

    constructor({name, width, height, file}: DataType<SourceData>) {
        this.name = name;
        this.file = file;
        this.width = width;
        this.height = height;
        // if (!width || !height) {
        //     this.file?.computeWidthHeight()
        //         .then(([w, h]) => {
        //             console.log("w, h", w, h);
        //             this.width = w;
        //             this.height = h;
        //         });
        // }
    }

    public static async fromFile(file: File): Promise<SourceData> {
        const fileData = FileData.fromFile(file);
        const [width, height] = await fileData.computeWidthHeight();
        return new SourceData({
            name: file.name,
            file: fileData,
            width: width,
            height: height,
        });
    }

    public withUpdate(other: DataType<SourceData>): SourceData {
        return new SourceData(other);
    }
}

class FileData {
    name: string;
    size: number;
    type: MediaType;
    file: File;
    private readonly img: HTMLImageElement;
    private readonly video: HTMLVideoElement;

    protected constructor({name, file, size, type}: DataType<FileData>) {
        this.name = name;
        this.size = size;
        this.type = type;
        this.file = file;
        this.img = document.createElement("img");
        // this.img.style.display = "none";
        this.video = document.createElement("video");
        this.video.style.display = "none";
        this.video.preload = "metadata";
        // document.body.append(this.img, this.video);
    }

    public static fromFile(file: File): FileData {
        return new FileData({
            name: file.name,
            size: file.size,
            file: file,
            type: MediaData.determineType("auto", file.name),
        });
    }

    public async computeWidthHeight(): Promise<[number, number]> {
        if (!this.type) {
            this.type = MediaData.determineType("auto", this.name);
        }

        let res: [number, number] | undefined;

        const url = URL.createObjectURL(this.file);
        console.log("media url:", url);

        const cleanup = () => {
            console.log(this.img.naturalWidth);
            URL.revokeObjectURL(url);
            this.video.src = "";
            this.img.src = "";
        };

        return new Promise<[number, number]>((resolve, reject) => {
            if (this.type === "img") {
                this.img.onload = () => {
                    resolve([this.img.naturalWidth, this.img.naturalHeight]);
                    cleanup();
                };
                this.img.src = url;
                // res = [this.img.naturalWidth, this.img.naturalHeight];
            } else if (this.type === "video") {
                this.video.onloadeddata = () => {
                    resolve([this.video.videoWidth, this.video.videoHeight]);
                    cleanup();
                };
                this.video.src = url;
                // res = [this.video.videoWidth, this.video.videoHeight]
            } else {
                cleanup();
                reject();
            }
        });
        console.log("res", res);
        // clean up
        // this.img.src = "";
        // this.video.src = "";
        // URL.revokeObjectURL(url);
        // return res;
    }
}

export {PageData, InlineObjectData, MediaData, PageDataType, SourceData, FileData};