import {useCallback, useEffect, useMemo, useState} from "react";
import {PageData} from "../../Data";
import {FormContextType} from "../TourContexts";

export default function useForms(currentPage: PageData | undefined, updatePages: (page: PageData) => void) {
    const [pageData, setPageData] = useState<PageData | undefined>(currentPage);

    const resetForm = useCallback(() => {
        setPageData(currentPage);
    }, [currentPage]);

    const saveForm = useCallback(() => {
        if (pageData) {
            updatePages(pageData);
        }
    }, [pageData]);

    const formIsModified = useMemo(() => {
        return pageData?.equals(currentPage) === false;
    }, [pageData, currentPage]);

    useEffect(() => {
        setPageData(currentPage);
    }, [currentPage]);


    const formContext: FormContextType = useMemo(() => ({
        page: pageData,
        save: saveForm,
        reset: resetForm,
        isModified: formIsModified,
    }), [saveForm, resetForm, pageData, formIsModified]);

    return {
        page: pageData,
        setPage: setPageData,
        resetForm,
        saveForm,
        formIsModified,
        formContext,
    };
};
