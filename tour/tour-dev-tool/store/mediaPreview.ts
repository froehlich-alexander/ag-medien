import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {FileData} from "../../Data";

interface MediaPreviewState {
    value: FileData | undefined,
    index: number,
    length: number,
}

const initialState: MediaPreviewState = {
    value: undefined,
    index: 0,
    length: 0,
};

const mediaPreviewSlice = createSlice({
    initialState: initialState,
    name: "mediaPreview",
    reducers: {
        set: (state, action: PayloadAction<[FileData, readonly FileData[]]>) => {
            state.value = action.payload[0];
            state.index = action.payload[1].findIndex(v => v.equals(action.payload[0]));
            state.length = action.payload[1].length;
        },
        reset: state => {
            state.value = undefined;
            state.length = 0;
            state.index = 0;
        },
        next: (state, action: PayloadAction<readonly FileData[]>) => {
            const index = action.payload.findIndex(v => v.equals(state.value));
            if (index >= 0) {
                if (action.payload.length > index + 1) {
                    state.value = action.payload[index + 1];
                    state.index = index + 1;
                } else {
                    // start item
                    state.value = action.payload[0];
                    state.index = 0;
                }
                state.length = action.payload.length;
            } else {
                console.warn("could not find file in media list");
            }
        },
        prev: (state, action: PayloadAction<readonly FileData[]>) => {
            const index = action.payload.findIndex(v => v.equals(state.value));
            if (index >= 0) {
                if (index > 0) {
                    state.value = action.payload[index - 1];
                    state.index = index - 1;
                } else {
                    // end item
                    state.value = action.payload.at(-1);
                    state.index = action.payload.length - 1;
                }
                state.length = action.payload.length;
            } else {
                console.warn("could not find file in media list");
            }
        },
    },
});

export const {set, reset, next, prev} = mediaPreviewSlice.actions;
export default mediaPreviewSlice.reducer;
