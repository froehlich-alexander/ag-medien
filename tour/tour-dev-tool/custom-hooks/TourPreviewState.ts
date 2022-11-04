import {useCallback, useEffect, useMemo, useState} from "react";
import {PageData} from "../../Data";
import {PageContextType, TourPreviewContextType} from "../TourContexts";

function useTourPreview(pageContext: PageContextType) {
    const [pages, setPages] = useState<Readonly<Array<PageData>>>([]);

    const save = useCallback(() => {
        pageContext.updatePages(pages);
    }, [pages]);

    const updatePage = useCallback((page: PageData) => {
        setPages(pages => {
            const newPages = pages.slice();
            const index = pages.findIndex(v => v.id === page.id);
            if (index < 0) {
                console.error("index cant be < 0", index, pages, page);
            }
            newPages[index] = page;
            return newPages;
        });
    }, []);

    const currentPage = useMemo(() => {
        return pages.find(v => v.id === pageContext.currentPage?.id);
    }, [pages, pageContext.currentPage?.id]);

    const reset = useCallback(() => {
        setPages(pageContext.pages);
    }, [pageContext.pages]);

    const tourPreviewContext: TourPreviewContextType = useMemo(() => {
        return {
            pages: pages,
            currentPage: currentPage,
            save: save,
            update: updatePage,
            reset: reset,
        };
    }, [pages, save, updatePage, reset]);

    // reset
    useEffect(() => {
        reset();
    }, [reset]);

    return {
        tourPreviewContext,
        pages,
        save,
        updatePage,
    };
}

export default useTourPreview;
