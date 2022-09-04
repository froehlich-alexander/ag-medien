import React, {createRef, memo, useCallback, useContext, useEffect, useReducer, useState} from "react";
import {Button, Modal} from "react-bootstrap";
import {useTranslation} from "react-i18next";
import {DataType, InlineObjectData, PageData} from "../Data";
import Tour, {Page} from "../tour";
import "./CreateTool.scss";
import {hideDialog, showDialog} from "./store/dialog";
import {set} from "./store/editInlineObject";
import {useAppDispatch, useAppSelector} from "./store/hooks";
import {PageContext} from "./TourContexts";

interface TourPreviewProps {
}

function TourPreview({}: TourPreviewProps) {
    const {t} = useTranslation("dialog", {keyPrefix: "tourPreview"});
    const {t: tGlob} = useTranslation("translation");
    const pageContext = useContext(PageContext);
    const visibility = useAppSelector(state => state.dialog.tourPreview);
    const dispatch = useAppDispatch();
    const [, forceUpdate] = useReducer(x => x + 1, 0);

    const [pageDatas, setPageDatas] = useState<Array<PageData>>([]);

    const hide = useCallback(() => {
        dispatch(hideDialog("tourPreview"));
    }, []);

    const save = useCallback(() => {
        pageContext.updatePages(pageDatas);
    }, [pageDatas]);

    const saveAndHide = useCallback(() => {
        save();
        hide();
    }, [save]);

    const handlePageChange = useCallback((page: PageData) => {
        const newPages = pageDatas.slice();
        newPages[pageDatas.findIndex(v => v.id === page.id)] = page;
        setPageDatas(newPages);
    }, [pageDatas]);

    useEffect(() => {
        setPageDatas(pageContext.pages);
    }, [pageContext.pages]);

    useEffect(() => {
        for (let page of Tour.pages) {
            if (pageContext.currentPage?.id === page.id) {
                page.initialActivate(Tour.pages);
                break
            }
        }
    }, [pageContext.currentPage?.id, Tour.pages]);

    const handlePageAdd = useCallback((page: Page) => {
        Tour.pages = [...Tour.pages, page];
        // Tour.pages.push(page);
        forceUpdate();
    }, [Tour.pages]);


    const handlePageRemove = useCallback((page: Page) => {
        Tour.pages = Tour.pages.filter(v => v !== page);
        // Tour.pages.splice(Tour.pages.findIndex(v => v.id === page.id)!, 1);
        forceUpdate();
    }, [Tour.pages]);

    return (
        <Modal onHide={hide} show={visibility} fullscreen className="TourPreviewDialog">
            <Modal.Header>
                <Modal.Title>{t("title")}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="Body">
                <div className="schul-tour" data-color-theme="light" data-tour-mode="inline">
                    {pageDatas.map(pageData =>
                        <TourPage key={pageData.id} pageData={pageData} onChange={handlePageChange}
                                  addPage={handlePageAdd} removePage={handlePageRemove}/>,
                    )}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={save}>{tGlob("save")}</Button>
                <Button variant="primary" onClick={saveAndHide}>
                    {[tGlob("save"), tGlob("and"), tGlob("exit")].join(" ")}
                </Button>
                <Button onClick={hide} variant="secondary">{tGlob("close")}</Button>
            </Modal.Footer>
        </Modal>
    );
}

interface TourPageProps {
    pageData: PageData;
    onChange: (page: PageData) => void,
    addPage: (page: Page) => void,
    removePage: (page: Page) => void,
}

const TourPage = memo(({pageData, onChange, addPage, removePage}: TourPageProps) => {
    const pageContainerRef = createRef<HTMLDivElement>();
    const dispatch = useAppDispatch();
    const pageContext = useContext(PageContext);
    const [page, setPage] = useState(Page.from(pageData));

    const handleChange = useCallback((changes: Partial<DataType<PageData>>) => {
        onChange(pageData.withUpdate(changes));
    }, [pageData, onChange]);

    const handleInlineObjectEditClick = useCallback((index: number, inlineObject: InlineObjectData) => {
        dispatch(set([inlineObject, index]));
        dispatch(showDialog("inlineObjectEdit"));
    }, [pageData.inlineObjects]);

    useEffect(() => {
        page.handleUpdate = handleChange;
        page.handleInlineObjectEditClick = handleInlineObjectEditClick;
        page.onCurrentPageChange = pageContext.setCurrentPage;
    }, [handleChange, handleInlineObjectEditClick, pageContext.setCurrentPage, page]);

    useEffect(() => {
        addPage(page);
        return () => {
            removePage(page);
        };
    }, [page, addPage, removePage]);

    useEffect(() => {
        const page = Page.from(pageData);
        setPage(page);

        // addPage(page);
        pageContainerRef.current!.append(page.html[0]);
        return () => {
            pageContainerRef.current?.removeChild(page.html[0]);
            // removePage(page);
        };
    }, [pageData]);

    return (
        <span ref={pageContainerRef}></span>
    );
}, (props, prevProps) => props.pageData.equals(prevProps.pageData));

export default TourPreview;
