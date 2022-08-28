import {useCallback, useEffect, useMemo, useState} from "react";
import {DialogContextType, FormContextType, ListViewContextType, PageContextType} from "../TourContexts";

export default function useListView(pageContext: PageContextType, formContext: FormContextType, dialogContext: DialogContextType) {
    // null == nothing scheduled
    const [scheduledSetCurrentPage, setScheduledSetCurrentPage] = useState<string | undefined | null>(null);

    const requestSetCurrentPage = useCallback((id: string | undefined) => {
        if (pageContext.currentPage?.id === id) {
            if (scheduledSetCurrentPage !== id) {
                setScheduledSetCurrentPage(null);
            }
            return;
        }
        if (!formContext.isModified) {
            pageContext.setCurrentPage(id);
            setScheduledSetCurrentPage(null);
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

    const listViewContext: ListViewContextType = useMemo(() => ({
        requestSetCurrentPage: requestSetCurrentPage,
        schedulesCurrentPage: scheduledSetCurrentPage,
    } as ListViewContextType), [requestSetCurrentPage, scheduledSetCurrentPage]);

    return {
        requestSetCurrentPage,
        scheduledSetCurrentPage,
        listViewContext,
    };
};
