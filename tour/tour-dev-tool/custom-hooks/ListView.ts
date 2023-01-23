import {useCallback, useEffect, useMemo, useState} from "react";
import type Store from "../store";
import {showDialog} from "../store/dialog";
import {FormContextType, ListViewContextType, PageContextType} from "../TourContexts";

export default function useListView(pageContext: PageContextType, formContext: FormContextType, store: typeof Store) {
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
            store.dispatch(showDialog("unsavedChanges"));
            // dialogContext.showUnsavedChangesAlert();
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
