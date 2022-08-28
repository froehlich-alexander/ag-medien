import React, {useCallback, useContext} from "react";
import {Button, Modal} from "react-bootstrap";
import {useTranslation} from "react-i18next";
import {FileData} from "../Data";
import {useAppDispatch, useAppSelector} from "./store/hooks";
import {DialogContext} from "./TourContexts";

interface MediaPreviewProps {
    media: FileData,
}

function MediaPreview({}: MediaPreviewProps) {
    const {t} = useTranslation("dialog", {keyPrefix: "mediaPreview"});
    const {t: tGlob} = useTranslation("translation");
    const dialogContext = useContext(DialogContext);

    const dispatch = useAppDispatch();
    const media = useAppSelector(state => state.mediaPreview.value);

    const hide = useCallback(() => {
        dialogContext.setMediaPreviewDialogVisibility(false);
    }, [dialogContext.setMediaPreviewDialogVisibility]);

    if (!media) {
        return <></>
    }

    return (
        <Modal size="xl" onHide={hide} show={dialogContext.mediaPreviewDialogVisibility}>
            <Modal.Header>
                <Modal.Title>
                    <>{t("title")} - <code>{media.name}</code></>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {media.type === "img" &&
                    <img src={media.url} alt={media.name}/>
                }
                {media.type === "video" &&
                    <video src={media.url} controls={true}></video>
                }
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={hide}>{tGlob("close")}</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default MediaPreview;
