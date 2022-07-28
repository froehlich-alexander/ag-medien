import {Modal as BSModal, Toast as BSToast} from "bootstrap";
import classNames from "classnames";
import React, {
    ChangeEvent,
    ChangeEventHandler,
    createRef,
    HTMLProps,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "react";
import {Component} from "react";
import {Button, CloseButton, Modal, Toast, ToastContainer} from "react-bootstrap";
import {FALSE} from "sass";
import {ColorScheme, ColorSchemeData, ColorSchemeFragment} from "../color-base/colorpickerBackend";
import ColorPickerService from "../color-base/ColorPickerService";
import ColorSchemeDropdownMenu from "../ColorSchemeDropdownMenu";
import {ColorSchemeDuplicate} from "../Exceptions";
import {DefaultProps, Form} from "../utils";
import ExportDialog, {ColorSchemesFile} from "./Export";

export class ColorSchemeFileInfo {
    public readonly colorScheme: ColorScheme;
    public readonly fileName: string;
    public readonly fileHash: number;

    constructor(colorScheme: ColorScheme, fileName: string, fileHash: number) {
        this.colorScheme = colorScheme;
        this.fileName = fileName;
        this.fileHash = fileHash;
    }
}

export function hashFileContent(filename: string, content: string): number {
    return hash(filename + content);
}

function hash(str: string, seed = 0): number {
    // source https://github.com/bryc/code/blob/master/jshash/experimental/cyrb53.js
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

interface MyToastProps extends HTMLProps<HTMLDivElement> {
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

function MyToast(
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
    }: MyToastProps) {
    const element = useRef<HTMLDivElement>(null);
    const toast = useRef<BSToast>();
    const lastReopen = useRef<number>(Date.now());

    useEffect(() => {
        // create bs objects
        toast.current = BSToast.getOrCreateInstance(element.current!);

        function showToast() {
            onVisibilityChange?.(true);
            onShow?.();
        }

        function hideToast() {
            onVisibilityChange?.(false);
            onClose?.();
        }

        // bind events
        element.current!.addEventListener("show.bs.toast", showToast);
        element.current!.addEventListener("hide.bs.toast", hideToast);

        return () => {
            // remove event listener
            element.current!.removeEventListener("show.bs.toast", showToast);
            element.current!.removeEventListener("hide.bs.toast", hideToast);
        };
    }, []);

    useEffect(() => {
        if (show) {
            if (reopen != null && reopen > lastReopen.current) {
                toast.current!.hide();
                lastReopen.current = reopen;
            }
            toast.current!.show();
        } else {
            lastReopen.current = Date.now();
            toast.current!.hide();
        }
    }, [show, reopen]);

    return (
        <div className={classNames(animation && "toast fade", className)}
             ref={element}
             data-bs-autohide={autohide}
             data-bs-delay={delay}
             role="alert"
             aria-live="assertive"
             aria-atomic="true"
             {...others}>
        </div>
    );
}

MyToast.defaultProps = {
    animation: true,
} as MyToastProps;

interface ImportDialogProps extends DefaultProps {
    allColorSchemes: ColorScheme[],
    onColorSchemeImport: (colorSchemes: ColorSchemeFragment[]) => any,
    // /** Used to create Color Schemes */
    // service: ColorPickerService,
    /** whether the dialog is shown (true) or hidden (false) */
    show: boolean,
    onVisibilityChange: (visibility: boolean) => any,
    // the duration (in ms) the warning toast will appear
    toastWarningDuration?: number,
}

interface ImportDialogState {
    // CSs which can be selected by the user
    colorSchemesFromFile: ColorScheme[],
    invalidColorSchemesFromFile: ColorSchemeFileInfo[],
    // color schemes chosen by the user which will be imported
    selectedColorSchemes: Set<string>,
    badFilesNames: string[],
    // the timestamp when the file input was last modified
    // use this.filesUpdated() to get a boolean value
    filesUpdated: boolean,
}

function ImportDialog(props: ImportDialogProps) {
    const modal = createRef<HTMLDivElement>();
    const badFileToast = useRef<HTMLDivElement>(null);
    const invalidColorSchemesToast = useRef<HTMLDivElement>(null);

    // private updatedRecognised = false;
    // a counter to generate unique ids
    let nextColorSchemeId = 0;

    // static defaultProps = {
    //     toastWarningDuration: 5000,
    // };

    // constructor(props: ImportDialogProps) {
    //     super(props);
    //     this.state = {
    //         colorSchemesFromFile: [],
    //         invalidColorSchemesFromFile: [],
    //         selectedColorSchemes: new Set(),
    //         badFilesNames: [],
    //         filesUpdated: false,
    //     };
    // }

    const [colorSchemesFromFile, setColorSchemesFromFile] = useState<ColorScheme[]>([]);
    const [invalidColorSchemesFromFile, setInvalidColorSchemesFromFile] = useState<ColorSchemeFileInfo[]>([]);
    const [selectedColorSchemes, setSelectedColorSchemes] = useState<Set<string>>(new Set());
    const [badFilesNames, setBadFilesNames] = useState<string[]>([]);
    const [lastFilesUpdated, setLastFilesUpdated] = useState<number>(0);
    // Toasts
    const [badFilesToastVisibility, setBadFilesToastVisibility] = useState(false);
    const [invalidColorSchemesToastVisibility, setInvalidColorSchemesToastVisibility] = useState(false);

    return (
        <Modal className={props.className}
               centered
               tabIndex={-1}
               ref={modal}
               aria-label="Dialog to import color schemes"
               aria-hidden={true}
               show={props.show}
               id="color-scheme-import-dialog">
            <Modal.Header>
                <Modal.Title>Import Color schemes</Modal.Title>
                <CloseButton onClick={handleClose} aria-label="Close"></CloseButton>
            </Modal.Header>
            <Modal.Body>
                <Form action="javascript:void(0)"
                      onSubmit={importColorSchemes}
                      id="import-dialog-form"
                      className="row g-4">
                    <div className={"input-group"}>
                        <label htmlFor="import-dialog-file-input"
                               className="input-group-text">
                            Color Schemes File
                        </label>
                        <input type="file"
                               id="import-dialog-file-input"
                               className="form-control"
                               required
                               accept={".color-schemes"}
                               onChange={handleFileInputChange}
                               multiple
                        />
                        <span
                            className="form-text">The files should be generated by this Color Picker and end with <strong>.color-schemes</strong></span>
                        <div className="invalid-feedback">You need to select at least one file</div>
                        <ToastContainer position="bottom-end" containerPosition="fixed">
                            {/*Bad Files Toast*/}
                            <MyToast show={badFilesToastVisibility}
                                     reopen={lastFilesUpdated}
                                     autohide={true}
                                     onVisibilityChange={setBadFilesToastVisibility}
                                     ref={badFileToast}>
                                <Toast.Header closeButton={true} closeLabel="Close">
                                    <strong className="text-danger me-auto">File Error</strong>
                                    <small>now</small>
                                </Toast.Header>
                                <Toast.Body>
                                    <p>The following files do not contain valid data, so they were
                                        removed
                                        from
                                        the selection:</p>
                                    <ul>
                                        {badFilesNames.map(v => <li key={v}>{v}</li>)}
                                    </ul>
                                </Toast.Body>
                            </MyToast>
                            {/*Invalid Color Schemes Toast*/}
                            <MyToast reopen={lastFilesUpdated}
                                     show={invalidColorSchemesToastVisibility}
                                     onVisibilityChange={setInvalidColorSchemesToastVisibility}
                                     ref={invalidColorSchemesToast}>
                                <Toast.Header closeButton={true} closeLabel="Close Button">
                                    <strong className="text-warning me-auto">Color Schemes
                                        skipped</strong>
                                    <small>now</small>
                                </Toast.Header>
                                <Toast.Body>
                                    <p>{invalidColorSchemesFromFile.length} Color Schemes
                                        were skipped because an equal Color Scheme already exists. Maybe
                                        you have re-imported a file?</p>
                                </Toast.Body>
                            </MyToast>
                        </ToastContainer>
                    </div>
                    <ColorSchemeDropdownMenu
                        className="col-12"
                        hasHeaders={false}
                        colorSchemes={colorSchemesFromFile}
                        multiple
                        newButton={false}
                        formText="Select the Color Schemes to import"
                        disablePlaceholderIfNoCustomCS={true}
                        selectedColorSchemes={selectedColorSchemes}
                        oneItemRequired={true}
                        onColorSchemeSelected={setSelectedColorSchemes}/>
                    {/*<div className={"input-group col-12"}>*/}
                    {/*    <label className={"input-group-text"} htmlFor={"mimetype-select"}>*/}
                    {/*        Export as*/}
                    {/*    </label>*/}
                    {/*    <select name={"mimetype"}*/}
                    {/*            id={"mimetype-select"}*/}
                    {/*            className={"form-select"}*/}
                    {/*            value={this.state.mimeType}*/}
                    {/*            required*/}
                    {/*            onChange={this.handleMimeTypeChange}>*/}
                    {/*        <option value={"application/json"}>JSON</option>*/}
                    {/*        <option value={"application/xml"}>XML</option>*/}
                    {/*    </select>*/}
                    {/*    <span className={"form-text col-12"}>The filetype to export the color schemes</span>*/}
                    {/*</div>*/}
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Close</Button>
                <Button type="submit"
                        form="import-dialog-form"
                        variant="primary">
                    Import
                </Button>
            </Modal.Footer>
        </Modal>
    );

    // const handleColorSchemeSelected = (selectedColorSchemes: Set<string>) => {
    //     this.setState({
    //         selectedColorSchemes: selectedColorSchemes,
    //     });
    // };

    function handleFileInputChange(event: ChangeEvent<HTMLInputElement>) {
        // this is used to create a mutable FileList which is then assigned to the file input
        const dataTransfer = new DataTransfer();
        const badFiles: string[] = [];

        Promise.all(Array.from(event.target.files!).map(file => file.text()
            .then(text => new Promise<ColorSchemesFile>((resolve, reject) => {
                try {
                    resolve(JSON.parse(text));
                } catch (e) {
                    reject(e);
                }
            })
                .then(v => v.colorSchemes.map(v => ColorScheme.fromJSON(v).withUpdate({
                    current: false,
                    preDefined: false,
                    id: (++nextColorSchemeId).toString(),
                })))
                .then(value => {
                    // this.setState(state => ({colorSchemesFromFile: state.colorSchemesFromFile.concat(value)}));
                    dataTransfer.items.add(file);
                    let fileHash = hashFileContent(file.name, text);
                    return value.map(cs => new ColorSchemeFileInfo(cs, file.name, fileHash));
                })
                .catch((e) => {
                    if (e instanceof SyntaxError) {
                        console.log("error caught");
                        badFiles.push(file.name);
                        // this.setState(state => ({
                        //     badFilesNames: state.badFilesNames.concat(file.name),
                        // }));
                    } else {
                        throw e;
                    }
                }))))
            .then(colorSchemes => ([] as ColorSchemeFileInfo[]).concat(...colorSchemes.filter((v): v is Exclude<typeof v, void> => v != null)))
            // filter CSs
            .then(colorSchemes => Promise.allSettled(
                colorSchemes.map(cs => new Promise<ColorSchemeFileInfo>((resolve, reject) => {
                    // if same CS already here
                    if (props.allColorSchemes.some(v => cs.colorScheme.equalsFragment(v)) ||
                        colorSchemesFromFile.some(v => cs.colorScheme.equalsFragment(v))) {
                        reject(new ColorSchemeDuplicate(cs));
                    }
                    resolve(cs);
                }))))
            // aggregate valid and invalid CSs
            .then(values => ({
                valid: values.filter((v): v is PromiseFulfilledResult<Awaited<Promise<ColorSchemeFileInfo>>> => v.status === "fulfilled").map(v => v.value),
                invalid: values.filter((v): v is PromiseRejectedResult => v.status === "rejected").map(v => {
                    console.log(v);
                    return (v.reason as ColorSchemeDuplicate).colorScheme;
                }),
            }))
            .then(colorSchemes => {
                // console.log("bad files:", badFiles.map(v => v.name));
                console.log("all resolved", colorSchemes.valid, colorSchemes.invalid, badFiles);
                setColorSchemesFromFile(prevState => prevState.concat(colorSchemes.valid.map(v => v.colorScheme)));
                setInvalidColorSchemesFromFile(colorSchemes.invalid);
                setBadFilesNames(badFiles);
                setBadFilesToastVisibility(badFiles.length > 0);
                setInvalidColorSchemesToastVisibility(colorSchemes.invalid.length > 0);
                setLastFilesUpdated(Date.now());
                // this.setState(state => ({
                //     // colorSchemesFromFile: state.colorSchemesFromFile.concat(colorSchemes.valid.map(v => v.colorScheme)),
                //     invalidColorSchemesFromFile: colorSchemes.invalid,
                //     badFilesNames: badFiles,
                //     filesUpdated: true,
                // }));
                event.target.files = dataTransfer.files;
                // this.setState({
                //     badFilesNames: badFiles.map(v => v.name),
                //     hasBadFile: badFiles.length > 0,
                // });
            });
    }

    function handleClose() {
        props.onVisibilityChange(false);
    }

    // useEffect(() => {
    //     // create bs objects
    //     BSBadFileToast = new BSToast(badFileToast.current!);
    //     BSInvalidColorSchemesToast = new BSToast(invalidColorSchemesToast.current!);
    //
    //     function showBadFilesToast() {
    //         setBadFilesToastVisible(true);
    //     }
    //
    //     function hideBadFilesToast() {
    //         setBadFilesToastVisible(false);
    //     }
    //
    //     function showInvalidColorSchemesToast() {
    //         setInvalidColorSchemesToastVisible(true);
    //     }
    //
    //     function hideInvalidColorSchemesToast() {
    //         setInvalidColorSchemesToastVisible(false);
    //     }
    //
    //     // bind events
    //     badFileToast.current!.addEventListener("show.bs.toast", showBadFilesToast);
    //     badFileToast.current!.addEventListener("hide.bs.toast", hideBadFilesToast);
    //     invalidColorSchemesToast.current!.addEventListener("show.bs.toast", showInvalidColorSchemesToast);
    //     invalidColorSchemesToast.current!.addEventListener("hide.bs.toast", hideInvalidColorSchemesToast);
    //
    //     return () => {
    //         // remove event listener
    //         badFileToast.current!.removeEventListener("show.bs.toast", showBadFilesToast);
    //         badFileToast.current!.removeEventListener("hide.bs.toast", hideBadFilesToast);
    //         invalidColorSchemesToast.current!.removeEventListener("show.bs.toast", showInvalidColorSchemesToast);
    //         invalidColorSchemesToast.current!.removeEventListener("hide.bs.toast", hideInvalidColorSchemesToast);
    //     };
    // }, []);
    //
    // // public componentDidMount(): void {
    // //     // new BSModal(this.modal.current!);
    // //     new BSToast(this.badFileToast.current!);
    // //     new BSToast(this.invalidColorSchemesToast.current!);
    // // }
    // useEffect(() => {
    //     if (badFilesToastVisible) {
    //         BSBadFileToast.show();
    //     } else {
    //         BSBadFileToast.hide();
    //     }
    // }, [badFilesToastVisible]);
    //
    // useEffect(() => {
    //     if (invalidColorSchemesToastVisible) {
    //         BSInvalidColorSchemesToast.show();
    //     } else {
    //         BSInvalidColorSchemesToast.hide();
    //     }
    // }, [invalidColorSchemesToastVisible]);

//     componentDidUpdate(prevProps
// :
//     Readonly < ImportDialogProps >, prevState;
// :
//     Readonly < ImportDialogState >, snapshot ? : any;
// ):
//     void {
    // if (this.state.badFilesNames.length && (this.state.badFilesNames.length !== prevState.badFilesNames.length ||
    //     !this.state.badFilesNames.map(v => prevState.badFilesNames.includes(v)).reduce((prev, now) => prev && now, true))) {
    //     console.log("update toast");
    //     Toast.getInstance(this.badFileToast.current!)!.show();
    // }
    //
    // let invalidCSs = this.state.invalidColorSchemesFromFile;
    // const preInvalidCSs = prevState.invalidColorSchemesFromFile;
    // if (invalidCSs.length > 0 && (invalidCSs.length != preInvalidCSs.length || !invalidCSs.map(v => preInvalidCSs.includes(v)).reduce((prev, now) => prev && now, true))) {
    //     Toast.getInstance(this.invalidColorSchemesToast.current!)!.show();
    // }
    // return;
    // if (this.props.show != prevProps.show) {
    //     const modal = BSModal.getInstance(this.modal.current!)!;
    //     if (this.props.show) {
    //         modal.show();
    //     } else {
    //         modal.hide();
    //     }
    // }
    //
//         if(this.state.filesUpdated && !this.updatedRecognised
// )
//     {
//         if (this.state.invalidColorSchemesFromFile.length) {
//             BSToast.getInstance(this.invalidColorSchemesToast.current!)!.show();
//         }
//         if (this.state.badFilesNames.length) {
//             console.log(this.badFileToast.current);
//             BSToast.getOrCreateInstance(this.badFileToast.current!)!.show();
//         }
//         this.updatedRecognised = true;
//     }
// }

    // function filesUpdated(): boolean {
    //     return this.state.filesUpdated > (Date.now() + this.props.toastWarningDuration!);
    // }

    function importColorSchemes() {
        props.onColorSchemeImport(colorSchemesFromFile.filter(v => selectedColorSchemes.has(v.id))
            .map(v => v.toFragment()));
        setColorSchemesFromFile(prevState => prevState.filter(v => !selectedColorSchemes.has(v.id)));
        setSelectedColorSchemes(new Set());
        // this.setState(state => ({
        //     // remove all color schemes passed to the parent
        //     colorSchemesFromFile: state.colorSchemesFromFile.filter(v => !this.state.selectedColorSchemes.has(v.id)),
        //     selectedColorSchemes: new Set<string>(),
        // }), () => this.updatedRecognised = false);
    }
}

export default ImportDialog;