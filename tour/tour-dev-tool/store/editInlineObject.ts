import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {InlineObjectData} from "../../Data";

type InlineObjectDialogType = {
    data: InlineObjectData | undefined,
    index: number,
};

const initialState: InlineObjectDialogType = {
    data: undefined,
    index: 0,
};

const inlineObjectDialogSlice = createSlice({
    name: "inlineObjectDialog",
    initialState: initialState,
    reducers: {
        set(state, action: PayloadAction<[InlineObjectData, number | undefined]>) {
            state.data = action.payload[0];
            state.index = action.payload[1] ?? state.index;
        },
        reset(state) {
            state.data = undefined;
            state.index = 0;
        },
    },
});

export default inlineObjectDialogSlice.reducer;
export const {set, reset} = inlineObjectDialogSlice.actions;
