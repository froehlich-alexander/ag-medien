import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {FileData} from "../../Data";

interface MediaPreviewState {
    value: FileData|undefined,
    present: boolean,
}

const initialState: MediaPreviewState= {
    value: undefined,
    present: false,
};

const mediaPreviewSlice = createSlice({
    initialState: initialState,
    name: "mediaPreview",
    reducers: {
        set: (state, action: PayloadAction<FileData>) => {
            state.value = action.payload;
            state.present = true;
        },
        reset: state => {
            state.value = undefined;
            state.present = false;
        },
    },
});

export const {set} = mediaPreviewSlice.actions;
export default mediaPreviewSlice.reducer;
