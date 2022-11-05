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
import {MaterialIcon} from "./utils";

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
    const [selectedCentralPosition, setSelectedCentralPosition] = useState<number>();

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

    // reset selected central position if current page changes
    useEffect(() => {
        setSelectedCentralPosition(undefined);
    }, [pageContext.currentPage?.id]);

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

    // const handleInitialDirectionClick = useCallback(() => {
    //     if (currentPageScroll !== undefined) {
    //         update(pages.find(v => v.id === pageContext.currentPage?.id)!.withInitialDirection(currentPageScroll * 100));
    //     }
    // }, [pages, pageContext.currentPage?.id, currentPageScroll, update]);

    const handleCentralPositionsModeClick = useCallback(() => {
        setCentralPositionsEditModeOn(!centralPositionsEditModeOn);
    }, [centralPositionsEditModeOn]);

    const {
        handleCentralPositionsAdd,
        handleCentralPositionRemove,
        handleCentralPositionChange,
    } = useCentralPositions(currentPage, update);

    const handleCentralPositionsAddWithValue = useCallback(() => {
        const currentHtmlPage = htmlPages.find(v => v.id === pageContext.currentPage!.id)!;
        handleCentralPositionsAdd(currentHtmlPage.getCurrentScroll());
    }, [handleCentralPositionsAdd, htmlPages]);

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
                                  centralPositionsMode={centralPositionsEditModeOn}
                                  onCentralPositionSelect={setSelectedCentralPosition}
                                  handleCentralPositionChange={handleCentralPositionChange}
                                  onCurrentScrollChange={pageContext.currentPage?.id === pageData.id ? setCurrentPageScroll : undefined}/>,
                    )}
                </div>
            </Modal.Body>
            <Modal.Footer>
                {centralPositionsEditModeOn && <>
                    <Button variant={"primary"} className={"d-flex"} onClick={handleCentralPositionsAddWithValue}>
                        <MaterialIcon icon="add"/>
                        New Central Position
                    </Button>
                    {selectedCentralPosition !== undefined &&
                        <Button className={"d-flex"} variant={"danger"}
                                onClick={() => handleCentralPositionRemove(selectedCentralPosition)}>
                            <MaterialIcon icon="delete"/>
                            {tGlob("delete")} selected Central Position
                        </Button>
                    }
                </>}

                <Button variant={"info"} className={'ms-auto'} onClick={handleCentralPositionsModeClick}>Edit Central Positions</Button>
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
    centralPositionsMode: boolean;
    onCentralPositionSelect: (index: number) => void,
    handleCentralPositionChange: (value: number, index: number) => void,
}

const TourPage = function (
    {
        pageData, onChange, addPage, removePage,
        onCurrentScrollChange, centralPositionsMode, onCentralPositionSelect, handleCentralPositionChange,
    }: TourPageProps) {
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
            page.onCentralPositionsSelect = onCentralPositionSelect;
            page.onCentralPositionChange = handleCentralPositionChange;
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

    useEffect(() => {
        if (page) {
            page.centralPositionsEditMode = centralPositionsMode;
        }
    }, [centralPositionsMode, page]);

    return (
        <span ref={pageContainerRef}></span>
    );
};
//, (props, prevProps) => props.pageData.equals(prevProps.pageData));

export default TourPreview;
