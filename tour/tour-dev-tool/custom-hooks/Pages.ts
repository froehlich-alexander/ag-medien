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
 * @param store
 */
function usePages(mediaContext: MediaContextType, configFile: FileSystemFileHandle | undefined, store: typeof Store) {

    const [currentPage, setCurrentPage] = useState<PageData>();
    const [tourConfig, setTourConfig] = useState<SchulTourConfigFile>(SchulTourConfigFile.default());

    const handlePagesAddUpdate = useCallback((pages: readonly PageData[]) => {
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


    const setCurrentPageById = useCallback((id: Readonly<string | undefined | null>) => {
        setCurrentPage(pages.find(value => value.id === id));
    }, [pages]);

    const replacePages = useCallback((...items: readonly [string, PageData][]) => {
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

    useEffect(() => {
        setTourConfig(tourConfig!.withPages(pages));
    }, [pages]);

    // write fs config
    useEffect(() => {
        if (!configFile)
            return;
        (async function () {
            // const config = new SchulTourConfigFile({
            //     pages: pages,
            //     initialPage:initialPage,
            //     colorTheme: store.getState().TourConfig.colorTheme,
            //     mode: store
            // });

            const stream = (await configFile.createWritable());
            await stream.write(JSON.stringify(tourConfig));
            await stream.close();
        })();

    }, [tourConfig, configFile]);

    const pageContext: PageContextType = useMemo(() => ({
        pages: pages,

        addPages: addPages,
        updatePages: updatePages,
        removePages: removePages,
        resetPages: resetPages,
        replacePages: replacePages,

        tourConfig: tourConfig,
        setTourConfig: setTourConfig,

        currentPage: currentPage,
        setCurrentPage: setCurrentPageById,

    }), [pages, setCurrentPageById, currentPage]);

    return {
        pages, addPages, updatePages, removePages, resetPages,replacePages,
        currentPage, setCurrentPage, setCurrentPageById,
        tourConfig, setTourConfig,
        pageContext,
    };
}

export default usePages;
