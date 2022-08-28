import {useCallback, useEffect, useMemo, useState} from "react";
import {PageData} from "../../Data";
import {renameAddressableId} from "../refactor-data";
import {FormContextType, PageContextType} from "../TourContexts";

export default function useForms(pageContext: PageContextType) {
    const currentPage = pageContext.currentPage;
    const [pageData, setPageData] = useState<PageData | undefined>(currentPage);
    const [renamePageIdUsages, setRenamePageIdUsages] = useState(true);

    const resetForm = useCallback(() => {
        setPageData(currentPage);
    }, [currentPage]);

    const formIsModified = useMemo(() => {
        return pageData?.equals(currentPage) === false;
    }, [pageData, currentPage]);

    const saveForm = useCallback(() => {
        if (pageData && currentPage && formIsModified) {
            pageContext.replacePages([currentPage.id, pageData]);
            if (pageData.id !== currentPage.id) {
                if (renamePageIdUsages) {
                    pageContext.replacePages(...renameAddressableId(currentPage.id, pageData.id, pageContext.pages));
                }
                // setTimeout(() => pageContext.setCurrentPage(pageData.id));
            }
        }
    }, [pageData, currentPage, renamePageIdUsages, formIsModified]);

    useEffect(() => {
        resetForm();
    }, [resetForm]);


    const formContext: FormContextType = useMemo(() => ({
        page: pageData,
        renamePageIdUsages: renamePageIdUsages,
        save: saveForm,
        reset: resetForm,
        isModified: formIsModified,
    }), [saveForm, resetForm, pageData, formIsModified]);

    return {
        page: pageData,
        renamePageIdUsages: renamePageIdUsages,
        setRenamePageIdUsages: setRenamePageIdUsages,
        setPage: setPageData,
        resetForm,
        saveForm,
        formIsModified,
        formContext,
    };
};
