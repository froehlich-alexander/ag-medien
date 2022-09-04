import {configureStore} from "@reduxjs/toolkit";
import dialogReducer from "./store/dialog";
import editInlineObjectReducer from "./store/editInlineObject";
import mediaPreviewReducer from "./store/mediaPreview";

const store = configureStore({
    reducer: {
        mediaPreview: mediaPreviewReducer,
        dialog: dialogReducer,
        currentInlineObject: editInlineObjectReducer,
    },
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
