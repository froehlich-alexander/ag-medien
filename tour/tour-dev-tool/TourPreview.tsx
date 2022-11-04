import React, {createRef, memo, useCallback, useContext, useEffect, useReducer, useRef, useState} from "react";
import {Button, Modal} from "react-bootstrap";
import {useTranslation} from "react-i18next";
import {arrayEqualsContain} from "../utils";
import {DataType, InlineObjectData, PageData} from "../Data";
import Tour, {Page} from "../tour";
import "./CreateTool.scss";
import {useCentralPositions} from "./forms/page/inputs/CentralPositions";
import {hideDialog, showDialog} from "./store/dialog";
import {set} from "./store/editInlineObject";
import {useAppDispatch, useAppSelector} from "./store/hooks";
import {PageContext, TourPreviewContext} from "./TourContexts";

interface TourPreviewProps {
}

function TourPreview({}: TourPreviewProps) {
    const {t} = useTranslation("dialog", {keyPrefix: "tourPreview"});
    const {t: tGlob} = useTranslation("translation");
    const pageContext = useContext(PageContext);
    const {pages, save, reset, update, currentPage} = useContext(TourPreviewContext);
    const visibility = useAppSelector(state => state.dialog.tourPreview);
    const dispatch = useAppDispatch();
    const [, forceUpdate] = useReducer(x => x + 1, 0);
    const [currentPageScroll, setCurrentPageScroll] = useState<number>();
    const [htmlPages, setHtmlPages] = useState(Tour.pages);
    const [centralPositionsEditModeOn, setCentralPositionsEditModeOn] = useState(false);

    // const [pages, setPages] = useState<Readonly<Array<PageData>>>([]);

    const hide = useCallback(() => {
        if (arrayEqualsContain(pageContext.pages, pages)) {
            dispatch(hideDialog("tourPreview"));
        }
    }, [pageContext.pages, pages]);

    const saveAndHide = useCallback(() => {
        save();
        dispatch(hideDialog("tourPreview"));
    }, [save]);

    useEffect(() => {
        Tour.pages = htmlPages;
    }, [htmlPages]);

    useEffect(() => {
        for (let page of htmlPages) {
            if (pageContext.currentPage?.id === page.id) {
                page.initialActivate(htmlPages);
                break;
            }
        }
    }, [pageContext.currentPage?.id, htmlPages]);

    const handlePageAdd = useCallback((page: Page) => {
        // Tour.pages = [...Tour.pages, page];
        setHtmlPages(v => [...v, page]);
        // Tour.pages.push(page);
        forceUpdate();
    }, []);

    const handlePageRemove = useCallback((page: Page) => {
        setHtmlPages(v => v.filter(v => v !== page));
        // Tour.pages.splice(Tour.pages.findIndex(v => v.id === page.id)!, 1);
        forceUpdate();
    }, []);

    const handleInitialDirectionClick = useCallback(() => {
        if (currentPageScroll !== undefined) {
            update(pages.find(v => v.id === pageContext.currentPage?.id)!.withInitialDirection(currentPageScroll * 100));
        }
    }, [pages, pageContext.currentPage?.id, currentPageScroll, update]);

    const {
        handleCentralPositionsAddClick,
        handleCentralPositionRemove,
        handleCentralPositionChange,
    } = useCentralPositions(currentPage, update);

    return (
        <Modal onHide={hide} show={visibility} fullscreen className="TourPreviewDialog">
            <Modal.Header>
                <Modal.Title>{t("title")}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="Body">
                <div className="schul-tour" data-color-theme="light" data-tour-mode="inline">
                    {pages.map(pageData =>
                        <TourPage key={pageData.id} pageData={pageData} onChange={update}
                                  addPage={handlePageAdd} removePage={handlePageRemove}
                                  onCurrentScrollChange={pageContext.currentPage?.id === pageData.id ? setCurrentPageScroll : undefined}/>,
                    )}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant={"info"} onClick={handleInitialDirectionClick}>Set initial Direction</Button>
                <Button variant="success" onClick={save}>{tGlob("save")}</Button>
                <Button variant="primary" onClick={saveAndHide}>
                    {[tGlob("save"), tGlob("and"), tGlob("exit")].join(" ")}
                </Button>
                <Button onClick={reset} variant={"danger"}>{tGlob("reset")}</Button>
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
    /**
     * @param scrollPercent range 0 - 100 like initial direction for current scroll
     */
    onCurrentScrollChange?: (scrollPercent: number) => void;
}

const TourPage = memo(function ({pageData, onChange, addPage, removePage, onCurrentScrollChange}: TourPageProps) {
    const pageContainerRef = useRef<HTMLSpanElement>(null);
    const dispatch = useAppDispatch();
    const pageContext = useContext(PageContext);
    const [page, setPage] = useState<Page>();
    const [pageScroll, setPageScroll] = useState<number>();
    const pageScrollRef = useRef<number>();

    const handleChange = useCallback((changes: Partial<DataType<PageData>>) => {
        onChange(pageData.withUpdate(changes));
    }, [pageData, onChange]);

    const handleInlineObjectEditClick = useCallback((index: number, inlineObject: InlineObjectData) => {
        dispatch(set([inlineObject, index]));
        dispatch(showDialog("inlineObjectEdit"));
    }, []);

    useEffect(() => {
        if (page) {
            page.handleUpdate = handleChange;
            page.handleInlineObjectEditClick = handleInlineObjectEditClick;
            page.onCurrentPageChange = pageContext.setCurrentPage;
            page.onScroll = setPageScroll;
        }
    }, [handleChange, handleInlineObjectEditClick, pageContext.setCurrentPage, page]);

    useEffect(() => {
        if (pageScroll) {
            onCurrentScrollChange?.(pageScroll);
            pageScrollRef.current = pageScroll;
        }
        // if (page) {
        //     page.html.scrollLeft(pageScroll);
        // }
    }, [pageScroll]);

    useEffect(() => {
        console.log("add remove");
        if (page) {
            pageContainerRef.current!.append(page.html[0]);
            addPage(page);
            return () => {
                removePage(page);
                pageContainerRef.current?.removeChild(page.html[0]);
            };
        }
    }, [page, addPage, removePage]);

    useEffect(() => {
        // if (!page?.data.equalsIgnoringInlineObjectPos(pageData)) {
        console.log("not equal");
        const page = Page.from(pageData, pageContext.tourConfig, pageScrollRef.current && pageScrollRef.current * 100);
        // if (pageScrollRef.current) {
        //     page.initial_direction = pageScrollRef.current;
        // }
        // page.initial_direction = pageScroll;
        setPage(page);
        //
        // pageContainerRef.current!.append(page.html[0]);
        // return () => {
        //     pageContainerRef.current?.removeChild(page.html[0]);
        // };
        // }
    }, [pageData]);

    return (
        <span ref={pageContainerRef}></span>
    );
}, (props, prevProps) => props.pageData.equals(prevProps.pageData));

export default TourPreview;
