import {useCallback, useEffect, useMemo, useState} from "react";
import {PageData, SchulTourConfigFile} from "../../Data";
import Store from "../store";
import {MediaContextType, PageContextType} from "../TourContexts";
import useDataList from "./DataListReducer";

/**
 * manages pages and currentPage<br>
 * Does <b>not</b> abstract it in any way and is <b>not</b> intended to reuse anywhere else
 * @param mediaContext
 * @param configFile
 */
function usePages(mediaContext: MediaContextType, configFile: FileSystemFileHandle | undefined, store: typeof Store) {

    const [currentPage, setCurrentPage] = useState<PageData>();
    const [initialPage, setInitialPage] = useState<string|undefined>();


    const handlePagesAddUpdate = useCallback((pages: PageData[]) => {
        return Promise.all(pages.map(value => value.complete(mediaContext)))
            .then(pages => updatePages(pages));
    }, [mediaContext]);

    const [pages, {
        add: addPages,
        update: updatePages,
        remove: removePages,
        reset: resetPages,
        replace: replace,
    }] = useDataList<PageData, string>([], (page => typeof page === "string" ? page : page.id),
        undefined, handlePagesAddUpdate, handlePagesAddUpdate);


    const setCurrentPageById = useCallback((id: string | undefined | null) => {
        setCurrentPage(pages.find(value => value.id === id));
    }, [pages]);

    const replacePages = useCallback((...items: [string, PageData][]) => {
        replace(...items);
        for (let [k, page] of items) {
            if (k === currentPage?.id) {
                setCurrentPage(page);
            }
        }
    }, [currentPage?.id]);

    // write current page to local storage
    useEffect(() => {
        if (currentPage) {
            window.localStorage.setItem('current_page', currentPage.id);
        }
    }, [currentPage]);
    
    useEffect(() => {
        setCurrentPageById(currentPage?.id)
    }, [pages]);

    // write fs pages
    useEffect(() => {
        if (!configFile)
            return;

        const config = new SchulTourConfigFile({
            pages: pages,
            initialPage:initialPage,
        });
        (async function () {
            const stream = (await configFile.createWritable());
            await stream.write(JSON.stringify(config));
            await stream.close();
        })();

    }, [pages, configFile]);

    const pageContext: PageContextType = useMemo(() => ({
        pages: pages,

        addPages: addPages,
        updatePages: updatePages,
        removePages: removePages,
        resetPages: resetPages,
        replacePages: replacePages,

        currentPage: currentPage,
        setCurrentPage: setCurrentPageById,

        initialPage: initialPage,
        setInitialPage: setInitialPage,
    }), [pages, setCurrentPageById, currentPage, initialPage]);

    return {
        pages, addPages, updatePages, removePages, resetPages,replacePages,
        currentPage, setCurrentPage, setCurrentPageById,
        initialPage, setInitialPage,
        pageContext,
    };
}

export default usePages;
