import classNames from "classnames";
import * as React from "react";
import {ChangeEvent, useCallback, useMemo} from "react";
import {CloseButton, Col, Container, FormSelect, Nav, Navbar} from "react-bootstrap";
import {useTranslation} from "react-i18next";
import {showDialog} from "./store/dialog";
import {useAppDispatch, useAppSelector} from "./store/hooks";
import {DefaultProps} from "./utils";

interface Props extends DefaultProps {
}

export function MyNavBar({className}: Props) {
    const {t, i18n} = useTranslation("mainPage", {keyPrefix: "navBar"});
    const dispatch = useAppDispatch();
    const dialog = useAppSelector(state => state.dialog);

    const showImportDialog = useCallback(() => {
        // dialogContext.setImportDialogVisibility(true);
        dispatch(showDialog("import"));
    }, []);

    const showMediaDialog = useCallback(() => {
        dispatch(showDialog("media"));
    }, []);

    const showTourPreviewDialog = useCallback(() => {
        dispatch(showDialog("tourPreview"));
    }, []);

    const handleLanguageChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
        const lang = event.target.value;
        i18n.changeLanguage(lang);
    }, [i18n]);

    const langs = useMemo(() => ({
        en: "English",
        de: "Deutsch",
    }), []);

    return (
        <Navbar variant="light" bg="light" expand="lg" className={classNames(className, "rounded-2")}>
            <Container fluid>
                <Navbar.Brand>
                    Schultour Developer Tool
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="navbar-collapse"/>
                <Navbar.Collapse id="navbar-collapse" className="me-auto">
                    <Nav>
                        <Nav.Link key="load" active={dialog.import} onClick={showImportDialog}>
                            {t("importPages")}
                        </Nav.Link>
                        <Nav.Link key="media" active={dialog.media} onClick={showMediaDialog}>
                            {t("media")}
                        </Nav.Link>
                        <Nav.Link key="tourPreview" active={dialog.tourPreview} onClick={showTourPreviewDialog}>
                            {t('tourPreview')}
                        </Nav.Link>
                    </Nav>
                </Navbar.Collapse>
                <Col sm="auto" className="me-2">
                    <FormSelect value={i18n.language} onChange={handleLanguageChange} size="sm">
                        {(i18n.options.supportedLngs as string[]).map(value => value.slice(-2))
                            .filter((value, index, array) => array.indexOf(value) === index)
                            .map(value => <option key={value} value={value}>
                                {langs[value as keyof typeof langs] ?? value}
                            </option>)}
                    </FormSelect>
                    <label htmlFor="language-select" className="visually-hidden">{t("language.label")}</label>
                </Col>
                <CloseButton/>
            </Container>
        </Navbar>
    );
}
