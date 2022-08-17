import {useCallback, useMemo, useState} from "react";
import {DialogContextType} from "../TourContexts";

export default function useDialog() {

    const [importDialogVisibility, setImportDialogVisibility] = useState(false);
    const [mediaDialogVisibility, setMediaDialogVisibility] = useState(true);

    const showImportDialog = useCallback(() => {
        setImportDialogVisibility(true);
    }, []);

    const showMediaDialog = useCallback(() => {
        setMediaDialogVisibility(true);
    }, []);
    
    const dialogContext: DialogContextType = useMemo(() => ({
        mediaDialogVisibility,
        setMediaDialogVisibility,
        showMediaDialog,

        importDialogVisibility,
        setImportDialogVisibility,
        showImportDialog
    }), [importDialogVisibility,mediaDialogVisibility]);

    return {
        mediaDialogVisibility,
        setMediaDialogVisibility,
        showMediaDialog,

        importDialogVisibility,
        setImportDialogVisibility,
        showImportDialog,

        dialogContext,
    }
};
