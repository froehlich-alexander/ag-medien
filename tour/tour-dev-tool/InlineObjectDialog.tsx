import React, {useCallback, useContext, useEffect} from "react";
import {Button, Form, Modal} from "react-bootstrap";
import {useTranslation} from "react-i18next";
import {InlineObjectData} from "../Data";
import InlineObjectForm from "./InlineObjectForm";
import {hideDialog} from "./store/dialog";
import {reset, set} from "./store/editInlineObject";
import {useAppDispatch, useAppSelector} from "./store/hooks";
import {PageContext, TourPreviewContext} from "./TourContexts";

function InlineObjectDialog({}) {
    const {t} = useTranslation("dialog", {keyPrefix: "inlineObject"});
    const {t: tGlob} = useTranslation("translation");
    const visibility = useAppSelector(state => state.dialog.inlineObjectEdit);
    const currentInlineObject = useAppSelector(state => state.currentInlineObject);
    const dispatch = useAppDispatch();
    const pageContext = useContext(PageContext);
    const tourPreviewContext = useContext(TourPreviewContext);

    const hide = useCallback(() => {
        dispatch(hideDialog("inlineObjectEdit"));
    }, []);

    const save = useCallback(() => {
        const page = tourPreviewContext.pages.find(v => v.id === pageContext.currentPage!.id)!;
        const inlineObjects = page.inlineObjects.slice();
        inlineObjects[currentInlineObject.index] = currentInlineObject.data!;
        tourPreviewContext.update(page.withInlineObjects(inlineObjects));
        hide();
    }, [currentInlineObject.data, currentInlineObject.index, pageContext.currentPage?.id]);

    const handleChange = useCallback((inlineObject: InlineObjectData, index: number) => {
        dispatch(set([inlineObject, index]));
    }, []);

    // reset if current page changes
    useEffect(() => {
        dispatch(reset());
    }, [pageContext.currentPage?.id]);

    return (<>
            {currentInlineObject.data && pageContext.currentPage &&
                <Modal show={visibility} onHide={hide} size={"xl"} centered>
                    <Modal.Header>
                        <Modal.Title>{t("title")}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <InlineObjectForm inlineObject={currentInlineObject.data} onChange={handleChange}
                                              index={currentInlineObject.index}/>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={save}>{tGlob("save")}</Button>
                        <Button onClick={hide}>{tGlob("close")}</Button>
                    </Modal.Footer>
                </Modal>
            }
        </>
    );
}

export default InlineObjectDialog;
