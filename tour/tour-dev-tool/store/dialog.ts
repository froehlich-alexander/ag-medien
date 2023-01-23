import {createSlice, PayloadAction} from "@reduxjs/toolkit";

type Dialogs = {
    import: boolean,
    media: boolean,
    unsavedChanges: boolean,
    mediaPreview: boolean,
    tourPreview: boolean,
    inlineObjectEdit: boolean,
};

const initialDialogs = {
    import: false,
    media: false,
    unsavedChanges: false,
    mediaPreview: false,
    tourPreview: false,
    inlineObjectEdit: false,
} as const;

interface DialogType extends Dialogs {
    openDialogsStack: Array<keyof Dialogs>,
}

const initialState: DialogType = {
    ...initialDialogs,
    openDialogsStack: [],
};

// dialogs which can be opened without closing the previous dialog
const dialogCanOpenMultiple: Array<keyof Dialogs> = [
    "inlineObjectEdit",
];

function _showDialog(state: DialogType, dialog: keyof Dialogs) {
    state[dialog] = true;
    if (state.openDialogsStack.at(-1) !== dialog) {
        state.openDialogsStack.push(dialog);
    }
    // hide every other dialog unless current dialog allows other dialogs in the background
    if (!dialogCanOpenMultiple.includes(dialog)) {
        for (let i of (Object.keys(initialDialogs) as Array<keyof Dialogs>)) {
            if (i !== dialog) {
                state[i] = false;
            }
        }
    }
}

function _hideDialog(state: DialogType, dialog: keyof Dialogs) {
    state[dialog] = false;
    state.openDialogsStack = state.openDialogsStack.filter(value => value !== dialog);
    if (state.openDialogsStack.length > 0) {
        _showDialog(state, state.openDialogsStack.at(-1)!);
    }
}

const dialogSlice = createSlice({
    initialState: initialState,
    name: "dialog",
    reducers: {
        showDialog: (state, action: PayloadAction<keyof Dialogs>) => {
            _showDialog(state, action.payload);
        },
        hideDialog: (state, action: PayloadAction<keyof Dialogs>) => {
            _hideDialog(state, action.payload);
        },
        setVisibility: (state, action: PayloadAction<[keyof Dialogs, boolean]>) => {
            if (action.payload[1]) {
                _showDialog(state, action.payload[0]);
            } else {
                _hideDialog(state, action.payload[0]);
            }
        },
    },
});

export default dialogSlice.reducer;
export const {setVisibility, showDialog, hideDialog} = dialogSlice.actions;
