import {useCallback, useEffect, useMemo, useState} from "react";
import {AbstractAddressableInlineObjectData, PageData} from "../../Data";
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

    const idPattern: string = useMemo(() => {
        const inlineObjectIds = pageContext.pages.map(v => v.inlineObjects).flat().filter((v) => v.isAddressable())
            .map(v => (v as AbstractAddressableInlineObjectData<any, any>).id);
        // https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/pattern --- implicit surrounded by ^(?:PATTERN)$
        // must be different from other id except own id
        // only a-zA-Z0-9-_ are allowed
        // ^(?!(xxx|xx)$) return false if tested with xxx or xx , BUT it does not match anything. That's because we need the [a-z...]* at the end
        return `^(?!(${pageContext.pages.map(v => v.id).concat(inlineObjectIds).join("|")})$)[a-zA-Y0-9-_]*`;
    }, [pageContext.pages, pageContext.currentPage?.id]);

    const getIdPatter = useCallback((ownId: string | undefined) => {
        if (ownId) {
            return `^${ownId}$|${idPattern}`;
        }
        return idPattern;
    }, [idPattern]);

    useEffect(() => {
        resetForm();
    }, [resetForm]);


    const formContext: FormContextType = useMemo(() => ({
        page: pageData,
        renamePageIdUsages: renamePageIdUsages,
        save: saveForm,
        reset: resetForm,
        isModified: formIsModified,
        idPattern: getIdPatter,
    }), [saveForm, resetForm, pageData, formIsModified, getIdPatter]);

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
