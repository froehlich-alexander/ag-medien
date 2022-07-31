import bootstrap from "bootstrap";
import classNames from "classnames";
import {Button, CloseButton, Toast as ReactToast, ToastHeaderProps} from "react-bootstrap";
import React, {createRef, HTMLProps, useEffect, useMemo, useRef} from "react";

interface ToastProps extends HTMLProps<HTMLDivElement> {
    show: boolean,
    animation?: boolean,
    onClose?: () => any,
    onShow?: () => any,
    onVisibilityChange?: (visibility: boolean) => any,
    autohide?: boolean,
    delay?: number,
    // timestamp when the toast should (or has) hide and then reopen
    reopen?: number,
}

type ToastDefaultProps =
    ToastProps
    & { [k in keyof Pick<ToastProps, "reopen" | "animation">]-?: ToastProps[k] };

/**
 * A custom Toast<br>
 * You can use data-bs-toggle="toast" on this,
 * but <b>every hide attempt will be canceled while the toast is reopening</b>
 * if it is triggered via data-bs...<br>
 * {@link reopen} parameter: set to a timestamp that is newer than the last timestamp provided to hide and reopen the toast ({@link show} must be true)
 * @constructor
 */
export function Toast(
    {
        reopen,
        className,
        animation,
        show,
        onShow,
        onClose,
        onVisibilityChange,
        autohide,
        delay,
        ...others
    }: ToastDefaultProps) {
    // Ref to the toast HTML element
    const element = createRef<HTMLDivElement>();
    // Ref to the bootstrap toast
    const toast = useRef<bootstrap.Toast>();
    // Ref to the timestamp when the toast was reopened the last time
    const lastReopen = useRef<number>(0);
    // Ref to get the real state of the toast
    const toastIsShown = useRef(false);
    // the toast is currently animating a visibility,
    // so no other visibility will be set until the previous one has finished
    const toastIsChangingVis = useRef(false);
    // Ref to access real time reopen prop in hiddenToast
    const reopenRef = useRef<number>(reopen);

    /**
     * when we are reopening, we cancel all hide attempts (like the one from autohide) that are not called withing this component
     * @see hidingOk
     **/
    const reopeningRunning = useRef(false);

    // used to distinguish between "good" and "bad" hide attempts (bad == coming via autohide or data-bs-toggle)
    const hidingOk = useRef(false);

    const showScheduled = useRef(false);
    const hideScheduled = useRef(false);

    useEffect(() => {
        // update reopen ref
        reopenRef.current = reopen;
    }, [reopen]);

    // componentDidMount
    useEffect(() => {
        // create bs objects
        toast.current = bootstrap.Toast.getOrCreateInstance(element.current!);

        function handleShow(event: Event) {
            // skip if toast is shown or currently changing visibility
            if ((toastIsShown.current && !toastIsChangingVis.current) || toastIsChangingVis.current) {
                // no need to schedule if toast is already shown (first part of the if clause above is true)
                showScheduled.current = toastIsChangingVis.current;
                event.preventDefault();
                event.stopPropagation();
                return;
            }
            toastIsChangingVis.current = true;
            onVisibilityChange?.(true);
            onShow?.();
        }

        function handleHide(event: Event) {
            // cancel everything (that does not come from calling hideToast()) while reopening
            if (!hidingOk.current && reopeningRunning.current) {
                event.preventDefault();
                event.stopPropagation();
                return;
            }
            // skip if toast is hidden or currently changing visibility
            if ((!toastIsShown.current && !toastIsChangingVis.current) || toastIsChangingVis.current) {
                // no need to schedule if toast is already hidden (first part of the if clause above is true)
                hideScheduled.current = toastIsChangingVis.current;
                event.preventDefault();
                event.stopPropagation();
                return;
            }
            toastIsChangingVis.current = true;
            onVisibilityChange?.(false);
            onClose?.();
            // console.log("toast hiding", event);
        }

        function handleHidden() {
            toastIsShown.current = false;
            hideScheduled.current = false;
            toastIsChangingVis.current = false;
            // console.log("hidden", reopenRef.current, lastReopen.current);
            // show toast if reopen is newer than last reopen
            // if (reopenRef.current > lastReopen.current) {
            //     lastReopen.current = reopenRef.current;
            //     showToast();
            //     console.log("hidden reopen > ");
            // }
            // show if schedules
            if (showScheduled.current) {
                showToast();
            }
        }

        function handleShown() {
            toastIsShown.current = true;
            toastIsChangingVis.current = false;
            // reopening is always finished if showing is finished (does not matter if it was never true)
            reopeningRunning.current = false;
            showScheduled.current = false;
            // hide if scheduled
            if (hideScheduled.current) {
                hideToast();
            }
        }

        // bind events
        element.current!.addEventListener("show.bs.toast", handleShow);
        element.current!.addEventListener("shown.bs.toast", handleShown);
        element.current!.addEventListener("hide.bs.toast", handleHide);
        element.current!.addEventListener("hidden.bs.toast", handleHidden);

        const element1 = element.current!;

        return () => {
            hideToast();
            // remove event listener
            element1.removeEventListener("show.bs.toast", handleShow);
            element1.removeEventListener("shown.bs.toast", handleShown);
            element1.removeEventListener("hide.bs.toast", handleHide);
            element1.removeEventListener("hidden.bs.toast", handleHidden);
        };
    }, []);

    useEffect(() => {
        if (show) {
            if (reopen > lastReopen.current) {
                if (!reopeningRunning.current) {
                    reopeningRunning.current = true;
                    lastReopen.current = reopen;
                    hideToast();
                    showToast();
                }
                // if (toastIsShown.current) {
                //     reopeningRunning.current = true;
                //     // hide toast and show it in hidden callback
                //     hideToast();
                //     console.log("hide reopen");
                //
                // } else {
                //     // show toast since it is already hidden
                //     showToast();
                //     console.log("show reopen");
                //     lastReopen.current = reopen;
                // }
            } else {
                showToast();
                // console.log("show");
            }
        } else {
            hideToast();
            // console.log("hide");
        }
    }, [show, reopen]);

    // safely show the toast
    function showToast() {
        toast.current!.show();
    }

    // safely hide the toast
    function hideToast() {
        hidingOk.current = true;
        toast.current!.hide();
        hidingOk.current = false;
    }

    return (
        <div className={classNames("toast", className)}
             ref={element}
             data-bs-autohide={autohide}
             data-bs-delay={delay}
             data-bs-animation={animation}
             role="alert"
             aria-live="assertive"
             aria-atomic="true"
             {...others}>
        </div>
    );
}

Toast.defaultProps = {
    animation: true,
    reopen: 0,
} as ToastProps;

function ToastHeader(
    {
        className,
        closeLabel = "Close",
        closeButton = true,
        closeVariant,
        children,
        ...props
    }: Omit<ToastHeaderProps, "bsPrefix">) {
    return (
        <div className={classNames("toast-header", className)}
             {...props}>
            {children}
            {closeButton && <CloseButton variant={closeVariant}
                                         aria-label={closeLabel}
                                         data-bs-dismiss="toast"/>}
        </div>
    );
}

// copy static values so that you do not need to import Toast from react-bootstrap
Toast.Header = ToastHeader;
Toast.Body = ReactToast.Body;
