// import {DialogContextType} from "../TourContexts";

// export default function useDialog() {
//
//     const [importDialogVisibility, setImportDialogVisibility] = useState(false);
//     const [mediaDialogVisibility, setMediaDialogVisibility] = useState(false);
//     const [unsavedChangesAlertVisibility, setUnsavedChangesAlertVisibility] = useState(false);
//     const [mediaPreviewDialogVisibility, setMediaPreviewDialogVisibility] = useState(false);
//     const [tourPagePreviewDialogVisibility, setTourPagePreviewDialogVisibility] = useState(false);
//
//     const showImportDialog = useCallback(() => {
//         setImportDialogVisibility(true);
//     }, []);
//
//     const showMediaDialog = useCallback(() => {
//         setMediaDialogVisibility(true);
//     }, []);
//
//     const showUnsavedChangesAlert = useCallback(() => {
//         setUnsavedChangesAlertVisibility(true);
//     }, []);
//
//     const showMediaPreviewDialog = useCallback(() => {
//         setMediaPreviewDialogVisibility(true);
//     }, []);
//
//     const showTourPagePreviewDialog = useCallback(() => {
//         setTourPagePreviewDialogVisibility(true);
//     }, []);
//
//     const dialogContext: DialogContextType = useMemo(() => ({
//         mediaDialogVisibility,
//         setMediaDialogVisibility,
//         showMediaDialog,
//
//         importDialogVisibility,
//         setImportDialogVisibility,
//         showImportDialog,
//
//         unsavedChangesAlertVisibility: unsavedChangesAlertVisibility,
//         setUnsavedChangesAlertVisibility: setUnsavedChangesAlertVisibility,
//         showUnsavedChangesAlert: showUnsavedChangesAlert,
//
//         mediaPreviewDialogVisibility: mediaPreviewDialogVisibility,
//         setMediaPreviewDialogVisibility: setMediaPreviewDialogVisibility,
//         showMediaPreviewDialog: showMediaPreviewDialog,
//
//         tourPagePreviewDialogVisibility,
//         setTourPagePreviewDialogVisibility,
//         showTourPagePreviewDialog,
//     }), [importDialogVisibility, mediaDialogVisibility, unsavedChangesAlertVisibility,
//         mediaPreviewDialogVisibility, tourPagePreviewDialogVisibility]);
//
//     return {
//         mediaDialogVisibility,
//         setMediaDialogVisibility,
//         showMediaDialog,
//
//         importDialogVisibility,
//         setImportDialogVisibility,
//         showImportDialog,
//
//         unsavedChangesAlertVisibility,
//         setUnsavedChangesAlertVisibility,
//         showUnsavedChangesAlert,
//
//         mediaPreviewDialogVisibility,
//         setMediaPreviewDialogVisibility,
//         showMediaPreviewDialog,
//
//         tourPagePreviewDialogVisibility,
//         setTourPagePreviewDialogVisibility,
//         showTourPagePreviewDialog,
//
//         dialogContext,
//     };
// };
