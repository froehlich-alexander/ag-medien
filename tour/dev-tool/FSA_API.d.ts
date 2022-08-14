export {};

declare global {
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/showDirectoryPicker
     * @param options
     */
    function showDirectoryPicker(options?: {
        id?: string,
        mode?: 'read' | 'readwrite',
        startIn?: FileSystemHandle | "desktop" | "documents" | "downloads" | "music" | "pictures" | "videos",
    }): Promise<FileSystemDirectoryHandle>;
}
