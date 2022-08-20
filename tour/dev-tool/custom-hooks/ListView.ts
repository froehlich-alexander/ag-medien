import {useCallback, useEffect, useMemo, useState} from "react";
import {DialogContextType, FormContextType, PageContextType} from "../TourContexts";

export default function useListView(pageContext: PageContextType, formContext: FormContextType, dialogContext: DialogContextType) {
    const [scheduledSetCurrentPage, setScheduledSetCurrentPage] = useState<string | undefined | null>(null);

    const requestSetCurrentPage = useCallback((id: string | undefined) => {
        if (pageContext.currentPage?.id === id) {
            return;
        }
        if (!formContext.isModified) {
            pageContext.setCurrentPage(id);
        } else {
            setScheduledSetCurrentPage(id);
            dialogContext.showUnsavedChangesAlert();
        }
    }, [pageContext.currentPage?.id, formContext.isModified, pageContext.setCurrentPage]);

    useEffect(() => {
        if (!formContext.isModified && scheduledSetCurrentPage !== null) {
            pageContext.setCurrentPage(scheduledSetCurrentPage);
            setScheduledSetCurrentPage(null);
        }
    }, [formContext.isModified, scheduledSetCurrentPage]);

    const listViewContext = useMemo(() => ({
        requestSetCurrentPage: requestSetCurrentPage,
    }), [requestSetCurrentPage]);

    return {
        requestSetCurrentPage,
        listViewContext,
    };
};
