import React, {useCallback, useContext} from "react";
import {Button, Col, Modal} from "react-bootstrap";
import {useTranslation} from "react-i18next";
import {hideDialog} from "./store/dialog";
import {useAppDispatch, useAppSelector} from "./store/hooks";
import {next, prev} from "./store/mediaPreview";
import {MediaContext} from "./TourContexts";
import {MaterialIcon} from "./utils";

interface MediaPreviewProps {
}

function MediaPreview({}: MediaPreviewProps) {
    const {t} = useTranslation("dialog", {keyPrefix: "mediaPreview"});
    const {t: tGlob} = useTranslation("translation");
    const mediaContext = useContext(MediaContext);

    const media = useAppSelector(state => state.mediaPreview.value);
    const visibility = useAppSelector(state => state.dialog.mediaPreview);

    const dispatch = useAppDispatch();

    const hide = useCallback(() => {
        dispatch(hideDialog("mediaPreview"));
    }, []);

    const handleNext = useCallback(() => {
        dispatch(next(mediaContext.mediaFiles));
    }, [mediaContext.mediaFiles]);

    const handlePrev = useCallback(() => {
        dispatch(prev(mediaContext.mediaFiles));
    }, [mediaContext.mediaFiles]);

    return (
        !media
            ? <></>
            : <Modal size={"xl"} onHide={hide} show={visibility}>
                <Modal.Header>
                    <Modal.Title>
                        <>{t("title")} - <code>{media.name}</code></>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className={"row"}>
                    <Col sm={"auto"}>
                        <Button variant="outline-primary" onClick={handlePrev} style={{height: "100%"}}>
                            <MaterialIcon icon="navigate_before"/>
                        </Button>
                    </Col>
                    <Col>
                        {media.type === "img" &&
                            <img className="rounded img-fluid" src={media.url} alt={media.name}/>
                        }
                        {media.type === "video" &&
                            <video src={media.url} controls={true}/>
                        }
                    </Col>
                    <Col sm={"auto"}>
                        <Button variant="outline-primary" onClick={handleNext} style={{height: "100%"}}>
                            <MaterialIcon icon="navigate_next"/>
                        </Button>
                    </Col>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={handlePrev} className="d-flex align-items-center">
                        <MaterialIcon icon="navigate_before"/>
                        {tGlob("previous", {context: "div"})}
                    </Button>
                    <Button onClick={handleNext} className="d-flex align-items-center">
                        <MaterialIcon icon="navigate_next"/>
                        {tGlob("next", {context: "div"})}
                    </Button>
                    <Button variant="secondary" onClick={hide}>{tGlob("close")}</Button>
                </Modal.Footer>
            </Modal>
    );
}

export default MediaPreview;
