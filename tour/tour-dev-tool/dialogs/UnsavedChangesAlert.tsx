import React, {useCallback, useContext, useMemo} from "react";
import {Alert, Button, Col, Row} from "react-bootstrap";
import {Trans, useTranslation} from "react-i18next";
import {hideDialog} from "../store/dialog";
import {useAppDispatch, useAppSelector} from "../store/hooks";
import {FormContext, PageContext} from "../TourContexts";

type UnsavedChangesAlertProps = {}

export default function UnsavedChangesAlert({}: UnsavedChangesAlertProps) {
    const pageContext = useContext(PageContext);
    const formContext = useContext(FormContext);
    const dispatch = useAppDispatch();
    const visibility = useAppSelector(state=>state.dialog.unsavedChanges);

    const {t} = useTranslation("dialog", {keyPrefix: 'unsavedChangesAlert'});
    const {t: tGlob} = useTranslation("translation");

    const pageName = useMemo(() => {
        return pageContext.currentPage?.id ?? tGlob('notAvailable');
    }, [pageContext.currentPage?.id, tGlob]);

    const handleClose = useCallback(() => {
        dispatch(hideDialog("unsavedChanges"));
    }, []);

    const handleDiscard = useCallback(() => {
        formContext.reset();
        handleClose();
    }, [handleClose, formContext.reset]);

    const handleSave = useCallback(() => {
        formContext.save();
        handleClose();
    }, [handleClose, formContext.save]);

    return (
        <Alert show={visibility} dismissible onClose={handleClose}
               className="UnsavedChangesAlert">
            <p>
                <Trans ns="dialog" i18nKey={'unsavedChangesAlert.text'}>
                    You have modified <code>{{pageName}}</code>. Do you want
                    to <samp>{tGlob('save')}</samp> or <samp>{tGlob('discard')}</samp> the changes?
                </Trans>
            </p>
            <Row className="g-3 row-cols-auto">
                <Col><Button variant="primary" onClick={handleSave}>{tGlob('save')}</Button></Col>
                <Col><Button variant="warning" onClick={handleDiscard}>{tGlob('discard')}</Button></Col>
                <Col><Button variant="secondary" onClick={handleClose}>{tGlob('cancel')}</Button></Col>
            </Row>
        </Alert>
    );
};
