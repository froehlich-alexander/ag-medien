import {useCallback, useMemo, useState} from "react";
import {DialogContextType} from "../TourContexts";

export default function useDialog() {

    const [importDialogVisibility, setImportDialogVisibility] = useState(false);
    const [mediaDialogVisibility, setMediaDialogVisibility] = useState(false);
    const [unsavedChangesAlertVisibility, setUnsavedChangesAlertVisibility] = useState(false);

    const showImportDialog = useCallback(() => {
        setImportDialogVisibility(true);
    }, []);

    const showMediaDialog = useCallback(() => {
        setMediaDialogVisibility(true);
    }, []);
    
    const showUnsavedChangesAlert = useCallback(() => {
        setUnsavedChangesAlertVisibility(true);
    }, []);
    
    const dialogContext: DialogContextType = useMemo(() => ({
        mediaDialogVisibility,
        setMediaDialogVisibility,
        showMediaDialog,

        importDialogVisibility,
        setImportDialogVisibility,
        showImportDialog,

        unsavedChangesAlertVisibility: unsavedChangesAlertVisibility,
        setUnsavedChangesAlertVisibility: setUnsavedChangesAlertVisibility,
        showUnsavedChangesAlert: showUnsavedChangesAlert,
    }), [importDialogVisibility,mediaDialogVisibility, unsavedChangesAlertVisibility]);

    return {
        mediaDialogVisibility,
        setMediaDialogVisibility,
        showMediaDialog,

        importDialogVisibility,
        setImportDialogVisibility,
        showImportDialog,

        unsavedChangesAlertVisibility,
        setUnsavedChangesAlertVisibility,
        showUnsavedChangesAlert,

        dialogContext,
    }
};
