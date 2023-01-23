import {useCallback, useMemo} from "react";
import {FileData} from "../../Data";
import {MediaContextType} from "../TourContexts";
import useDataList from "./DataListReducer";

export default function useMedia(mediaDirectory: FileSystemDirectoryHandle | undefined) {

    const writeMediaFiles = useCallback((files: readonly FileData[]) => {
        console.log("write media", files, mediaDirectory);
        if (!mediaDirectory) return;

        const proms: Array<Promise<void>> = [];

        for (let file of files) {
            proms.push((async function () {
                const handle = await mediaDirectory.getFileHandle(file.name, {create: true});
                const stream = await handle.createWritable({keepExistingData: false});
                await file.file.stream().pipeTo(stream);
            })());
        }
        return Promise.all(proms);
    }, [mediaDirectory]);

    // const cleanUpMediaFiles = useCallback((files: FileData[]) => {
    //     const promises = [];
    //     for (let file of files) {
    //         for (let page of pages) {
    //             if (page.media.src?.file === file) {
    //                 promises.push(page.complete(context));
    //             }
    //         }
    //         file.cleanup();
    //     }
    //     Promise.all(promises)
    //         .then(value => updatePages(value));
    // }, [pages]);

    const deleteMediaFiles = useCallback((files: readonly FileData[]) => {
        console.log("delete media", files, mediaDirectory);
        if (!mediaDirectory) return;

        const fileNames = files.map(value => value.name);
        const proms: Array<Promise<void>> = [];

        for (let file of files) {
            file.cleanup();
        }

        for (let fileName of fileNames) {
            proms.push((async function () {
                // const handle = await mediaDirectory.getFileHandle(fileName, {create: true});
                try {
                    await mediaDirectory.removeEntry(fileName);
                } catch (e) {
                    if (e instanceof DOMException) {
                        console.log("media already deleted", fileName, e);
                    } else {
                        throw e;
                    }
                }
            })());
        }
        return Promise.all(proms);
    }, [mediaDirectory]);

    const [mediaFiles, {
        add: addMediaFiles,
        remove: removeMediaFiles,
        reset: resetMediaFiles,
        update: updateMediaFiles,
        replace: replaceMediaFiles,
    }] = useDataList<FileData, string>([], (file => typeof file === "string" ? file : file.name),
        undefined, writeMediaFiles, writeMediaFiles, deleteMediaFiles);

    const mediaContext: MediaContextType = useMemo(() => ({
        mediaFiles, resetMediaFiles, removeMediaFiles, updateMediaFiles, addMediaFiles, replaceMediaFiles,
    }), [mediaFiles]);

    return {
        mediaFiles, mediaContext,
        addMediaFiles, removeMediaFiles, resetMediaFiles, updateMediaFiles, replaceMediaFiles,
    };
};
