import {useCallback, useEffect, useMemo, useState} from "react";
import {PageData} from "../../Data";
import {PageContextType, TourPreviewContextType} from "../TourContexts";

function useTourPreview(pageContext: PageContextType) {
    const [pages, setPages] = useState<Readonly<Array<PageData>>>([]);

    const save = useCallback(() => {
        pageContext.updatePages(pages);
    }, [pages]);

    const updatePage = useCallback((page: PageData) => {
        const newPages = pages.slice();
        newPages[pages.findIndex(v => v.id === page.id)] = page;
        setPages(newPages);
    }, [pages]);

    const reset = useCallback(() => {
        setPages(pageContext.pages);
    }, [pageContext.pages]);

    const tourPreviewContext: TourPreviewContextType = useMemo(() => {
        return {
            pages: pages,
            save: save,
            update: updatePage,
            reset: reset,
        }
    }, [pages, save, updatePage]);

    // reset
    useEffect(() => {
        reset();
    }, [reset]);

    return {
        tourPreviewContext,
        pages,
        save,
        updatePage,
    }
}

export default useTourPreview;
