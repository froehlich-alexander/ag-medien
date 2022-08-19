import classNames from "classnames";
import * as React from "react";
import {ChangeEvent, useCallback, useContext, useMemo} from "react";
import {CloseButton, Col, Container, FormSelect, InputGroup, Nav, Navbar} from "react-bootstrap";
import {useTranslation} from "react-i18next";
import {DialogContext} from "./TourContexts";
import {DefaultProps} from "./utils";

interface Props extends DefaultProps {
}

export function MyNavBar({className}: Props) {
    const dialogContext = useContext(DialogContext);
    const {t, i18n} = useTranslation("mainPage", {keyPrefix: 'navBar'});

    const showImportDialog = useCallback(() => {
            dialogContext.setImportDialogVisibility(true);
        },
        [dialogContext.setImportDialogVisibility]);

    const showMediaDialog = useCallback(() => {
            dialogContext.setMediaDialogVisibility(true);
        },
        [dialogContext.setMediaDialogVisibility]);

    const handleLanguageChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
        const lang = event.target.value;
        i18n.changeLanguage(lang);
    }, [i18n]);

    const langs = useMemo(() => ({
        en: "English",
        de: 'Deutsch',
    }), []);

    return (
        <Navbar variant="light" bg="light" expand="lg" className={classNames(className, 'rounded-2')}>
            <Container fluid>
                <Navbar.Brand>
                    Schultour Developer Tool
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="navbar-collapse"/>
                <Navbar.Collapse id="navbar-collapse" className="me-auto">
                    <Nav>
                        <Nav.Link key="load" active={dialogContext.importDialogVisibility} onClick={showImportDialog}>
                            {t('importPages')}
                        </Nav.Link>
                        <Nav.Link key="media" active={dialogContext.mediaDialogVisibility} onClick={showMediaDialog}>
                            {t('media')}
                        </Nav.Link>
                    </Nav>
                </Navbar.Collapse>
                <Col sm="auto" className="me-2">
                    <FormSelect value={i18n.language} onChange={handleLanguageChange} size="sm">
                        {(i18n.options.supportedLngs as string[]).map(value => value.slice(-2)).map(value =>
                            <option value={value}>{langs[value as keyof typeof langs] ?? value}</option>)}
                    </FormSelect>
                    <label htmlFor="language-select" className="visually-hidden">{t('language.label')}</label>
                </Col>
                <CloseButton/>
            </Container>
        </Navbar>
    );
}
